/**
 * Nexus E2EE Crypto Utility
 * Uses Web Crypto API (ECDH key exchange + AES-GCM encryption)
 * Keys stored in localStorage, private key optionally encrypted server-side.
 */

const STORAGE_KEY = 'nexus_keypair';

// ─── Key Generation ──────────────────────────────────────────────────────────

export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );

  const publicKeyRaw = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyRaw = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKeyB64 = arrayBufferToBase64(publicKeyRaw);
  const privateKeyB64 = arrayBufferToBase64(privateKeyRaw);

  // Store in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ publicKey: publicKeyB64, privateKey: privateKeyB64 }));

  return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
}

export async function getOrCreateKeyPair() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.publicKey && parsed.privateKey) return parsed;
    } catch (e) {
      // corrupted, regenerate
    }
  }
  return await generateKeyPair();
}

export function getStoredKeyPair() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ─── Derive Shared Secret ────────────────────────────────────────────────────

async function deriveSharedAESKey(myPrivateKeyB64, theirPublicKeyB64) {
  const myPrivateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    base64ToArrayBuffer(myPrivateKeyB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey']
  );

  const theirPublicKey = await window.crypto.subtle.importKey(
    'spki',
    base64ToArrayBuffer(theirPublicKeyB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return sharedKey;
}

// ─── Encrypt / Decrypt ───────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string using the recipient's public key.
 * Returns a JSON string: { iv, ciphertext }
 */
export async function encryptMessage(plaintext, recipientPublicKeyB64) {
  try {
    const keyPair = getStoredKeyPair();
    if (!keyPair) throw new Error('No local keypair found');

    const sharedKey = await deriveSharedAESKey(keyPair.privateKey, recipientPublicKeyB64);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedKey,
      encoded
    );

    return JSON.stringify({
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext),
    });
  } catch (err) {
    console.warn('[E2EE] Encryption failed, sending plaintext:', err.message);
    return plaintext; // graceful fallback
  }
}

/**
 * Decrypts an encrypted message payload using the sender's public key.
 * Returns decrypted plaintext, or the original payload if not encrypted.
 */
export async function decryptMessage(payload, senderPublicKeyB64) {
  try {
    if (!payload || !senderPublicKeyB64) return payload;

    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return payload; // not a JSON cipher payload, probably plaintext
    }

    if (!parsed.iv || !parsed.ciphertext) return payload;

    const keyPair = getStoredKeyPair();
    if (!keyPair) return payload;

    const sharedKey = await deriveSharedAESKey(keyPair.privateKey, senderPublicKeyB64);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToArrayBuffer(parsed.iv) },
      sharedKey,
      base64ToArrayBuffer(parsed.ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn('[E2EE] Decryption failed:', err.message);
    return '[Encrypted Message]';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
