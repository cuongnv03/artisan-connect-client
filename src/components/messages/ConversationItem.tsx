import React from 'react';
import { Link } from 'react-router-dom';
import {
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { Conversation, MessageType } from '../../types/message';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Dropdown } from '../ui/Dropdown';

interface ConversationItemProps {
  conversation: Conversation;
  isOnline: boolean;
  onMarkAsRead: (userId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isOnline,
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
      return messageDate.toLocaleDateString('vi-VN', { weekday: 'long' });
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
    const isOwn = senderId === conversation.participant.id; // This logic might need adjustment
    const prefix = isOwn ? '' : 'Bạn: ';

    switch (type) {
      case MessageType.IMAGE:
        return `${prefix}📷 Đã gửi hình ảnh`;
      case MessageType.CUSTOM_ORDER:
        return `${prefix}📝 Yêu cầu đặt hàng tùy chỉnh`;
      case MessageType.QUOTE_DISCUSSION:
        return `${prefix}💬 Thảo luận báo giá`;
      default:
        return `${prefix}${content}`;
    }
  };

  return (
    <Link to={`/messages/${conversation.participantId}`} className="block">
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar
              src={conversation.participant.avatarUrl}
              alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
              size="lg"
              online={isOnline}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3
                className={`font-medium truncate ${
                  conversation.unreadCount > 0
                    ? 'text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                {conversation.participant.firstName}{' '}
                {conversation.participant.lastName}
                {isOnline && (
                  <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                )}
              </h3>

              <div className="flex items-center space-x-2">
                {conversation.lastActivity && (
                  <span className="text-sm text-gray-500">
                    {formatTime(conversation.lastActivity)}
                  </span>
                )}

                {conversation.unreadCount > 0 && (
                  <Badge variant="primary" size="sm">
                    {conversation.unreadCount > 99
                      ? '99+'
                      : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p
                className={`text-sm truncate flex-1 ${
                  conversation.unreadCount > 0
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {getLastMessagePreview()}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {conversation.participant.role === 'ARTISAN' && (
                  <Badge variant="primary" size="sm">
                    Nghệ nhân
                  </Badge>
                )}

                <Dropdown
                  trigger={
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={(e) => e.preventDefault()}
                    >
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Đánh dấu đã đọc',
                      value: 'mark-read',
                      onClick: () => onMarkAsRead(conversation.participantId),
                    },
                    {
                      label: 'Lưu trữ',
                      value: 'archive',
                      icon: <ArchiveBoxIcon className="w-4 h-4" />,
                      onClick: () => console.log('Archive conversation'),
                      disabled: true,
                    },
                  ]}
                  placement="bottom-end"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
