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
