import React, { useRef, useEffect } from 'react';
import { MessageWithUsers } from '../../types/message';
import { User } from '../../types/auth';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: MessageWithUsers[];
  participant: User;
  currentUserId: string;
  hasMore: boolean;
  loadingMore: boolean;
  participantTyping: boolean;
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  participant,
  currentUserId,
  hasMore,
  loadingMore,
  participantTyping,
  onLoadMore,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Avatar
              src={participant.avatarUrl}
              alt={`${participant.firstName} ${participant.lastName}`}
              size="xl"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bắt đầu cuộc trò chuyện
          </h3>
          <p className="text-gray-500">
            Gửi tin nhắn đầu tiên cho {participant.firstName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="h-full overflow-y-auto bg-gray-50 message-scroll"
    >
      <div className="p-4 min-h-full flex flex-col">
        {hasMore && (
          <div className="text-center mb-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              loading={loadingMore}
              disabled={loadingMore}
              className="bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {loadingMore ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </Button>
          </div>
        )}

        {/* Messages container - grows to fill space */}
        <div className="flex-1 space-y-2">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              participant={participant}
              previousMessage={messages[index - 1]}
              nextMessage={messages[index + 1]}
            />
          ))}

          {/* Typing indicator */}
          {participantTyping && (
            <div className="flex justify-start">
              <div className="mr-3">
                <Avatar
                  src={participant.avatarUrl}
                  alt={`${participant.firstName} ${participant.lastName}`}
                  size="sm"
                />
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1 flex-shrink-0" />
      </div>
    </div>
  );
};
