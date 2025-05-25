import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 với Vietnamese pattern */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 pattern-vietnamese">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-6xl font-bold text-primary">404</h1>
            </div>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Không tìm thấy trang
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>

          <div className="mt-8 space-y-4">
            <Link to="/home">
              <Button
                variant="primary"
                leftIcon={<HomeIcon className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Về trang chủ
              </Button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="block w-full sm:w-auto sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay lại trang trước
            </button>
          </div>

          {/* Vietnamese decorative elements */}
          <div className="mt-12 opacity-30">
            <div className="lotus-pattern h-16 w-16 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
