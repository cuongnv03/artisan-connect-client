import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEmailVerification } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { ROUTE_PATHS } from '../../constants/routes';

interface EmailVerificationStatusProps {
  token: string;
}

export const EmailVerificationStatus: React.FC<
  EmailVerificationStatusProps
> = ({ token }) => {
  const { verifyEmail, isLoading } = useEmailVerification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ');
        return;
      }

      const success = await verifyEmail(token);
      if (success) {
        setStatus('success');
        setMessage('Email đã được xác thực thành công!');
      } else {
        setStatus('error');
        setMessage('Xác thực email thất bại');
      }
    };

    verify();
  }, [token, verifyEmail]);

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
    <div className="text-center space-y-6">
      <div>
        {status === 'success' ? (
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        ) : (
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'success' ? 'Xác thực thành công!' : 'Xác thực thất bại'}
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="space-y-4">
        {status === 'success' ? (
          <Link to={ROUTE_PATHS.AUTH.LOGIN}>
            <Button>Đăng nhập ngay</Button>
          </Link>
        ) : (
          <>
            <Link to={ROUTE_PATHS.AUTH.LOGIN}>
              <Button>Về trang đăng nhập</Button>
            </Link>
            <div className="text-sm text-gray-500">
              Hoặc{' '}
              <Link
                to="/contact"
                className="text-primary hover:text-primary-dark"
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
