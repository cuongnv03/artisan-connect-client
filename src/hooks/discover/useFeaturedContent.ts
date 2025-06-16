import { useState, useEffect } from 'react';
import { artisanService } from '../../services/artisan.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';

interface FeaturedContent {
  artisans: any[];
  posts: any[];
  products: any[];
}

export const useFeaturedContent = () => {
  const [content, setContent] = useState<FeaturedContent>({
    artisans: [],
    posts: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    setLoading(true);
    try {
      const [featuredArtisans, topPosts, featuredProducts] =
        await Promise.allSettled([
          artisanService.getFeaturedArtisans(),
          postService.getPosts({
            sortBy: 'viewCount',
            sortOrder: 'desc',
            limit: 6,
          }),
          productService.getProducts({
            sortBy: 'salesCount',
            sortOrder: 'desc',
            limit: 8,
          }),
        ]);

      setContent({
        artisans:
          featuredArtisans.status === 'fulfilled' ? featuredArtisans.value : [],
        posts: topPosts.status === 'fulfilled' ? topPosts.value.data : [],
        products:
          featuredProducts.status === 'fulfilled'
            ? featuredProducts.value.data
            : [],
      });
    } catch (error) {
      console.error('Load featured content error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, reload: loadFeaturedContent };
};
