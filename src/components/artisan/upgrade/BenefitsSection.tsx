import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '../../ui/Card';

export const BenefitsSection: React.FC = () => {
  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Quyền lợi nghệ nhân
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Tạo và bán sản phẩm</span>
        </div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Tùy chỉnh trang cá nhân</span>
        </div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Thống kê chi tiết</span>
        </div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Hỗ trợ ưu tiên</span>
        </div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Công cụ marketing</span>
        </div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">Cộng đồng nghệ nhân</span>
        </div>
      </div>
    </Card>
  );
};
