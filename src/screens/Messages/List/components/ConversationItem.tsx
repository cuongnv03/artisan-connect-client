import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../../../helpers/formatters';
import { Avatar } from '../../../../components/common/Avatar';
import { Badge } from '../../../../components/common/Badge';
import { Conversation } from '../../../../types/message.types';
import clsx from 'clsx';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const { participant, lastMessage, unreadCount } = conversation;

  return (
    <div
      className={clsx(
        'flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100',
        isActive && 'bg-accent-light hover:bg-accent-light',
      )}
      onClick={onClick}
    >
      <Avatar
        src={participant.avatarUrl || undefined}
        firstName={participant.firstName}
        lastName={participant.lastName}
        size="md"
      />
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {participant.firstName} {participant.lastName}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p
          className={clsx(
            'text-xs truncate',
            unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500',
          )}
        >
          {lastMessage?.content || 'No messages yet'}
        </p>

        {unreadCount > 0 && (
          <div className="mt-1">
            <Badge variant="primary" size="sm" rounded>
              {unreadCount}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
