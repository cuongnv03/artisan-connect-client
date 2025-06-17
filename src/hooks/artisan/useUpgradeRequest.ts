import { useState, useEffect } from 'react';
import { artisanService } from '../../services/artisan.service';
import {
  UpgradeRequestStatus,
  UpgradeRequestStatusResponse,
} from '../../types/artisan';

export const useUpgradeRequest = () => {
  const [requestStatus, setRequestStatus] =
    useState<UpgradeRequestStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkRequestStatus();
  }, []);

  const checkRequestStatus = async () => {
    try {
      setLoading(true);
      const status = await artisanService.getUpgradeRequestStatus();
      setRequestStatus(status);
    } catch (err: any) {
      if (err.status !== 404) {
        console.error('Error checking upgrade request:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (data: any) => {
    setSubmitting(true);
    try {
      if (requestStatus?.status === UpgradeRequestStatus.REJECTED) {
        await artisanService.updateUpgradeRequest(data);
      } else {
        await artisanService.requestUpgrade(data);
      }
      await checkRequestStatus();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    requestStatus,
    loading,
    submitting,
    submitRequest,
    checkRequestStatus,
  };
};
