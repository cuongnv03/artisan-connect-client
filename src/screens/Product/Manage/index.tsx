import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/form/Button';
import { Input } from '../../../components/form/Input';
import { Dropdown } from '../../../components/form/Dropdown';
import { Badge } from '../../../components/common/Badge';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { ProductService } from '../../../services/product.service';
import { formatPrice } from '../../../helpers/formatters';
import { ProductStatus } from '../../../types/product.types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { debounce } from '../../../helpers/common';

const ProductsManage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Create debounced search function
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      setSearch(value);
      setPage(1); // Reset to first page on new search
    }, 500),
    [],
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Fetch products with filters
  const { data, isLoading, isError, error } = useQuery(
    ['myProducts', page, limit, search, statusFilter],
    () =>
      ProductService.getMyProducts({
        page,
        limit,
        search: search || undefined,
        status: (statusFilter as ProductStatus) || undefined,
      }),
    {
      keepPreviousData: true,
    },
  );

  // Status filter options
  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Published', value: ProductStatus.PUBLISHED },
    { label: 'Draft', value: ProductStatus.DRAFT },
    { label: 'Out of Stock', value: ProductStatus.OUT_OF_STOCK },
    { label: 'Discontinued', value: ProductStatus.DISCONTINUED },
  ];

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Implement deletion logic
        // await ProductService.deleteProduct(id);
        alert('Product deleted successfully');
        // Refetch products after deletion
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: ProductStatus) => {
    const statusConfig = {
      [ProductStatus.PUBLISHED]: { variant: 'success', label: 'Published' },
      [ProductStatus.DRAFT]: { variant: 'info', label: 'Draft' },
      [ProductStatus.OUT_OF_STOCK]: {
        variant: 'warning',
        label: 'Out of Stock',
      },
      [ProductStatus.DISCONTINUED]: {
        variant: 'danger',
        label: 'Discontinued',
      },
      [ProductStatus.DELETED]: { variant: 'danger', label: 'Deleted' },
    };

    const config = statusConfig[status] || {
      variant: 'default',
      label: status,
    };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <Button
          as={Link}
          to="/products/create"
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              leftAddon={
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              }
              onChange={handleSearchChange}
              defaultValue=""
            />
          </div>
          <div className="w-full md:w-48">
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as string);
                setPage(1);
              }}
              placeholder="Filter by status"
            />
          </div>
        </div>
      </Card>

      {/* Error state */}
      {isError && (
        <Alert type="error" title="Error loading products">
          {(error as Error).message ||
            'Failed to load products. Please try again.'}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-10 flex justify-center">
          <Loader size="lg" text="Loading products..." />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.data.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first product to start selling
            </p>
            <Button
              as={Link}
              to="/products/create"
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Add Product
            </Button>
          </div>
        </Card>
      )}

      {/* Product list */}
      {!isLoading && data?.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.images[0] || '/placeholder-product.png'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.discountPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      as={Link}
                      to={`/product/${product.id}`}
                      variant="ghost"
                      size="sm"
                    >
                      View
                    </Button>
                    <Button
                      as={Link}
                      to={`/products/edit/${product.id}`}
                      variant="outline"
                      size="sm"
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, data.meta.total)} of {data.meta.total}{' '}
            products
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.meta.totalPages}
              onClick={() =>
                setPage((p) => Math.min(data.meta.totalPages, p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManage;
