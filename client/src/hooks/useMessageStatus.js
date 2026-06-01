import useChatStore from '../store/chatStore';

/**
 * Custom hook to fetch the real-time status of a message.
 * Reacts to Socket.io status events automatically.
 * @param {object} message The base message object from Mongoose DB
 * @returns {{scanStatus: string, threatType: string|null, threatConfidence: number|null, tier: number|null}}
 */
export function useMessageStatus(message) {
  const getLiveStatus = useChatStore((state) => state.getMessageLiveStatus);
  
  if (!message) {
    return {
      scanStatus: 'SCANNING',
      threatType: null,
      threatConfidence: null,
      tier: null
    };
  }

  return getLiveStatus(message);
}

export default useMessageStatus;
