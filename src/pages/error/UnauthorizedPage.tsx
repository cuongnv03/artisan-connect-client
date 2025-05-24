import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldExclamationIcon,
  ArrowRightIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated } = state;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Unauthorized Icon */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <ShieldExclamationIcon className="w-12 h-12 text-yellow-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Bạn không có quyền truy cập vào trang này.
          </p>

          <div className="space-y-4">
            {!isAuthenticated ? (
              <>
                <Link to="/auth/login">
                  <Button
                    variant="primary"
                    rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    Đăng nhập
                  </Button>
                </Link>

                <div className="text-center">
                  <Link
                    to="/auth/register"
                    className="text-sm text-accent hover:text-accent-dark"
                  >
                    Chưa có tài khoản? Đăng ký ngay
                  </Link>
                </div>
              </>
            ) : (
              <Link to="/home">
                <Button
                  variant="primary"
                  leftIcon={<HomeIcon className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Về trang chủ
                </Button>
              </Link>
            )}
          </div>

          {/* Help text */}
          <div className="mt-12 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Cần trợ giúp?
            </h3>
            <p className="text-sm text-gray-600">
              Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
