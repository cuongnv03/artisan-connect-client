import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { MessageType, CustomOrderProposal } from '../../types/message';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConversationHeader } from '../../components/messages/ConversationHeader';
import { MessageList } from '../../components/messages/MessageList';
import { MessageInput } from '../../components/messages/MessageInput';
import { CustomOrderForm } from '../../components/custom-orders/CustomOrderForm';
import { useConversation } from '../../hooks/messages/useConversation';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { messageService } from '../../services/message.service';

export const ConversationPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
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
  } = useConversation(userId!);

  const isUserOnline = () => {
    return userId ? onlineUsers.has(userId) : false;
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage({ receiverId: userId!, content, type: MessageType.TEXT });
  };

  const handleSendMedia = async (file: File, type: 'image' | 'file') => {
    if (!userId) return;

    setUploadingMedia(true);
    try {
      // Validate file
      if (type === 'image') {
        const validation = uploadService.validateImageFile(file);
        if (!validation.valid) {
          showError(validation.error || 'File không hợp lệ');
          return;
        }
      } else {
        // Basic file validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          showError('File không được vượt quá 10MB');
          return;
        }
      }

      // Upload file
      const uploadResult = await uploadService.uploadImage(file, {
        folder: 'messages',
      });

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

      // Gọi service trực tiếp để có attachments
      const newMessage = await messageService.sendMessage(messageData);

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
    if (!userId) return;

    setCustomOrderLoading(true);
    try {
      await sendMessage({
        receiverId: userId!,
        content: `🛠️ Tôi có một đề xuất custom order cho bạn: "${proposal.productName}"`,
        type: MessageType.CUSTOM_ORDER,
        productMentions: {
          type: 'custom_order_proposal',
          negotiationId: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          proposal,
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      });

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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy người dùng
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <ConversationHeader participant={participant} isOnline={isUserOnline()} />

      <MessageList
        messages={messages}
        participant={participant}
        currentUserId={state.user!.id}
        hasMore={hasMore}
        loadingMore={loadingMore}
        participantTyping={participantTyping}
        onLoadMore={loadMoreMessages}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        onShowCustomOrderForm={() => setShowCustomOrderForm(true)}
        onTyping={handleTyping}
        sending={sending}
        uploadingMedia={uploadingMedia}
      />

      <CustomOrderForm
        isOpen={showCustomOrderForm}
        onClose={() => setShowCustomOrderForm(false)}
        onSubmit={handleSendCustomOrder}
        loading={customOrderLoading}
      />
    </div>
  );
};
