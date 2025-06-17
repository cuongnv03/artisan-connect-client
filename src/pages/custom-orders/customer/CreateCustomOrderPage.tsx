import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCustomOrderOperations } from '../../../hooks/custom-orders/useCustomOrderOperations';
import { artisanService } from '../../../services/artisan.service';
import { productService } from '../../../services/product.service';
import { Button } from '../../../components/ui/Button';
import { CustomOrderForm } from '../../../components/custom-orders/CustomOrderForm/CustomOrderForm';
import { ArtisanProfile } from '../../../types/artisan';
import { Product } from '../../../types/product';

export const CreateCustomOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createCustomOrder, loading } = useCustomOrderOperations();

  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [referenceProduct, setReferenceProduct] = useState<Product | null>(
    null,
  );
  const [loadingData, setLoadingData] = useState(false);

  const artisanId = searchParams.get('artisanId');
  const productId = searchParams.get('productId');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        if (artisanId) {
          const artisanData = await artisanService.getArtisanProfile(artisanId);
          setArtisan(artisanData);
        }

        if (productId) {
          const productData = await productService.getProduct(productId);
          setReferenceProduct(productData);

          // If product is loaded but no artisan, get artisan from product
          if (!artisanId && productData.seller) {
            const artisanData = await artisanService.getArtisanProfileByUserId(
              productData.seller.id,
            );
            setArtisan(artisanData);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (artisanId || productId) {
      loadInitialData();
    }
  }, [artisanId, productId]);

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy nghệ nhân
        </h3>
        <p className="text-gray-500 mb-6">
          Vui lòng chọn nghệ nhân để tạo yêu cầu custom order
        </p>
        <Button onClick={() => navigate('/discover')}>Tìm nghệ nhân</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tạo yêu cầu Custom Order
          </h1>
          <p className="text-gray-600">
            Gửi yêu cầu đặt làm sản phẩm tùy chỉnh đến {artisan.shopName}
          </p>
        </div>
      </div>

      {/* Artisan Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <img
            src={artisan.shopLogoUrl || '/default-shop.jpg'}
            alt={artisan.shopName}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-blue-900">{artisan.shopName}</h3>
            <p className="text-blue-700">{artisan.shopDescription}</p>
            <div className="flex items-center space-x-2 mt-1">
              {artisan.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Product */}
      {referenceProduct && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            Sản phẩm tham khảo:
          </h3>
          <div className="flex items-center space-x-4">
            <img
              src={referenceProduct.images[0]}
              alt={referenceProduct.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-medium">{referenceProduct.name}</h4>
              <p className="text-gray-600">
                {referenceProduct.price.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <CustomOrderForm
        artisanId={artisan.user.id}
        referenceProductId={referenceProduct?.id}
        onSubmit={createCustomOrder}
        loading={loading}
      />
    </div>
  );
};
