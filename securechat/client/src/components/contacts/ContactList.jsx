import React, { useEffect, useState } from 'react';
import { getContacts } from '../../api/contacts';
import { startConversation } from '../../api/conversations';
import { formatHexId } from '../../utils/hexGenerator';
import useChatStore from '../../store/chatStore';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { Search, UserPlus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export function ContactList({ onSelectContact, onOpenAddContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setConversations, setActiveConversation } = useChatStore();

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

  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.username.toLowerCase().includes(query) ||
      c.hexId.toLowerCase().includes(query) ||
      (c.nickname && c.nickname.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return <Spinner size="md" className="py-8" />;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Header */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
        />
        <Search size={16} className="absolute left-3 top-2.5 text-text-secondaryDark" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <UserPlus size={36} className="mx-auto text-text-mutedDark" />
            <div className="text-sm text-text-secondaryDark">No contacts found</div>
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
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleStartChat(contact.hexId)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-dark2 dark:hover:bg-surface-dark2 light:hover:bg-surface-light2 border border-transparent hover:border-border-dark transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <Avatar src={contact.avatar} name={contact.username} size="sm" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight group-hover:text-primary transition-colors">
                    {contact.nickname || contact.username}
                  </h4>
                  <span className="font-mono text-[10px] text-text-secondaryDark">
                    {formatHexId(contact.hexId)}
                  </span>
                </div>
              </div>
              
              <MessageSquare size={16} className="text-text-secondaryDark opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all mr-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactList;
