import React, { useState } from 'react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { MessageType, CustomOrderProposal } from '../../types/message';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { CustomOrderForm } from '../custom-orders/CustomOrderForm';
import { useConversation } from '../../hooks/messages/useConversation';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { messageService } from '../../services/message.service';
import { customOrderService } from '../../services/custom-order.service';

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
  const { success: showSuccess, error: showError } = useToastContext();
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const {
    messages,
    participant,
    loading,
    sending,
    hasMore,
    loadingMore,
    participantTyping,
    sendMessage,
    loadMoreMessages,
    handleTyping,
  } = useConversation(userId);

  const isUserOnline = () => {
    return onlineUsers.has(userId);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleSendMedia = async (file: File, type: 'image' | 'file') => {
    setUploadingMedia(true);
    try {
      // Validate file
      if (type === 'image') {
        const validation = uploadService.validateImageFile(file);
        if (!validation.valid) {
          showError(validation.error || 'File không hợp lệ');
          return;
        }
      }

      // Upload file
      const uploadResult = await uploadService.uploadImage(file, {
        folder: 'messages',
      });

      // Send message with attachment
      const messageData = {
        receiverId: userId,
        content:
          type === 'image'
            ? '📷 Đã gửi hình ảnh'
            : `📄 Đã gửi tài liệu: ${file.name}`,
        type: type === 'image' ? MessageType.IMAGE : MessageType.FILE,
        attachments: [uploadResult.url],
        productMentions: {
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      };

      await messageService.sendMessage(messageData);
      showSuccess(`${type === 'image' ? 'Hình ảnh' : 'Tài liệu'} đã được gửi`);
    } catch (error: any) {
      showError(
        error.message ||
          `Không thể gửi ${type === 'image' ? 'hình ảnh' : 'tài liệu'}`,
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSendCustomOrder = async (proposal: CustomOrderProposal) => {
    setCustomOrderLoading(true);
    try {
      // Gọi service để tạo custom order thực sự thay vì chỉ gửi message
      const customOrder = await customOrderService.createCustomOrder(proposal);

      // Sau đó gửi message thông báo
      await sendMessage(
        `🛠️ Tôi đã gửi một đề xuất custom order: "${proposal.title}"`,
        MessageType.CUSTOM_ORDER,
        {
          type: 'custom_order_created',
          customOrderId: customOrder.id,
          proposal: proposal,
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      );

      showSuccess('Đề xuất custom order đã được gửi');
      setShowCustomOrderForm(false);
    } catch (error: any) {
      showError(error.message || 'Không thể gửi đề xuất custom order');
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

      {/* Messages - Scrollable với height cố định */}
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
        artisanId={userId} // Truyền artisanId
        referenceProductId={undefined} // Có thể thêm logic để chọn reference product
      />
    </div>
  );
};
