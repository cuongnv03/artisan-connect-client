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
      if (authState.user.role === 'ARTISAN') {
        // Artisan accepts customer's initial request
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: `Tôi đã chấp nhận yêu cầu custom order "${proposal.title}"`,
          quoteRequestId: negotiationId,
          response: {
            action: 'ACCEPT',
            finalPrice: proposal.estimatedPrice,
            data: { message: 'Chấp nhận yêu cầu' },
          },
        });
      } else {
        // Customer accepts artisan's counter offer
        await customerAcceptOfferInChat({
          receiverId: message.senderId,
          content: `Tôi đã chấp nhận đề xuất custom order`,
          quoteRequestId: negotiationId,
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
      if (authState.user.role === 'ARTISAN') {
        // Artisan rejects customer's request
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: reason || `Tôi đã từ chối yêu cầu custom order`,
          quoteRequestId: negotiationId,
          response: {
            action: 'REJECT',
            data: { message: reason || 'Từ chối yêu cầu' },
          },
        });
      } else {
        // Customer rejects artisan's offer
        await customerRejectOfferInChat({
          receiverId: message.senderId,
          content: reason || `Tôi đã từ chối đề xuất custom order`,
          quoteRequestId: negotiationId,
          rejectOffer: { reason },
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
      if (authState.user.role === 'ARTISAN') {
        // Artisan counter offers
        await respondToCustomOrderInChat({
          receiverId: message.senderId,
          content: data.message,
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
      } else {
        // Customer counter offers
        await customerCounterOfferInChat({
          receiverId: message.senderId,
          content: data.message,
          quoteRequestId: negotiationId,
          counterOffer: {
            finalPrice: data.finalPrice,
            timeline: data.timeline,
            data: { message: data.message },
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
    switch (message.type) {
      case MessageType.IMAGE:
        return (
          <div>
            {message.attachments && message.attachments.length > 0
              ? message.attachments.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer mb-2"
                    onClick={() => window.open(imageUrl, '_blank')}
                  />
                ))
              : null}
            {message.content && message.content !== '📷 Đã gửi hình ảnh' && (
              <p className="whitespace-pre-wrap">{message.content}</p>
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
                    className={`flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                      isOwn ? 'bg-primary-dark bg-opacity-20' : 'bg-white'
                    }`}
                  >
                    <DocumentIcon
                      className={`w-8 h-8 flex-shrink-0 ${
                        isOwn ? 'text-white' : 'text-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isOwn ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {message.productMentions?.originalFileName ||
                          getFileName(fileUrl)}
                      </p>
                      <p
                        className={`text-xs ${
                          isOwn ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {message.productMentions?.fileSize
                          ? `${Math.round(
                              message.productMentions.fileSize / 1024,
                            )} KB`
                          : 'Tài liệu'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                      className={
                        isOwn
                          ? 'text-white hover:bg-white hover:bg-opacity-20'
                          : ''
                      }
                      leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      Tải về
                    </Button>
                  </div>
                ))
              : null}
            {message.content &&
              !message.content.startsWith('📄 Đã gửi tài liệu:') && (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
          </div>
        );

      case MessageType.QUOTE_DISCUSSION:
        return (
          <div>
            <div className="flex items-center mb-2">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              <span className="font-medium">Thảo luận báo giá</span>
            </div>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  // Custom Order messages không cần background wrapper
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
            {/* Message text */}
            {message.content && (
              <div
                className={`px-4 py-2 rounded-lg mb-2 ${
                  isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}

            {/* Custom Order Card with Actions */}
            {message.productMentions && (
              <>
                {/* Initial Custom Order Creation */}
                {(message.productMentions.type === 'custom_order_created' ||
                  message.productMentions.type === 'custom_order_proposal') && (
                  <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500 mr-2" />
                        <h4 className="font-semibold text-orange-900">
                          Custom Order
                        </h4>
                      </div>
                      <Badge variant="warning" size="sm">
                        Chờ phản hồi
                      </Badge>
                    </div>

                    {message.productMentions.customOrderId && (
                      <div className="mb-3">
                        <Link
                          to={`/custom-orders/${message.productMentions.customOrderId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem chi tiết →
                        </Link>
                      </div>
                    )}

                    <div className="text-sm text-orange-800">
                      <p className="mb-2">
                        <strong>ID:</strong> #
                        {(
                          message.productMentions.customOrderId ||
                          message.productMentions.negotiationId ||
                          ''
                        ).slice(-8)}
                      </p>
                      <p>Đã tạo yêu cầu custom order thành công</p>
                    </div>
                  </div>
                )}

                {/* Interactive Custom Order Card */}
                {message.productMentions.type === 'custom_order_proposal' &&
                  message.productMentions.proposal && (
                    <CustomOrderCard
                      proposal={message.productMentions.proposal}
                      negotiationId={message.productMentions.negotiationId}
                      status={message.productMentions.status || 'pending'}
                      isOwn={isOwn}
                      currentUserRole={authState.user?.role || 'CUSTOMER'}
                      onAccept={handleAcceptCustomOrder}
                      onDecline={handleDeclineCustomOrder}
                      onCounterOffer={handleCounterOffer}
                      loading={sending}
                    />
                  )}

                {/* Response Display */}
                {message.productMentions.type === 'custom_order_response' && (
                  <div className="bg-blue-50 rounded-lg p-4 max-w-sm">
                    <h4 className="font-semibold mb-2 text-blue-900">
                      {message.productMentions.response?.accepted
                        ? '✅ Đề xuất được chấp nhận'
                        : message.productMentions.action === 'COUNTER_OFFER'
                        ? '💰 Đề xuất ngược'
                        : '💬 Phản hồi đề xuất'}
                    </h4>

                    {message.productMentions.response?.counterOffer && (
                      <div className="mt-2 p-3 bg-white rounded border">
                        <h5 className="font-medium mb-1">Đề xuất mới:</h5>
                        <p className="text-sm">
                          Giá:{' '}
                          {formatPrice(
                            message.productMentions.response.counterOffer.price,
                          )}
                        </p>
                        <p className="text-sm">
                          Thời gian:{' '}
                          {
                            message.productMentions.response.counterOffer
                              .duration
                          }
                        </p>
                      </div>
                    )}

                    {message.productMentions.quoteRequestId && (
                      <div className="mt-2">
                        <Link
                          to={`/custom-orders/${message.productMentions.quoteRequestId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem chi tiết →
                        </Link>
                      </div>
                    )}

                    {/* Actions for counter offers */}
                    {message.productMentions.action === 'COUNTER_OFFER' &&
                      !isOwn && (
                        <div className="flex gap-2 mt-3 pt-2 border-t">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAcceptCustomOrder(
                                message.productMentions.quoteRequestId,
                                message.productMentions.response,
                              )
                            }
                            loading={sending}
                          >
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCounterOffer(
                                message.productMentions.quoteRequestId,
                                {
                                  finalPrice:
                                    message.productMentions.finalPrice || 0,
                                  message: 'Đề xuất ngược',
                                },
                              )
                            }
                            loading={sending}
                          >
                            Đề xuất lại
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </>
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
            className={`px-4 py-2 rounded-lg ${
              isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
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
