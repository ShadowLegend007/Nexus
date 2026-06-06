// ─── Features ────────────────────────────────────────────────────────────────
export const features = [
  {
    id: 'hex-id',
    title: 'Anonymous Hex Identity',
    description:
      'No phone number, no email. Your identity is a 256-bit cryptographic Hex key — nothing more, nothing less.',
    accent: '#ffffff',
    size: 'large', // spans 2 cols
  },
  {
    id: 'ai-shield',
    title: 'AI Threat Shield',
    description:
      'Every file and attachment passes through a dual-tier ML pipeline detecting exploits before they reach your device.',
    accent: '#cccccc',
    size: 'normal',
  },
  {
    id: 'zero-knowledge',
    title: 'Zero-Knowledge Messaging',
    description:
      'Messages are end-to-end encrypted client-side. Our servers only relay ciphertext.',
    accent: '#aaaaaa',
    size: 'normal',
  },
  {
    id: 'malware',
    title: 'Malware Detection',
    description:
      'Sandboxed heuristic analysis blocks ransomware, trojans, and zero-days in real time.',
    accent: '#dddddd',
    size: 'normal',
  },
  {
    id: 'file-transfer',
    title: 'Secure File Transfer',
    description:
      'Chunked, encrypted, verified. Files arrive intact and clean — or they do not arrive at all.',
    accent: '#ffffff',
    size: 'normal',
  },
  {
    id: 'quantum',
    title: 'Quantum-Ready Encryption',
    description:
      'Post-quantum key encapsulation ensures your conversations stay private even against future threats.',
    accent: '#aaaaaa',
    size: 'large',
  },
];

// ─── Stats ───────────────────────────────────────────────────────────────────
export const stats = [
  { value: 50, suffix: 'M+', label: 'Protected Messages' },
  { value: 99.999, suffix: '%', label: 'Uptime SLA', decimals: 3 },
  { value: 2, suffix: 'M+', label: 'Threats Blocked' },
  { value: 150, suffix: '+', label: 'Countries Served' },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const faqs = [
  {
    q: 'How does the Hex identity system work?',
    a: 'When you register, a 256-bit cryptographic key pair is generated entirely in your browser. The public half becomes your Hex ID — a shareable address that contains no personal information. Your private key never leaves your device.',
  },
  {
    q: 'Can Nexus staff read my messages?',
    a: 'No. Messages are encrypted client-side before transmission. Our servers only ever see ciphertext. This is enforced by architecture, not just policy — there is no mechanism that would allow us to decrypt your conversations.',
  },
  {
    q: 'What does the AI threat scan actually do?',
    a: 'Every incoming file passes through a sandboxed two-stage pipeline: a fast signature-based pre-filter and a slower heuristic behaviour analyser that detects novel exploits. Files that fail either stage are quarantined before reaching your client.',
  },
  {
    q: 'Is Nexus quantum-resistant?',
    a: 'Yes. Key exchange uses CRYSTALS-Kyber (a NIST-standardised post-quantum KEM) alongside classical ECDH, so the channel is secure even if a large-scale quantum computer is available to an adversary.',
  },
  {
    q: 'What happens to my data if I delete my account?',
    a: 'Account deletion triggers an immediate cryptographic wipe of all associated ciphertext and metadata across all replicas. Because we hold no encryption keys, the data becomes permanently unrecoverable.',
  },
];

// ─── Architecture steps ───────────────────────────────────────────────────────
export const archSteps = [
  { label: 'Your Device', sub: 'Client-side key generation & encryption', color: '#ffffff' },
  { label: 'Encryption Layer', sub: 'AES-256-GCM + Kyber KEM', color: '#dddddd' },
  { label: 'AI Analysis Layer', sub: 'Dual-tier ML threat pipeline', color: '#bbbbbb' },
  { label: 'Zero-Knowledge Server', sub: 'Ciphertext relay — no plaintext ever', color: '#999999' },
  { label: 'Recipient', sub: 'Decryption happens on their device only', color: '#ffffff' },
];
