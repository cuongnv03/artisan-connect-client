import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useExistingNegotiation } from '../../../../hooks/price-negotiation/useExistingNegotiation';
import { useToastContext } from '../../../../contexts/ToastContext';
import { Product } from '../../../../types/product';
import { NegotiationStatus } from '../../../../types/price-negotiation';
import { Button } from '../../../ui/Button';
import { Modal } from '../../../ui/Modal';
import { LoadingSpinner } from '../../../ui/LoadingSpinner';
import { CreateNegotiationForm } from '../../../negotiations/customer/CreateNegotiationForm';
import { ExistingNegotiationCard } from '../../../negotiations/common/ExistingNegotiationCard';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface PriceNegotiationButtonProps {
  product: Product;
  className?: string;
}

export const PriceNegotiationButton: React.FC<PriceNegotiationButtonProps> = ({
  product,
  className = '',
}) => {
  const { state: authState } = useAuth();
  const { success } = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    existingNegotiation,
    loading,
    hasActiveNegotiation,
    refetch,
    cancelNegotiation,
    canceling,
  } = useExistingNegotiation(
    product.id,
    !!authState.isAuthenticated && authState.user?.id !== product.sellerId,
  );

  // Check if negotiation is allowed
  const canNegotiate = () => {
    if (!authState.isAuthenticated) return false;
    if (authState.user?.id === product.sellerId) return false;
    if (!product.allowNegotiation) return false;
    if (product.status !== 'PUBLISHED' || product.quantity === 0) return false;
    return true;
  };

  const handleSuccess = () => {
    setShowModal(false);
    setShowCreateForm(false);
    // Force refresh để lấy negotiation mới nhất
    setTimeout(() => {
      refetch();
    }, 500);
    success('Yêu cầu thương lượng thành công!');
  };

  const handleCancelNegotiation = async (reason?: string) => {
    await cancelNegotiation(reason);
    success('Đã hủy thương lượng thành công');
    refetch();
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const getButtonConfig = () => {
    if (loading) {
      return {
        text: 'Đang kiểm tra...',
        icon: ClockIcon,
        variant: 'outline' as const,
        disabled: true,
      };
    }

    if (existingNegotiation) {
      switch (existingNegotiation.status) {
        case NegotiationStatus.PENDING:
          return {
            text: 'Chờ phản hồi',
            icon: ClockIcon,
            variant: 'outline' as const,
          };
        case NegotiationStatus.COUNTER_OFFERED:
          return {
            text: 'Có đề nghị mới!',
            icon: ExclamationTriangleIcon,
            variant: 'primary' as const,
          };
        case NegotiationStatus.ACCEPTED:
          return {
            text: 'Đã chấp nhận',
            icon: CheckCircleIcon,
            variant: 'outline' as const,
          };
        default:
          return {
            text: 'Xem thương lượng',
            icon: ChatBubbleLeftRightIcon,
            variant: 'outline' as const,
          };
      }
    }

    return {
      text: 'Thương lượng giá',
      icon: ChatBubbleLeftRightIcon,
      variant: 'outline' as const,
    };
  };

  if (!canNegotiate()) {
    return null;
  }

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Button
        variant={buttonConfig.variant}
        onClick={() => setShowModal(true)}
        leftIcon={<buttonConfig.icon className="w-4 h-4" />}
        disabled={buttonConfig.disabled || loading}
        className={className}
      >
        {buttonConfig.text}
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setShowCreateForm(false);
        }}
        title={
          showCreateForm
            ? 'Tạo thương lượng mới'
            : existingNegotiation
            ? 'Thương lượng hiện tại'
            : 'Thương lượng giá sản phẩm'
        }
        size="lg"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : showCreateForm || !existingNegotiation ? (
          <CreateNegotiationForm
            product={product}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowModal(false);
              setShowCreateForm(false);
            }}
          />
        ) : (
          <ExistingNegotiationCard
            negotiation={existingNegotiation}
            onCancel={handleCancelNegotiation}
            onCreateNew={handleCreateNew}
            canceling={canceling}
          />
        )}
      </Modal>
    </>
  );
};
