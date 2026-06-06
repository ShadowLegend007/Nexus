import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { getContacts } from '../../api/contacts';
import { startConversation } from '../../api/conversations';
import { formatHexId } from '../../utils/hexGenerator';
import useChatStore from '../../store/chatStore';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { UserPlus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export function ContactList({ onSelectContact, onOpenAddContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setConversations, setActiveConversation } = useChatStore();
  const { user } = useAuthStore();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStartChat = async (hexId) => {
    try {
      const conv = await startConversation(hexId);
      setActiveConversation(conv);
      // Re-trigger global conversations listing
      if (onSelectContact) onSelectContact(conv);
    } catch (err) {
      toast.error('Failed to start chat session.');
    }
  };


  if (loading) {
    return <Spinner size="md" className="py-8" />;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {contacts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <UserPlus size={36} className="mx-auto text-text-secondaryLight dark:text-text-secondaryDark" />
            <div className="text-sm text-text-secondaryLight dark:text-text-secondaryDark">No contacts found</div>
            {onOpenAddContact && (
              <button
                onClick={onOpenAddContact}
                className="text-xs font-semibold text-primary hover:underline outline-none"
              >
                Add new contact by Hex ID
              </button>
            )}
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleStartChat(contact.hexId)}
              className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group"
              style={{ border: '1px solid transparent' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div className="flex items-center space-x-3">
                <Avatar src={contact.avatar} name={contact.username} size="sm" />
                <div className="text-left">
                  <h4
                    className="text-sm font-semibold transition-colors group-hover:text-primary"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {contact.nickname || (contact.hexId === user?.hexId ? `${contact.username} (You)` : contact.username)}
                  </h4>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {formatHexId(contact.hexId)}
                  </span>
                </div>
              </div>
              
              <MessageSquare
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-all mr-2"
                style={{ color: 'var(--accent)' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactList;
