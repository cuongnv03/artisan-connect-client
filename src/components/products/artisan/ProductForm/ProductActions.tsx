import React, { useState } from 'react';
import { ProductStatus } from '../../../../types/product';
import { productService } from '../../../../services';
import { Button } from '../../../ui/Button';
import { ConfirmModal } from '../../../ui/Modal';
import { useToastContext } from '../../../../contexts/ToastContext';
import {
  CheckCircleIcon,
  ClockIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface ProductActionsProps {
  productId: string;
  currentStatus: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  productId,
  currentStatus,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'publish' | 'unpublish' | null
  >(null);
  const { success, error } = useToastContext();

  // ✅ SỬA: Use dedicated publish/unpublish APIs
  const handlePublish = async () => {
    setLoading(true);
    try {
      const updatedProduct = await productService.publishProduct(productId);
      onStatusChange(updatedProduct.status as ProductStatus);
      success('Sản phẩm đã được xuất bản');
    } catch (err: any) {
      error(err.message || 'Không thể xuất bản sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      const updatedProduct = await productService.unpublishProduct(productId);
      onStatusChange(updatedProduct.status as ProductStatus);
      success('Sản phẩm đã được ẩn');
    } catch (err: any) {
      error(err.message || 'Không thể ẩn sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = () => {
    if (pendingAction === 'publish') {
      handlePublish();
    } else if (pendingAction === 'unpublish') {
      handleUnpublish();
    }
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const requestAction = (action: 'publish' | 'unpublish') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  return (
    <>
      <div className="flex space-x-2">
        {currentStatus === ProductStatus.DRAFT && (
          <Button
            onClick={() => requestAction('publish')}
            loading={loading}
            leftIcon={<CheckCircleIcon className="w-4 h-4" />}
          >
            Xuất bản
          </Button>
        )}

        {currentStatus === ProductStatus.PUBLISHED && (
          <Button
            variant="outline"
            onClick={() => requestAction('unpublish')}
            loading={loading}
            leftIcon={<EyeSlashIcon className="w-4 h-4" />}
          >
            Ẩn sản phẩm
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title={
          pendingAction === 'publish'
            ? 'Xác nhận xuất bản sản phẩm'
            : 'Xác nhận ẩn sản phẩm'
        }
        message={
          pendingAction === 'publish'
            ? 'Sản phẩm sẽ hiển thị công khai và khách hàng có thể mua.'
            : 'Sản phẩm sẽ không hiển thị với khách hàng.'
        }
        type={pendingAction === 'publish' ? 'info' : 'warning'}
      />
    </>
  );
};
