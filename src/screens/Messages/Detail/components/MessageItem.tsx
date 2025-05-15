import React from 'react';
import { formatDateTime } from '../../../../helpers/formatters';
import { Message } from '../../../../types/message.types';
import { useAuth } from '../../../../context/AuthContext';
import { Avatar } from '../../../../components/common/Avatar';
import clsx from 'clsx';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { state } = useAuth();
  const { user } = state;

  const isCurrentUser = user?.id === message.senderId;
  const sender = message.sender || {
    firstName: '',
    lastName: '',
    avatarUrl: '',
  };

  return (
    <div
      className={clsx(
        'flex mb-4',
        isCurrentUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-2">
          <Avatar
            src={sender.avatarUrl || undefined}
            firstName={sender.firstName}
            lastName={sender.lastName}
            size="sm"
          />
        </div>
      )}

      <div
        className={clsx(
          'max-w-md rounded-lg px-4 py-2 shadow-sm',
          isCurrentUser
            ? 'bg-accent text-white rounded-br-none ml-12'
            : 'bg-gray-100 text-gray-800 rounded-bl-none mr-12',
        )}
      >
        <div className="text-sm">{message.content}</div>

        {message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'block p-2 rounded-md text-xs',
                  isCurrentUser
                    ? 'bg-accent-dark text-white hover:bg-opacity-90'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                )}
              >
                Attachment {index + 1}
              </a>
            ))}
          </div>
        )}

        <div
          className={clsx(
            'text-xs mt-1',
            isCurrentUser ? 'text-accent-light' : 'text-gray-500',
          )}
        >
          {formatDateTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};
