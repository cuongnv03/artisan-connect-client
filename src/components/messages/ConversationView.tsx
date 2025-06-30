import React, { useState } from 'react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { MessageType } from '../../types/message';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { CustomOrderForm } from '../custom-orders/CustomOrderForm';
import { useConversation } from '../../hooks/messages/useConversation';
import { useToastContext } from '../../contexts/ToastContext';

interface ConversationViewProps {
  userId: string;
  onClose?: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  userId,
  onClose,
}) => {
  const { state } = useAuth();
  const { onlineUsers } = useSocketContext();
  const { error: showError } = useToastContext();

  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);

  const {
    messages,
    participant,
    loading,
    sending,
    uploadingMedia,
    hasMore,
    loadingMore,
    participantTyping,
    sendTextMessage,
    sendMediaMessage,
    sendCustomOrderMessage,
    loadMoreMessages,
    handleTyping,
  } = useConversation(userId);

  const isUserOnline = () => {
    return onlineUsers.has(userId);
  };

  // ENHANCED: Handle text message sending
  const handleSendMessage = async (content: string) => {
    try {
      await sendTextMessage(content);
    } catch (error) {
      // Error already handled in hook
    }
  };

  // ENHANCED: Handle media sending with progress
  const handleSendMedia = async (file: File, type: 'image' | 'file') => {
    try {
      await sendMediaMessage(file, type, (progress) => {
        // Optional: Show upload progress
        console.log(`Upload progress: ${progress}%`);
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  // ENHANCED: Handle custom order sending
  const handleSendCustomOrder = async (data: any) => {
    setCustomOrderLoading(true);
    try {
      await sendCustomOrderMessage({
        title: data.title,
        description: data.description,
        estimatedPrice: data.estimatedPrice,
        customerBudget: data.customerBudget,
        timeline: data.timeline,
        specifications: data.specifications,
        attachments: data.attachmentUrls || [],
        referenceProductId: data.referenceProductId,
        expiresInDays: data.expiresInDays,
      });

      setShowCustomOrderForm(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setCustomOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy người dùng
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-full">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 h-16 border-b border-gray-200 bg-white">
        <div className="flex items-center h-full">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden ml-2"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Quay lại
            </Button>
          )}
          <div className="flex-1">
            <ConversationHeader
              participant={participant}
              isOnline={isUserOnline()}
            />
          </div>
        </div>
      </div>

      {/* Messages - Scrollable with fixed height */}
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          participant={participant}
          currentUserId={state.user!.id}
          hasMore={hasMore}
          loadingMore={loadingMore}
          participantTyping={participantTyping}
          onLoadMore={loadMoreMessages}
        />
      </div>

      {/* Input - Fixed height */}
      <div className="flex-shrink-0 h-auto">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendMedia={handleSendMedia}
          onShowCustomOrderForm={() => setShowCustomOrderForm(true)}
          onTyping={handleTyping}
          sending={sending}
          uploadingMedia={uploadingMedia}
        />
      </div>

      {/* Custom Order Form */}
      <CustomOrderForm
        isOpen={showCustomOrderForm}
        onClose={() => setShowCustomOrderForm(false)}
        onSubmit={handleSendCustomOrder}
        loading={customOrderLoading}
        artisanId={userId}
        referenceProductId={undefined}
      />
    </div>
  );
};
