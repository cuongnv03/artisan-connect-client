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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center py-12">
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
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {hasMore && (
        <div className="text-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            loading={loadingMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
          </Button>
        </div>
      )}

      <div>
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
          <div className="flex justify-start mb-4">
            <div className="mr-3">
              <Avatar
                src={participant.avatarUrl}
                alt={`${participant.firstName} ${participant.lastName}`}
                size="sm"
              />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
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

      <div ref={messagesEndRef} />
    </div>
  );
};
