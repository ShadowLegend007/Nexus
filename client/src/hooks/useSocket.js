import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useUiStore from '../store/uiStore';

export function useSocket() {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?._id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const envSocket = import.meta.env.VITE_SOCKET_URL;
    const socketUrl = (envSocket && !envSocket.includes('172.17.180.222'))
      ? envSocket.replace('localhost', window.location.hostname)
      : `http://${window.location.hostname || 'localhost'}:5000`;
    
    // Connect to Socket.io gateway
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket gateway');
      socket.emit('join', { userId });
    });

    // Handle new incoming messages
    socket.on('message:new', (message) => {
      useChatStore.getState().addMessage(message);
    });

    // Handle asynchronous real-time ML status updates
    socket.on('message:status', (payload) => {
      useChatStore.getState().updateMessageStatus(payload.messageId, payload);
    });

    // Handle read receipts
    socket.on('message:read', ({ messageId, readAt }) => {
      useChatStore.getState().markMessageReadInStore(messageId, readAt);
    });

    // Handle delivery receipts
    socket.on('message:delivered', ({ messageId, deliveredAt }) => {
      useChatStore.getState().markMessageDeliveredInStore(messageId, deliveredAt);
    });

    // Handle message deletion
    socket.on('message:delete', ({ messageId, isDeletedForEveryone }) => {
      useChatStore.getState().deleteMessageInStore(messageId, isDeletedForEveryone);
    });

    // Handle typing indicators
    socket.on('typing:start', ({ senderHexId, conversationId }) => {
      useUiStore.getState().setTyping(conversationId, senderHexId, true);
    });

    socket.on('typing:stop', ({ senderHexId, conversationId }) => {
      useUiStore.getState().setTyping(conversationId, senderHexId, false);
    });

    // Handle user online/offline status updates
    socket.on('user:online', ({ hexId }) => {
      useChatStore.getState().addUserOnline(hexId);
    });

    socket.on('user:offline', ({ hexId }) => {
      useChatStore.getState().removeUserOffline(hexId);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, userId]);

  return socketRef.current;
}

export default useSocket;
