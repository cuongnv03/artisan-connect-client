import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRelativeTime } from '../../utils/format';

interface ConversationHeaderProps {
  participant: User;
  isOnline: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  participant,
  isOnline,
}) => {
  return (
    <div className="px-4 py-2 h-full flex items-center justify-between">
      <div className="flex items-center">
        <Avatar
          src={participant.avatarUrl}
          alt={`${participant.firstName} ${participant.lastName}`}
          size="md"
          online={isOnline}
          className="ring-2 ring-white shadow-sm"
        />

        <div className="ml-3">
          <h1 className="font-semibold text-gray-900">
            {participant.firstName} {participant.lastName}
          </h1>
          <div className="flex items-center space-x-2">
            {participant.role === 'ARTISAN' && (
              <Badge variant="primary" size="sm">
                Nghệ nhân
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {isOnline
                ? 'Đang hoạt động'
                : participant.lastSeenAt
                ? `Hoạt động ${formatRelativeTime(participant.lastSeenAt)}`
                : 'Không rõ'}
            </span>
          </div>
        </div>
      </div>

      {/* Info button cho artisan */}
      {participant.role === 'ARTISAN' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/artisan/${participant.id}`, '_blank')}
          className="hover:bg-gray-100"
        >
          <InformationCircleIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
