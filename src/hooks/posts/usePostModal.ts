import { useState, useCallback } from 'react';
import { Post } from '../../types/post';

export const usePostModal = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((post: Post) => {
    console.log('Opening modal for post:', post.id); // Debug log
    setSelectedPost(post);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing modal'); // Debug log
    setIsOpen(false);
    // Delay clearing selectedPost to allow closing animation
    setTimeout(() => {
      setSelectedPost(null);
    }, 300);
  }, []);

  return {
    selectedPost,
    isOpen,
    openModal,
    closeModal,
  };
};
