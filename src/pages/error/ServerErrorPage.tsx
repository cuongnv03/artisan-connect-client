import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export const ServerErrorPage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Server Error Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lỗi máy chủ</h1>
          <p className="text-lg text-gray-600 mb-8">
            Đã xảy ra lỗi không mong muốn. Chúng tôi đang khắc phục sự cố.
          </p>

          <div className="space-y-4">
            <Button
              variant="primary"
              onClick={handleRefresh}
              leftIcon={<ArrowPathIcon className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Tải lại trang
            </Button>

            <div className="text-center">
              <Link
                to="/home"
                className="inline-flex items-center text-sm text-accent hover:text-accent-dark"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Về trang chủ
              </Link>
            </div>
          </div>

          {/* Contact support */}
          <div className="mt-12 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Cần hỗ trợ?
            </h3>
            <p className="text-sm text-gray-600">
              Nếu sự cố vẫn tiếp tục, vui lòng liên hệ{' '}
              <a
                href="mailto:support@artisanconnect.vn"
                className="text-accent hover:text-accent-dark"
              >
                support@artisanconnect.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
