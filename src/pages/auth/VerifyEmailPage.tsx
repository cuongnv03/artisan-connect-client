import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/auth.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email đã được xác thực thành công!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Xác thực email thất bại');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Đang xác thực email...
        </h2>
        <p className="mt-2 text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  return (
    <div className="text-center animate-fade-in">
      <div className="mb-6">
        {status === 'success' ? (
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        ) : (
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {status === 'success' ? 'Xác thực thành công!' : 'Xác thực thất bại'}
      </h2>

      <p className="text-gray-600 mb-8">{message}</p>

      <div className="space-y-4">
        {status === 'success' ? (
          <Link to="/auth/login">
            <Button>Đăng nhập ngay</Button>
          </Link>
        ) : (
          <>
            <Link to="/auth/login">
              <Button>Về trang đăng nhập</Button>
            </Link>
            <div className="text-sm text-gray-500">
              Hoặc{' '}
              <Link
                to="/contact"
                className="text-accent hover:text-accent-dark"
              >
                liên hệ hỗ trợ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
