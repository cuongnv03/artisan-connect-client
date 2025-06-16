import React from 'react';
import { useParams } from 'react-router-dom';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Token không hợp lệ
        </h2>
        <p className="text-gray-600">
          Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ResetPasswordForm token={token} />
    </div>
  );
};
