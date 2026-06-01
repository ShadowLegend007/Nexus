const crypto = require('crypto');

/**
 * Generates a 12-character random uppercase hexadecimal string.
 * @returns {string} 12-character hex code (e.g. "A1B2C3D4E5F6")
 */
function generateRawHex() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

/**
 * Generates a unique hexId by checking the database to ensure no collisions.
 * @returns {Promise<string>} Unique 12-character hex ID
 */
async function generateUniqueHexId() {
  // Lazily require User to prevent circular dependencies
  const User = require('../models/User');
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const hexId = generateRawHex();
    const existingUser = await User.findOne({ hexId });
    if (!existingUser) {
      return hexId;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate a unique Hex ID after multiple attempts');
}

module.exports = {
  generateRawHex,
  generateUniqueHexId,
};
