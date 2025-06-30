import React from 'react';
import { Link } from 'react-router-dom';
import {
  InformationCircleIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { MessageWithUsers, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { CustomOrderCard } from '../custom-orders/CustomOrderCard';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomOrderChat } from '../../hooks/custom-orders/useCustomOrderChat';
import { LoadingSpinner } from '../ui';

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
  const { state: authState } = useAuth();
  const {
    respondToCustomOrderInChat,
    customerCounterOfferInChat,
    customerAcceptOfferInChat,
    customerRejectOfferInChat,
    sending,
  } = useCustomOrderChat();

  // Custom Order handlers for chat actions
  const handleAcceptCustomOrder = async (
    negotiationId: string,
    proposal: any,
  ) => {
    if (!authState.user) return;

    try {
      const isCustomer =
        authState.user.id === message.productMentions?.customerId;

      if (isCustomer) {
        // Customer accepts artisan's response/counter offer
        await customerAcceptOfferInChat({
          receiverId: message.senderId,
          content: `✅ Tôi đã chấp nhận đề xuất cho custom order "${proposal.title}"`,
          quoteRequestId: negotiationId,
        });
      } else {
        // Artisan accepts customer's initial request
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: `✅ Tôi đã chấp nhận yêu cầu custom order "${proposal.title}"`,
          quoteRequestId: negotiationId,
          response: {
            action: 'ACCEPT',
            finalPrice: proposal.estimatedPrice,
            data: { message: 'Chấp nhận yêu cầu' },
          },
        });
      }
    } catch (error) {
      console.error('Error accepting custom order:', error);
    }
  };

  const handleDeclineCustomOrder = async (
    negotiationId: string,
    reason?: string,
  ) => {
    if (!authState.user) return;

    try {
      const isCustomer =
        authState.user.id === message.productMentions?.customerId;

      if (isCustomer) {
        // Customer rejects artisan's offer
        await customerRejectOfferInChat({
          receiverId: message.senderId,
          content: reason || `❌ Tôi đã từ chối đề xuất custom order`,
          quoteRequestId: negotiationId,
          rejectOffer: { reason },
        });
      } else {
        // Artisan rejects customer's request
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: reason || `❌ Tôi đã từ chối yêu cầu custom order`,
          quoteRequestId: negotiationId,
          response: {
            action: 'REJECT',
            data: { message: reason || 'Từ chối yêu cầu' },
          },
        });
      }
    } catch (error) {
      console.error('Error declining custom order:', error);
    }
  };

  const handleCounterOffer = async (
    negotiationId: string,
    data: {
      finalPrice: number;
      message: string;
      timeline?: string;
    },
  ) => {
    if (!authState.user) return;

    try {
      const isCustomer =
        authState.user.id === message.productMentions?.customerId;

      if (isCustomer) {
        // Customer counter offers
        await customerCounterOfferInChat({
          receiverId: message.senderId,
          content: `💰 ${data.message}`,
          quoteRequestId: negotiationId,
          counterOffer: {
            finalPrice: data.finalPrice,
            timeline: data.timeline,
            data: { message: data.message },
          },
        });
      } else {
        // Artisan counter offers
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: `💰 ${data.message}`,
          quoteRequestId: negotiationId,
          response: {
            action: 'COUNTER_OFFER',
            finalPrice: data.finalPrice,
            data: {
              message: data.message,
              timeline: data.timeline,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error making counter offer:', error);
    }
  };

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

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Tải về';
  };

  const renderMessageContent = () => {
    const { content, type, productMentions } = message;

    // Show loading state for uploading messages
    if (productMentions?.uploading || productMentions?.creating) {
      return (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span className="text-gray-500">{content}</span>
        </div>
      );
    }

    switch (type) {
      case MessageType.IMAGE:
        return (
          <div>
            {message.attachments && message.attachments.length > 0
              ? message.attachments.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt="Hình ảnh đã gửi"
                    className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer mb-2 shadow-sm"
                    onClick={() => window.open(imageUrl, '_blank')}
                  />
                ))
              : null}
            {content && content !== '📷 Đã gửi hình ảnh' && (
              <p className="whitespace-pre-wrap mt-2">{content}</p>
            )}
          </div>
        );

      case MessageType.FILE:
        return (
          <div>
            {message.attachments && message.attachments.length > 0
              ? message.attachments.map((fileUrl, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg mb-2 border ${
                      isOwn
                        ? 'bg-primary-dark bg-opacity-10 border-primary-light'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <DocumentIcon
                      className={`w-8 h-8 flex-shrink-0 ${
                        isOwn ? 'text-primary' : 'text-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isOwn ? 'text-primary-dark' : 'text-gray-900'
                        }`}
                      >
                        {productMentions?.originalFileName ||
                          getFileName(fileUrl)}
                      </p>
                      <p
                        className={`text-xs ${
                          isOwn ? 'text-primary' : 'text-gray-500'
                        }`}
                      >
                        {productMentions?.fileSize
                          ? `${Math.round(productMentions.fileSize / 1024)} KB`
                          : 'Tài liệu'}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(fileUrl, '_blank')}
                      className={`text-sm px-3 py-1 rounded ${
                        isOwn
                          ? 'text-primary hover:bg-primary hover:bg-opacity-10'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              : null}
            {content && !content.startsWith('📄 Đã gửi tài liệu:') && (
              <p className="whitespace-pre-wrap mt-2">{content}</p>
            )}
          </div>
        );

      case MessageType.CUSTOM_ORDER:
        return renderCustomOrderContent();

      default:
        return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  const renderCustomOrderContent = () => {
    const { content, productMentions } = message;

    // FIXED: Always show message content first
    const messageContent = content && (
      <div
        className={`px-4 py-2 rounded-lg mb-3 ${
          isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap flex items-center">
          <WrenchScrewdriverIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          {content}
        </p>
      </div>
    );

    // FIXED: Render Custom Order Card if we have proper data
    const renderCustomOrderCard = () => {
      if (!productMentions) {
        console.warn('No productMentions data for custom order message');
        return null;
      }

      const {
        type,
        negotiationId,
        status,
        customerId,
        artisanId,
        lastActor,
        finalPrice,
        proposal,
      } = productMentions;

      // FIXED: Check for valid types and required data
      if (!type || !negotiationId || !proposal) {
        console.warn('Missing required data for custom order card:', {
          type,
          negotiationId,
          hasProposal: !!proposal,
        });
        return null;
      }

      // FIXED: Show card for all custom order types
      const validTypes = [
        'create_custom_order',
        'custom_order_creation', // Legacy support
        'respond_custom_order',
        'custom_order_response', // Legacy support
        'custom_order_update',
      ];

      if (!validTypes.includes(type)) {
        console.warn(`Invalid custom order type: ${type}`);
        return null;
      }

      // FIXED: Ensure proposal has all required fields
      const enhancedProposal = {
        title: proposal.title || 'Custom Order',
        description: proposal.description || 'Không có mô tả',
        estimatedPrice: proposal.estimatedPrice || 0,
        customerBudget: proposal.customerBudget,
        timeline: proposal.timeline,
        specifications: proposal.specifications || {},
        attachmentUrls: proposal.attachmentUrls || [],
        referenceProductId: proposal.referenceProductId,
        ...proposal, // Spread any additional fields
      };

      return (
        <div className="mt-2">
          <CustomOrderCard
            proposal={enhancedProposal}
            negotiationId={negotiationId}
            status={status || 'PENDING'}
            customerId={customerId || message.senderId}
            artisanId={artisanId || message.receiverId}
            currentUserId={authState.user?.id || ''}
            lastActor={lastActor}
            finalPrice={finalPrice}
            onAccept={handleAcceptCustomOrder}
            onDecline={handleDeclineCustomOrder}
            onCounterOffer={handleCounterOffer}
            loading={sending}
          />
        </div>
      );
    };

    return (
      <div>
        {messageContent}
        {renderCustomOrderCard()}
      </div>
    );
  };

  // FIXED: Custom Order messages get special layout
  if (message.type === MessageType.CUSTOM_ORDER) {
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
            {renderCustomOrderContent()}

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
  }

  // Regular messages (TEXT, IMAGE, FILE) - existing code remains the same
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
          {/* Message content with background */}
          <div
            className={`px-4 py-2 rounded-lg shadow-sm ${
              isOwn
                ? 'bg-primary text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            {renderMessageContent()}
          </div>

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
