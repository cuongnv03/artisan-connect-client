import { useState, useEffect } from 'react';
import { artisanService } from '../../services/artisan.service';
import { UserProfileDto } from '../../types/user';

export const useArtisanProfile = (userId: string) => {
  const [artisan, setArtisan] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtisanProfile();
  }, [userId]);

  const loadArtisanProfile = async () => {
    try {
      setLoading(true);
      const profile = await artisanService.getArtisanProfileByUserId(userId);
      setArtisan(profile as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    artisan,
    loading,
    error,
    refreshProfile: loadArtisanProfile,
  };
};
