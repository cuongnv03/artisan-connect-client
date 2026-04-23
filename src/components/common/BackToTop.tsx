import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all hover:scale-110"
    >
      <ArrowUpIcon className="w-5 h-5" />
    </button>
  );
};
