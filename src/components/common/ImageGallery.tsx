import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';

interface ImageGalleryProps {
  images: string[];
  className?: string;
  showThumbnails?: boolean;
  maxHeight?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  showThumbnails = true,
  maxHeight = '400px',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  if (images.length === 1) {
    return (
      <div className={className}>
        <img
          src={images[0]}
          alt="Gallery image"
          className="w-full object-cover rounded-lg cursor-pointer"
          style={{ maxHeight }}
          onClick={() => openModal(0)}
        />

        {/* Modal for full view */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="full"
          showCloseButton={false}
        >
          <div className="relative">
            <img
              src={images[0]}
              alt="Full size"
              className="w-full h-auto max-h-screen object-contain"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="relative">
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="w-full object-cover rounded-lg cursor-pointer"
          style={{ maxHeight }}
          onClick={() => openModal(currentIndex)}
        />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-primary'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="full"
        showCloseButton={false}
      >
        <div className="relative h-full">
          <img
            src={images[currentIndex]}
            alt="Full size"
            className="w-full h-full object-contain"
          />

          {/* Modal Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-50 text-white rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </Modal>
    </div>
  );
};
