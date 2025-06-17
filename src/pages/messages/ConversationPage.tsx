import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { MessageType, CustomOrderProposal } from '../../types/message';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConversationHeader } from '../../components/messages/ConversationHeader';
import { MessageList } from '../../components/messages/MessageList';
import { MessageInput } from '../../components/messages/MessageInput';
import { CustomOrderProposalForm } from '../../components/messages/CustomOrderProposalForm';
import { useConversation } from '../../hooks/messages/useConversation';
import { useToastContext } from '../../contexts/ToastContext';
import { messageService } from '../../services/message.service';

export const ConversationPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useAuth();
  const { onlineUsers } = useSocketContext();
  const { success: showSuccess, error: showError } = useToastContext();
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);

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
    await sendMessage(content);
  };

  const handleSendCustomOrder = async (proposal: CustomOrderProposal) => {
    if (!userId) return;

    setCustomOrderLoading(true);
    try {
      await sendMessage(
        `🛠️ Tôi có một đề xuất custom order cho bạn: "${proposal.productName}"`,
        MessageType.CUSTOM_ORDER,
        {
          type: 'custom_order_proposal',
          negotiationId: `custom_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          proposal: {
            ...proposal,
            deadline: proposal.deadline
              ? proposal.deadline.toISOString()
              : undefined,
          },
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
        onShowCustomOrderForm={() => setShowCustomOrderForm(true)}
        onTyping={handleTyping}
        sending={sending}
      />

      <CustomOrderProposalForm
        isOpen={showCustomOrderForm}
        onClose={() => setShowCustomOrderForm(false)}
        onSubmit={handleSendCustomOrder}
        loading={customOrderLoading}
      />
    </div>
  );
};
