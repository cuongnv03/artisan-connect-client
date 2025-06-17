import { useState, useEffect } from 'react';
import {
  WishlistWithDetails,
  WishlistItemType,
  WishlistPaginationResult,
} from '../../types/wishlist';
import {
  wishlistService,
  GetWishlistQuery,
} from '../../services/wishlist.service';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const useWishlist = (itemType?: WishlistItemType) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<WishlistPaginationResult['meta'] | null>(
    null,
  );
  const { success, error: showError } = useToastContext();
  const { state: authState } = useAuth();

  const loadWishlist = async (query: GetWishlistQuery = {}) => {
    if (!authState.isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const finalQuery = { ...query, itemType: itemType || query.itemType };
      const response = await wishlistService.getWishlistItems(finalQuery);

      if (finalQuery.page === 1) {
        setWishlistItems(response.data);
      } else {
        setWishlistItems((prev) => [...prev, ...response.data]);
      }
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách yêu thích';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<boolean> => {
    try {
      const data = {
        itemType,
        ...(itemType === WishlistItemType.PRODUCT
          ? { productId: itemId }
          : { postId: itemId }),
      };
      await wishlistService.addToWishlist(data);
      success('Đã thêm vào danh sách yêu thích');
      await refetch();
      return true;
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể thêm vào danh sách yêu thích';
      showError(errorMessage);
      return false;
    }
  };

  const removeFromWishlist = async (
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<boolean> => {
    try {
      await wishlistService.removeFromWishlist(itemType, itemId);
      success('Đã xóa khỏi danh sách yêu thích');
      await refetch();
      return true;
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể xóa khỏi danh sách yêu thích';
      showError(errorMessage);
      return false;
    }
  };

  const toggleWishlistItem = async (
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<boolean> => {
    try {
      const data = {
        itemType,
        ...(itemType === WishlistItemType.PRODUCT
          ? { productId: itemId }
          : { postId: itemId }),
      };
      const response = await wishlistService.toggleWishlistItem(data);
      success(response.message);
      await refetch();
      return response.inWishlist;
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể cập nhật danh sách yêu thích';
      showError(errorMessage);
      return false;
    }
  };

  const checkWishlistStatus = async (
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<boolean> => {
    try {
      const response = await wishlistService.checkWishlistStatus(
        itemType,
        itemId,
      );
      return response.inWishlist;
    } catch (err: any) {
      return false;
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadWishlist({ page: 1, limit: 10 });
    }
  }, [authState.isAuthenticated, itemType]);

  const refetch = () => loadWishlist({ page: 1, limit: 10 });
  const loadMore = () => {
    if (meta && meta.page < meta.totalPages) {
      loadWishlist({ page: meta.page + 1, limit: 10 });
    }
  };

  return {
    wishlistItems,
    loading,
    error,
    meta,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    checkWishlistStatus,
    refetch,
    loadMore,
    hasMore: meta ? meta.page < meta.totalPages : false,
  };
};
