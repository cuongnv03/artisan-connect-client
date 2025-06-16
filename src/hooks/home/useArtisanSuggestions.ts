import { useState, useEffect, useCallback } from 'react';
import { ArtisanProfile } from '../../types/artisan';
import { User } from '../../types/auth';
import { artisanService } from '../../services/artisan.service';

export const useArtisanSuggestions = () => {
  const [artisans, setArtisans] = useState<(ArtisanProfile & { user: User })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
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

      setArtisans(response.data);
    } catch (err: any) {
      console.error('Error loading artisan suggestions:', err);
      setError(err.message || 'Không thể tải gợi ý nghệ nhân');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSuggestions = useCallback(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    artisans,
    loading,
    error,
    refreshSuggestions,
  };
};
