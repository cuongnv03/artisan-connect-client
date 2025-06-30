import React from 'react';
import { Link } from 'react-router-dom';
import {
  InformationCircleIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { MessageWithUsers, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CustomOrderCard } from '../custom-orders/CustomOrderCard';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomOrderChat } from '../../hooks/custom-orders/useCustomOrderChat';
import { formatPrice } from '../../utils/format';

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
    customerCounterOfferInChat,
    customerAcceptOfferInChat,
    customerRejectOfferInChat,
    respondToCustomOrderInChat,
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

    switch (type) {
      case MessageType.IMAGE:
        return (
          <div>
            {message.attachments && message.attachments.length > 0
              ? message.attachments.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt="Shared image"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                      className={
                        isOwn
                          ? 'text-primary hover:bg-primary hover:bg-opacity-10'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                      leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      Tải về
                    </Button>
                  </div>
                ))
              : null}
            {content && !content.startsWith('📄 Đã gửi tài liệu:') && (
              <p className="whitespace-pre-wrap mt-2">{content}</p>
            )}
          </div>
        );

      // case MessageType.QUOTE_DISCUSSION:
      //   return (
      //     <div>
      //       <div className="flex items-center mb-2">
      //         <InformationCircleIcon className="w-4 h-4 mr-2 text-blue-500" />
      //         <span className="font-medium text-blue-700">
      //           Thảo luận báo giá
      //         </span>
      //       </div>
      //       <p className="whitespace-pre-wrap">{content}</p>
      //     </div>
      //   );

      case MessageType.CUSTOM_ORDER:
        return renderCustomOrderContent();

      default:
        return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  const renderCustomOrderContent = () => {
    const { content, productMentions } = message;

    if (!productMentions) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Regular message content first
    const messageContent = content && (
      <div
        className={`px-4 py-2 rounded-lg mb-3 ${
          isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    );

    // Custom Order Card Logic
    const renderCustomOrderCard = () => {
      const {
        type,
        negotiationId,
        status,
        customerId,
        artisanId,
        lastActor,
        finalPrice,
        proposal,
        action,
      } = productMentions;

      // Only show interactive card for certain types
      if (
        !['custom_order_proposal', 'custom_order_response'].includes(type || '')
      ) {
        return null;
      }

      // For proposal (initial custom order)
      if (type === 'custom_order_proposal' && proposal) {
        return (
          <CustomOrderCard
            proposal={proposal}
            negotiationId={negotiationId || ''}
            status={status || 'pending'}
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
        );
      }

      // For response (artisan response or customer counter)
      if (type === 'custom_order_response' && proposal) {
        return (
          <CustomOrderCard
            proposal={proposal}
            negotiationId={negotiationId || ''}
            status={status || 'counter_offered'}
            customerId={customerId || ''}
            artisanId={artisanId || ''}
            currentUserId={authState.user?.id || ''}
            lastActor={lastActor}
            finalPrice={finalPrice}
            onAccept={handleAcceptCustomOrder}
            onDecline={handleDeclineCustomOrder}
            onCounterOffer={handleCounterOffer}
            loading={sending}
          />
        );
      }

      return null;
    };

    // Render status update cards
    const renderStatusUpdate = () => {
      const { action, finalPrice, negotiationId } = productMentions;

      if (!action) return null;

      const getStatusConfig = () => {
        switch (action) {
          case 'ACCEPT':
          case 'CUSTOMER_ACCEPT':
            return {
              icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
              title: 'Đã chấp nhận',
              color: 'bg-green-50 border-green-200',
              textColor: 'text-green-800',
            };
          case 'REJECT':
          case 'CUSTOMER_REJECT':
            return {
              icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
              title: 'Đã từ chối',
              color: 'bg-red-50 border-red-200',
              textColor: 'text-red-800',
            };
          case 'COUNTER_OFFER':
          case 'CUSTOMER_COUNTER_OFFER':
            return {
              icon: <ArrowPathIcon className="w-5 h-5 text-blue-500" />,
              title: 'Đề xuất ngược',
              color: 'bg-blue-50 border-blue-200',
              textColor: 'text-blue-800',
            };
          default:
            return null;
        }
      };

      const statusConfig = getStatusConfig();
      if (!statusConfig) return null;

      return (
        <div className={`p-3 rounded-lg border ${statusConfig.color} mt-2`}>
          <div className="flex items-center mb-2">
            {statusConfig.icon}
            <span className={`font-medium ml-2 ${statusConfig.textColor}`}>
              {statusConfig.title}
            </span>
          </div>

          {finalPrice && (
            <div className={`text-sm ${statusConfig.textColor} mb-2`}>
              Giá: <strong>{formatPrice(finalPrice)}</strong>
            </div>
          )}

          {negotiationId && (
            <div className="text-xs text-gray-600">
              <Link
                to={`/custom-orders/${negotiationId}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem chi tiết custom order →
              </Link>
            </div>
          )}
        </div>
      );
    };

    return <div>{renderCustomOrderCard()}</div>;
  };

  // Custom Order messages don't need background wrapper for the card
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

  // Regular messages (TEXT, IMAGE, FILE, QUOTE_DISCUSSION)
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
          {/* Message content với background */}
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
