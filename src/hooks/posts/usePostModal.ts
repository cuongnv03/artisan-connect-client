import { useState, useCallback } from 'react';
import { Post } from '../../types/post';

export const usePostModal = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((post: Post) => {
    setSelectedPost(post);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPost(null);
    setIsOpen(false);
  }, []);

  return {
    selectedPost,
    isOpen,
    openModal,
    closeModal,
  };
};
