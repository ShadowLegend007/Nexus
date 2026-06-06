const roomManager = require('./roomManager');
const User = require('../models/User');
const Message = require('../models/Message');

let ioInstance = null;

function init(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client registers its userId
    socket.on('join', async ({ userId }) => {
      if (!userId) return;
      
      socket.userId = userId;
      roomManager.addUser(userId, socket.id);
      socket.join(userId); // Join room named after userId
      
      console.log(`User ${userId} joined room ${userId}`);

      try {
        // Find user hexId to announce online status
        const user = await User.findById(userId);
        if (user) {
          socket.hexId = user.hexId;
          // Broadcast to everyone that this user is online
          socket.broadcast.emit('user:online', { hexId: user.hexId });
        }
      } catch (err) {
        console.error('Error fetching user for online status:', err);
      }

      // Mark pending messages as delivered
      try {
        const pendingMessages = await Message.find({ receiverId: userId, deliveredAt: null });
        for (const msg of pendingMessages) {
          msg.deliveredAt = new Date();
          await msg.save();
          const senderRoom = msg.senderId.toString();
          io.to(senderRoom).emit('message:delivered', { messageId: msg._id, deliveredAt: msg.deliveredAt });
        }
      } catch (err) {
        console.error('Delivery tracking error:', err);
      }
    });

    // Handle typing events
    socket.on('typing:start', ({ conversationId, receiverHexId }) => {
      if (!socket.hexId || !receiverHexId) return;
      
      const cleanHex = receiverHexId.replace(/-/g, '').toUpperCase();
      User.findOne({ hexId: cleanHex }).then(receiver => {
        if (!receiver) return;
        
        const receiverSocketId = roomManager.getSocketId(receiver._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:start', {
            senderHexId: socket.hexId,
            conversationId
          });
        }
      }).catch(err => console.error(err));
    });

    socket.on('typing:stop', ({ conversationId, receiverHexId }) => {
      if (!socket.hexId || !receiverHexId) return;

      const cleanHex = receiverHexId.replace(/-/g, '').toUpperCase();
      User.findOne({ hexId: cleanHex }).then(receiver => {
        if (!receiver) return;

        const receiverSocketId = roomManager.getSocketId(receiver._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:stop', {
            senderHexId: socket.hexId,
            conversationId
          });
        }
      }).catch(err => console.error(err));
    });

    // Handle message read receipts
    socket.on('message:read', async ({ messageId, conversationId }) => {
      if (!messageId) return;

      try {
        const readAt = new Date();
        const message = await Message.findByIdAndUpdate(
          messageId,
          { readAt },
          { new: true }
        );

        if (message) {
          // Emit to both sender and receiver rooms
          const senderRoom = message.senderId.toString();
          const receiverRoom = message.receiverId.toString();

          io.to(senderRoom).emit('message:read', { messageId, readAt });
          io.to(receiverRoom).emit('message:read', { messageId, readAt });
        }
      } catch (err) {
        console.error('Error handling message:read socket event:', err);
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        roomManager.removeSocket(socket.id);
        if (socket.hexId) {
          socket.broadcast.emit('user:offline', { hexId: socket.hexId });
        }
      }
    });
  });
}

function getIo() {
  return ioInstance;
}

module.exports = {
  init,
  getIo
};
