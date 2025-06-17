import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { MessageWithUsers, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { CustomOrderCard } from './CustomOrderCard';

interface MessageItemProps {
  message: MessageWithUsers;
  isOwn: boolean;
  participant: User;
  previousMessage?: MessageWithUsers;
  nextMessage?: MessageWithUsers;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  participant,
  previousMessage,
  nextMessage,
}) => {
  const showAvatar =
    !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);
  const showDate =
    !previousMessage ||
    new Date(message.createdAt).toDateString() !==
      new Date(previousMessage.createdAt).toDateString();

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  return (
    <div>
      {showDate && (
        <div className="text-center my-4">
          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {formatDate(message.createdAt)}
          </span>
        </div>
      )}

      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div className="mr-3">
            {showAvatar ? (
              <Avatar
                src={participant.avatarUrl}
                alt={`${participant.firstName} ${participant.lastName}`}
                size="sm"
              />
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        <div
          className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}
        >
          {/* Render based on message type */}
          {message.type === MessageType.CUSTOM_ORDER ? (
            <div>
              {/* Short message text */}
              {message.content && (
                <div
                  className={`px-4 py-2 rounded-lg mb-2 ${
                    isOwn
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              )}

              {/* Custom Order Card */}
              {message.productMentions?.type === 'custom_order_proposal' &&
                message.productMentions?.proposal && (
                  <CustomOrderCard
                    proposal={message.productMentions.proposal}
                    negotiationId={message.productMentions.negotiationId}
                    status={message.productMentions.status || 'pending'}
                    isOwn={isOwn}
                  />
                )}

              {/* Response type custom orders */}
              {message.productMentions?.type === 'custom_order_response' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">
                    {message.productMentions.response?.accepted
                      ? 'Đề xuất được chấp nhận'
                      : 'Phản hồi đề xuất'}
                  </h4>
                  <p>{message.content}</p>
                  {message.productMentions.response?.counterOffer && (
                    <div className="mt-2 p-3 bg-white rounded border">
                      <h5 className="font-medium mb-1">Đề xuất mới:</h5>
                      <p className="text-sm">
                        Giá: $
                        {message.productMentions.response.counterOffer.price}
                      </p>
                      <p className="text-sm">
                        Thời gian:{' '}
                        {message.productMentions.response.counterOffer.duration}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Regular messages
            <div
              className={`px-4 py-2 rounded-lg ${
                isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === MessageType.IMAGE ? (
                <div>
                  <img
                    src={
                      message.productMentions?.mediaUrl ||
                      message.productMentions?.url
                    }
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                  {message.content && <p className="mt-2">{message.content}</p>}
                </div>
              ) : message.type === MessageType.QUOTE_DISCUSSION ? (
                <div>
                  <div className="flex items-center mb-2">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">Thảo luận báo giá</span>
                  </div>
                  <p>{message.content}</p>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isOwn ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(message.createdAt)}
            {isOwn && message.isRead && (
              <span className="ml-1 text-blue-500">✓✓</span>
            )}
            {isOwn && !message.isRead && <span className="ml-1">✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
