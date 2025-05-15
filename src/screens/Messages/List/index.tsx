import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../../context/MessageContext';
import { ConversationItem } from './components/ConversationItem';
import { Loader } from '../../../components/feedback/Loader';
import { Input } from '../../../components/form/Input';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/form/Button';
import { Modal } from '../../../components/feedback/Modal';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types/user.types';
import { Dropdown } from '../../../components/form/Dropdown';
import { MessageInput } from '../Detail/components/MessageInput';

const MessagesList: React.FC = () => {
  const { state, fetchConversations, setCurrentConversation, sendMessage } =
    useMessages();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  // State for search and new message functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter conversations by search query
  const filteredConversations = state.conversations.filter((conversation) => {
    const participant = conversation.participant;
    const fullName = `${participant.firstName} ${participant.lastName}`;
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle conversation click
  const handleConversationClick = (participantId: string) => {
    setCurrentConversation(participantId);
    navigate(`/messages/${participantId}`);
  };

  // Handle new message modal open
  const handleNewMessageClick = () => {
    setIsNewMessageModalOpen(true);
  };

  // Handle send new message
  const handleSendNewMessage = async () => {
    if (!selectedUser || !newMessageContent.trim()) return;

    try {
      await sendMessage(selectedUser, newMessageContent);
      setIsNewMessageModalOpen(false);
      setSelectedUser('');
      setNewMessageContent('');

      // Navigate to the new conversation
      navigate(`/messages/${selectedUser}`);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your conversations
        </p>
      </div>

      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-full max-w-md">
              <Input
                leftAddon={
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                }
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={handleNewMessageClick}
            >
              New Message
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {state.isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchQuery
                  ? 'No conversations found matching your search'
                  : 'No conversations yet'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleNewMessageClick}
              >
                Start a new conversation
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.participantId}
                conversation={conversation}
                isActive={
                  conversation.participantId ===
                  state.currentConversation.participantId
                }
                onClick={() =>
                  handleConversationClick(conversation.participantId)
                }
              />
            ))
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <Modal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        title="New Message"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <Dropdown
              options={users.map((user) => ({
                label: `${user.firstName} ${user.lastName}`,
                value: user.id,
              }))}
              value={selectedUser}
              onChange={(value) => setSelectedUser(value.toString())}
              placeholder="Select a user..."
              disabled={isLoadingUsers}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              rows={4}
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsNewMessageModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSendNewMessage}
            disabled={!selectedUser || !newMessageContent.trim()}
          >
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesList;
