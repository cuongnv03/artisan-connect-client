import React from 'react';
import { Link } from 'react-router-dom';
import { ArtisanProfile } from '../../types/artisan';
import { User } from '../../types/auth';
import { useArtisanSuggestions } from '../../hooks/home/useArtisanSuggestions';
import { ArtisanCard } from '../common/ArtisanCard';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import {
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const ArtisanSuggestions: React.FC = () => {
  const { artisans, loading, error, refreshSuggestions } =
    useArtisanSuggestions();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshSuggestions}>
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <SparklesIcon className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Nghệ nhân đề xuất
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={refreshSuggestions}>
            Làm mới
          </Button>
        </div>

        {/* Suggestions */}
        {artisans && artisans.length > 0 ? (
          <div className="space-y-4">
            {artisans.slice(0, 3).map((artisan) => (
              <div
                key={artisan.id}
                className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >
                <ArtisanCard artisan={artisan} showFollowButton={true} />
              </div>
            ))}

            {/* See More */}
            <div className="pt-4">
              <Link to="/discover">
                <Button
                  variant="outline"
                  fullWidth
                  rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">
              Chưa có gợi ý nghệ nhân
            </p>
            <Link to="/discover">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRightIcon className="w-4 h-4" />}
              >
                Khám phá ngay
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};
