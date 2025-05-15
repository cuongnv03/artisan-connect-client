import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessages } from '../../../context/MessageContext';
import { MessageItem } from './components/MessageItem';
import { MessageInput } from './components/MessageInput';
import { NoConversationSelected } from './components/NoConversationSelected';
import { Loader } from '../../../components/feedback/Loader';
import { Avatar } from '../../../components/common/Avatar';
import {
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/form/Button';

const MessageDetail: React.FC = () => {
  const { id: participantId } = useParams<{ id: string }>();
  const {
    state,
    fetchMessages,
    sendMessage,
    loadMoreMessages,
    markConversationAsRead,
  } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Find the current conversation in the conversations list
  const currentConversation = state.conversations.find(
    (conversation) => conversation.participantId === participantId,
  );

  // Fetch messages on component mount or when participantId changes
  useEffect(() => {
    if (participantId) {
      fetchMessages(participantId, true);
    }
  }, [participantId]);

  // Mark conversation as read on mount
  useEffect(() => {
    if (participantId && currentConversation?.unreadCount) {
      markConversationAsRead(participantId);
    }
  }, [participantId, currentConversation?.unreadCount]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.currentConversation.messages]);

  // Handle infinite scroll for older messages
  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (!container) return;

      // Load more messages when scrolled to top
      if (
        container.scrollTop < 100 &&
        state.currentConversation.hasMore &&
        !state.currentConversation.isLoading
      ) {
        loadMoreMessages();
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [
    state.currentConversation.hasMore,
    state.currentConversation.isLoading,
    loadMoreMessages,
  ]);

  // Handle sending a message
  const handleSendMessage = async (
    content: string,
    attachments: string[] = [],
  ) => {
    if (!participantId) return;
    await sendMessage(participantId, content, attachments);
  };

  // If no participantId is provided, show a placeholder
  if (!participantId) {
    return <NoConversationSelected />;
  }

  // If the current conversation is loading, show a loader
  if (!currentConversation) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      {/* Conversation header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 md:hidden"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          <Avatar
            src={currentConversation.participant.avatarUrl || undefined}
            firstName={currentConversation.participant.firstName}
            lastName={currentConversation.participant.lastName}
            size="md"
          />

          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">
              {currentConversation.participant.firstName}{' '}
              {currentConversation.participant.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              @{currentConversation.participant.username}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-gray-500">
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto flex flex-col-reverse"
      >
        {/* Loading indicator for older messages */}
        {state.currentConversation.isLoading && (
          <div className="flex justify-center my-4">
            <Loader size="md" />
          </div>
        )}

        {/* Messages */}
        <div>
          {state.currentConversation.messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {/* Empty state */}
          {!state.currentConversation.isLoading &&
            state.currentConversation.messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default MessageDetail;
