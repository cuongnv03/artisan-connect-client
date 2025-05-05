import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../store/AuthContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { Loader } from '../../../components/ui/Loader';
import {
  CubeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { ArtisanService } from '../../../services/artisan.service';
import { formatDate } from '../../../utils/formatters';

const ArtisanDashboard: React.FC = () => {
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);

  // Mock data (would come from API in production)
  const dashboardStats = {
    products: 12,
    orders: {
      total: 48,
      pending: 3,
    },
    revenue: {
      total: 4250,
      thisMonth: 850,
    },
    views: {
      products: 320,
      profile: 95,
    },
  };

  const recentOrders = [
    {
      id: 'ORD-1234',
      customer: 'Sarah Johnson',
      date: '2023-05-01',
      amount: 125,
      status: 'Completed',
    },
    {
      id: 'ORD-1235',
      customer: 'David Miller',
      date: '2023-05-02',
      amount: 89,
      status: 'Processing',
    },
    {
      id: 'ORD-1236',
      customer: 'Emily Clark',
      date: '2023-05-02',
      amount: 210,
      status: 'Pending',
    },
  ];

  useEffect(() => {
    const fetchArtisanProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ArtisanService.getMyProfile();
        setArtisanProfile(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load artisan profile',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtisanProfile();
  }, []);

  if (isLoading) {
    return <Loader size="lg" text="Loading your artisan dashboard..." />;
  }

  if (error) {
    return (
      <Alert type="error" title="Error" variant="subtle">
        {error}
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-0">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {artisanProfile.shopName}
          </h1>
          <p className="text-gray-600">
            Welcome back, {state.user?.firstName}! Here's what's happening with
            your shop today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<PencilSquareIcon className="h-5 w-5" />}
            as={Link}
            to="/artisan/profile"
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            leftIcon={<ShoppingBagIcon className="h-5 w-5" />}
            as={Link}
            to="/products/create"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-200 text-amber-700">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-amber-700 font-medium">
                Total Products
              </p>
              <p className="text-2xl font-semibold text-amber-900">
                {dashboardStats.products}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-200 text-blue-700">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-blue-700 font-medium">
                Pending Orders
              </p>
              <p className="text-2xl font-semibold text-blue-900">
                {dashboardStats.orders.pending}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-200 text-green-700">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-green-700 font-medium">
                Monthly Revenue
              </p>
              <p className="text-2xl font-semibold text-green-900">
                ${dashboardStats.revenue.thisMonth}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-200 text-purple-700">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-purple-700 font-medium">
                Profile Views
              </p>
              <p className="text-2xl font-semibold text-purple-900">
                {dashboardStats.views.profile}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Orders
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-accent">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${order.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" as={Link} to="/orders">
              View All Orders
            </Button>
          </div>
        </Card>

        {/* Shop Overview */}
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Shop Overview
          </h2>

          <div className="space-y-4">
            {artisanProfile.isVerified ? (
              <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Verified Artisan Shop</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-700 bg-amber-50 p-3 rounded-lg">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Verification Pending</span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Shop Rating</h3>
              <div className="flex items-center mt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(artisanProfile.rating || 0)
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-700">
                  {artisanProfile.rating
                    ? artisanProfile.rating.toFixed(1)
                    : 'No ratings yet'}
                  {artisanProfile.reviewCount > 0 &&
                    ` (${artisanProfile.reviewCount} reviews)`}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Shop Created
              </h3>
              <p className="mt-1 text-gray-700">
                {formatDate(artisanProfile.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Specialties</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {artisanProfile.specialties.map(
                  (specialty: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {specialty}
                    </span>
                  ),
                )}
              </div>
            </div>

            <Link
              to="/artisan/profile"
              className="block text-accent hover:text-accent-dark font-medium text-sm"
            >
              View Complete Shop Profile →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
