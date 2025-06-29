import React from 'react';
import {
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { Conversation, MessageType } from '../../types/message';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';

interface ConversationItemProps {
  conversation: Conversation;
  isOnline: boolean;
  isSelected?: boolean;
  onMarkAsRead: (userId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isOnline,
  isSelected = false,
  onMarkAsRead,
}) => {
  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';

    const { content, type, senderId } = conversation.lastMessage;
    const isOwn = senderId !== conversation.participant.id;
    const prefix = isOwn ? 'Bạn: ' : '';

    switch (type) {
      case MessageType.IMAGE:
        return `${prefix}📷 Hình ảnh`;
      case MessageType.CUSTOM_ORDER:
        return `${prefix}🛠️ Custom order`;
      case MessageType.QUOTE_DISCUSSION:
        return `${prefix}💬 Thảo luận`;
      default:
        return `${prefix}${content}`;
    }
  };

  return (
    <div
      className={`group p-4 transition-all duration-200 ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={conversation.participant.avatarUrl}
            alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
            size="md"
            className={`ring-2 shadow-sm transition-all duration-200 ${
              isSelected ? 'ring-primary/30' : 'ring-white'
            }`}
          />
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-medium truncate text-sm transition-colors duration-200 ${
                conversation.unreadCount > 0 || isSelected
                  ? 'text-gray-900'
                  : 'text-gray-700'
              }`}
            >
              {conversation.participant.firstName}{' '}
              {conversation.participant.lastName}
            </h3>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {conversation.lastActivity && (
                <span
                  className={`text-xs transition-colors duration-200 ${
                    isSelected ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {formatTime(conversation.lastActivity)}
                </span>
              )}

              {conversation.unreadCount > 0 && (
                <Badge
                  variant="primary"
                  size="sm"
                  className="min-w-[20px] h-5 text-xs animate-pulse"
                >
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-xs truncate flex-1 mr-2 transition-colors duration-200 ${
                conversation.unreadCount > 0 || isSelected
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {getLastMessagePreview()}
            </p>

            {/* Role badge */}
            {conversation.participant.role === 'ARTISAN' && (
              <Badge
                variant="primary"
                size="sm"
                className="text-xs flex-shrink-0"
              >
                Nghệ nhân
              </Badge>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="flex-shrink-0">
          <Dropdown
            trigger={
              <button
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            }
            items={[
              {
                label: 'Đánh dấu đã đọc',
                value: 'mark-read',
                onClick: (e) => {
                  e?.stopPropagation();
                  onMarkAsRead(conversation.participantId);
                },
                disabled: conversation.unreadCount === 0,
              },
              {
                label: 'Lưu trữ',
                value: 'archive',
                icon: <ArchiveBoxIcon className="w-4 h-4" />,
                onClick: (e) => {
                  e?.stopPropagation();
                  console.log('Archive conversation');
                },
                disabled: true,
              },
            ]}
            placement="bottom-end"
          />
        </div>
      </div>
    </div>
  );
};
