import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArtisanSuggestions } from '../../hooks/home/useArtisanSuggestions';
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

  // Memoize artisan list để tránh re-render không cần thiết
  const artisanList = useMemo(() => {
    return artisans?.slice(0, 3) || [];
  }, [artisans]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
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
        {artisanList.length > 0 ? (
          <div className="space-y-4">
            {artisanList.map((artisan, index) => (
              <div
                key={`${artisan.id}-${index}`}
                className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={artisan.user?.avatarUrl || '/default-avatar.png'}
                    alt={`${artisan.user?.firstName} ${artisan.user?.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/default-avatar.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${artisan.userId}`}
                      className="font-medium text-gray-900 hover:text-primary truncate block"
                    >
                      {artisan.user?.firstName} {artisan.user?.lastName}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">
                      {artisan.shopName}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>
                        {artisan.user?.followerCount || 0} người theo dõi
                      </span>
                      {artisan.isVerified && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-blue-500">Đã xác thực</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Theo dõi
                  </Button>
                </div>
                {artisan.specialties && artisan.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artisan.specialties.slice(0, 2).map((specialty, idx) => (
                      <span
                        key={`${specialty}-${idx}`}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
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
