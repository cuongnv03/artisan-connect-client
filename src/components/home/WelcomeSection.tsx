import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WelcomeSectionProps {
  showFallback: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  showFallback,
  onRefresh,
  refreshing,
}) => {
  const { state } = useAuth();
  const { user } = state;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="bg-gradient-vietnamese text-white rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-white">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-100">
            {showFallback
              ? 'Khám phá những câu chuyện từ cộng đồng nghệ nhân'
              : 'Những câu chuyện mới từ những người bạn theo dõi'}
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            loading={refreshing}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
          <SparklesIcon className="w-16 h-16 text-gold-300 opacity-80" />
        </div>
      </div>
    </div>
  );
};
