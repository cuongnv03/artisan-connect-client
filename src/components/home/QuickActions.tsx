import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  PlusIcon,
  UserGroupIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  showFallback: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ showFallback }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Button
        variant="outline"
        className="justify-start p-4 h-auto"
        leftIcon={<PlusIcon className="w-5 h-5" />}
        onClick={() => navigate('/posts/create')}
      >
        <div className="text-left">
          <div className="font-medium">Tạo bài viết</div>
          <div className="text-sm text-gray-500">
            Chia sẻ câu chuyện của bạn
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="justify-start p-4 h-auto"
        leftIcon={<UserGroupIcon className="w-5 h-5" />}
        onClick={() => navigate('/discover')}
      >
        <div className="text-left">
          <div className="font-medium">Khám phá</div>
          <div className="text-sm text-gray-500">
            {showFallback ? 'Tìm nghệ nhân để theo dõi' : 'Tìm nghệ nhân mới'}
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="justify-start p-4 h-auto"
        leftIcon={<HeartIcon className="w-5 h-5" />}
        onClick={() => navigate('/shop')}
      >
        <div className="text-left">
          <div className="font-medium">Cửa hàng</div>
          <div className="text-sm text-gray-500">Sản phẩm thủ công</div>
        </div>
      </Button>
    </div>
  );
};
