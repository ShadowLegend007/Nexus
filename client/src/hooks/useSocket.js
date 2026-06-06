import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useUiStore from '../store/uiStore';

export function useSocket() {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useAuthStore();
  const { 
    addMessage, 
    updateMessageStatus, 
    markMessageReadInStore, 
    markMessageDeliveredInStore,
    deleteMessageInStore,
    addUserOnline, 
    removeUserOffline 
  } = useChatStore();
  const { setTyping } = useUiStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL ? import.meta.env.VITE_SOCKET_URL.replace('localhost', window.location.hostname) : `http://${window.location.hostname}:5000`;
    
    // Connect to Socket.io gateway
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket gateway');
      // Join personal room
      socket.emit('join', { userId: user._id });
    });

    // Handle new incoming messages
    socket.on('message:new', (message) => {
      addMessage(message);
    });

    // Handle asynchronous real-time ML status updates
    socket.on('message:status', (payload) => {
      updateMessageStatus(payload.messageId, payload);
    });

    // Handle read receipts
    socket.on('message:read', ({ messageId, readAt }) => {
      markMessageReadInStore(messageId, readAt);
    });

    // Handle delivery receipts
    socket.on('message:delivered', ({ messageId, deliveredAt }) => {
      markMessageDeliveredInStore(messageId, deliveredAt);
    });

    // Handle message deletion
    socket.on('message:delete', ({ messageId, isDeletedForEveryone }) => {
      deleteMessageInStore(messageId, isDeletedForEveryone);
    });

    // Handle typing indicators
    socket.on('typing:start', ({ senderHexId, conversationId }) => {
      setTyping(conversationId, senderHexId, true);
    });

    socket.on('typing:stop', ({ senderHexId, conversationId }) => {
      setTyping(conversationId, senderHexId, false);
    });

    // Handle user online/offline status updates
    socket.on('user:online', ({ hexId }) => {
      addUserOnline(hexId);
    });

    socket.on('user:offline', ({ hexId }) => {
      removeUserOffline(hexId);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user, addMessage, updateMessageStatus, markMessageReadInStore, markMessageDeliveredInStore, deleteMessageInStore, addUserOnline, removeUserOffline, setTyping]);

  return socketRef.current;
}

export default useSocket;
