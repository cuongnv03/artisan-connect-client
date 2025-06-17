import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import { useUpgradeRequest } from '../../hooks/artisan/useUpgradeRequest';
import { useToastContext } from '../../contexts/ToastContext';
import { UpgradeRequestForm } from '../../components/artisan/upgrade/UpgradeRequestForm';
import { UpgradeRequestStatus } from '../../components/artisan/upgrade/UpgradeRequestStatus';
import { BenefitsSection } from '../../components/artisan/upgrade/BenefitsSection';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UpgradeRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { requestStatus, loading, submitting, submitRequest } =
    useUpgradeRequest();

  const handleSubmit = async (data: any) => {
    try {
      await submitRequest(data);
      success('Gửi yêu cầu thành công!');
      navigate('/profile');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <StarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trở thành nghệ nhân
        </h1>
        <p className="text-lg text-gray-600">
          Chia sẻ câu chuyện và bán sản phẩm thủ công của bạn
        </p>
      </div>

      <BenefitsSection />

      {requestStatus?.hasRequest ? (
        <UpgradeRequestStatus request={requestStatus} />
      ) : (
        <UpgradeRequestForm onSubmit={handleSubmit} loading={submitting} />
      )}
    </div>
  );
};
