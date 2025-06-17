import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
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
    <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/messages">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="mr-4"
            >
              Quay lại
            </Button>
          </Link>

          <div className="flex items-center">
            <Avatar
              src={participant.avatarUrl}
              alt={`${participant.firstName} ${participant.lastName}`}
              size="md"
              online={isOnline}
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
        </div>

        {/* Chỉ hiện info button khi chat với artisan, không hiện khi chat với customer */}
        {participant.role !== 'CUSTOMER' && (
          <div className="flex items-center space-x-2">
            <Link to={`/artisan/${participant.id}`}>
              <Button variant="ghost" size="sm">
                <InformationCircleIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
