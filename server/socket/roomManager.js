// In-memory mapping of userId -> socketId
const userSocketMap = new Map();

/**
 * Maps a userId to a socketId.
 * @param {string} userId 
 * @param {string} socketId 
 */
function addUser(userId, socketId) {
  userSocketMap.set(userId, socketId);
}

/**
 * Removes a socketId mapping.
 * @param {string} socketId 
 */
function removeSocket(socketId) {
  for (const [userId, mappedSocketId] of userSocketMap.entries()) {
    if (mappedSocketId === socketId) {
      userSocketMap.delete(userId);
      return userId;
    }
  }
  return null;
}

/**
 * Fetches the socketId for a userId.
 * @param {string} userId 
 * @returns {string|undefined}
 */
function getSocketId(userId) {
  return userSocketMap.get(userId);
}

/**
 * Returns if a user is currently online.
 * @param {string} userId 
 * @returns {boolean}
 */
function isUserOnline(userId) {
  return userSocketMap.has(userId);
}

/**
 * Returns all active mapped user IDs.
 * @returns {Array<string>}
 */
function getOnlineUsers() {
  return Array.from(userSocketMap.keys());
}

module.exports = {
  addUser,
  removeSocket,
  getSocketId,
  isUserOnline,
  getOnlineUsers,
};
