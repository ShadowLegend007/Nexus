/**
 * Formats a 12-digit hex string into XXXX-XXXX-XXXX readability structure.
 * @param {string} hexId 
 * @returns {string} Formatted hex string
 */
export function formatHexId(hexId) {
  if (!hexId) return '';
  // Remove existing dashes
  const clean = hexId.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  // Chunk into groups of 4
  const chunks = clean.match(/.{1,4}/g);
  return chunks ? chunks.join('-') : clean;
}

/**
 * Strips formatting dashes from Hex ID string for storage or query.
 * @param {string} formattedHex 
 * @returns {string} 12-character raw Hex ID
 */
export function stripHexId(formattedHex) {
  if (!formattedHex) return '';
  return formattedHex.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
}

/**
 * Robust copy-to-clipboard utility.
 * Supports modern Secure Context Clipboard APIs and falls back to a temporary textarea element for HTTP development contexts.
 * @param {string} text 
 * @returns {Promise<void>}
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Legacy fallback using textarea copy buffer
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          resolve();
        } else {
          reject(new Error('Browser fallback copy command returned false'));
        }
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }
}

