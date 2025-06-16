import { useEffect, useCallback } from 'react';
import { useDiscoverContext } from '../../contexts/DiscoverContext';
import { artisanService } from '../../services/artisan.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { userService } from '../../services/user.service';
import { useToastContext } from '../../contexts/ToastContext';

export const useDiscoverSearch = () => {
  const { state, setFilters } = useDiscoverContext();
  const { error } = useToastContext();

  const performSearch = useCallback(async () => {
    if (!state.searchQuery) return;

    try {
      const searchParams = {
        q: state.searchQuery,
        page: state.currentPage,
        limit: state.pagination.limit,
        ...state.filters,
      };

      if (state.activeTab === 'all') {
        const [artisansResult, usersResult, postsResult, productsResult] =
          await Promise.allSettled([
            artisanService.searchArtisans({ ...searchParams, limit: 6 }),
            userService.searchUsers({ ...searchParams, limit: 6 }),
            postService.getPosts({ ...searchParams, limit: 6 } as any),
            productService.searchProducts({ ...searchParams, limit: 6 }),
          ]);

        return {
          artisans:
            artisansResult.status === 'fulfilled'
              ? artisansResult.value.data
              : [],
          users:
            usersResult.status === 'fulfilled' ? usersResult.value.data : [],
          posts:
            postsResult.status === 'fulfilled' ? postsResult.value.data : [],
          products:
            productsResult.status === 'fulfilled'
              ? productsResult.value.data
              : [],
          totals: {
            artisans:
              artisansResult.status === 'fulfilled'
                ? artisansResult.value.meta.total
                : 0,
            users:
              usersResult.status === 'fulfilled'
                ? usersResult.value.meta.total
                : 0,
            posts:
              postsResult.status === 'fulfilled'
                ? postsResult.value.meta.total
                : 0,
            products:
              productsResult.status === 'fulfilled'
                ? productsResult.value.meta.total
                : 0,
          },
        };
      } else {
        let result;
        switch (state.activeTab) {
          case 'artisans':
            result = await artisanService.searchArtisans(searchParams);
            break;
          case 'users':
            result = await userService.searchUsers(searchParams);
            break;
          case 'posts':
            result = await postService.getPosts(searchParams as any);
            break;
          case 'products':
            result = await productService.searchProducts(searchParams);
            break;
        }

        if (result) {
          return {
            [state.activeTab]: result.data,
            pagination: {
              total: result.meta.total,
              totalPages: result.meta.totalPages,
              limit: result.meta.limit,
            },
          };
        }
      }
    } catch (err: any) {
      error('Có lỗi xảy ra khi tìm kiếm');
      console.error('Search error:', err);
    }
  }, [
    state.searchQuery,
    state.activeTab,
    state.filters,
    state.currentPage,
    error,
  ]);

  return {
    performSearch,
  };
};
