import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export const FeedEmpty: React.FC = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserGroupIcon className="h-10 w-10 text-gray-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your feed is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Start following artisans to see their posts, stories, and products in
          your feed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            to="/discover"
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            variant="primary"
          >
            Discover Artisans
          </Button>

          <Button as={Link} to="/popular" variant="outline">
            See Popular Posts
          </Button>
        </div>
      </div>
    </div>
  );
};
