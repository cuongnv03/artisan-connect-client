import { useState, useEffect, useCallback, useRef } from 'react';
import { ArtisanProfile } from '../../types/artisan';
import { User } from '../../types/auth';
import { artisanService } from '../../services/artisan.service';

export const useArtisanSuggestions = () => {
  const [artisans, setArtisans] = useState<(ArtisanProfile & { user: User })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadSuggestions = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await artisanService.getSuggestedArtisans({
        page: 1,
        limit: 5,
        excludeFollowed: true,
        baseOnInterests: true,
        verified: true,
      });

      // Check if component is still mounted
      if (!mountedRef.current) return;

      const artisansData = Array.isArray(response)
        ? response
        : response.data || [];

      console.log('Setting artisans to state:', artisansData);
      setArtisans(artisansData);
    } catch (err: any) {
      if (!mountedRef.current) return;

      console.error('Error loading artisan suggestions:', err);
      setError(err.message || 'Không thể tải gợi ý nghệ nhân');
      setArtisans([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Remove dependencies to prevent re-creation

  const refreshSuggestions = useCallback(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    mountedRef.current = true;
    loadSuggestions();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Only run once on mount

  return {
    artisans,
    loading,
    error,
    refreshSuggestions,
  };
};
