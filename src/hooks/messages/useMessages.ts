import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../../services/message.service';
import { MessageWithUsers, MessageQueryOptions } from '../../types/message';
import { PaginatedResponse } from '../../types/common';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';

export const useMessages = (options: MessageQueryOptions = {}) => {
  const { state: authState } = useAuth();
  const { error } = useToastContext();

  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadMessages = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    setLoading(true);
    try {
      const result = await messageService.getMessages({
        ...options,
        page: currentPage,
        limit: 20,
      });

      setMessages(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      error(err.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [currentPage, options, authState.isAuthenticated, error]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const refreshMessages = () => {
    setCurrentPage(1);
    loadMessages();
  };

  return {
    messages,
    loading,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    refreshMessages,
  };
};
