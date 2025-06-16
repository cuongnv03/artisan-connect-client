import React from 'react';
import { ContentBlock } from '../../../types/post';
import { ImageGallery } from '../../common/ImageGallery';

interface PostContentProps {
  content: ContentBlock[];
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {block.data?.text || ''}
          </p>
        );

      case 'heading':
        return (
          <h2
            key={index}
            className="text-2xl font-semibold text-gray-900 mb-4 mt-8"
          >
            {block.data?.text || ''}
          </h2>
        );

      case 'quote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary bg-gray-50 p-4 rounded-r-lg mb-4 italic text-gray-700"
          >
            <p>{block.data?.text || ''}</p>
            {block.data?.author && (
              <cite className="block text-sm text-gray-500 mt-2">
                — {block.data.author}
              </cite>
            )}
          </blockquote>
        );

      case 'image':
        return (
          <div key={index} className="mb-6">
            <img
              src={block.data?.url}
              alt={block.data?.caption || ''}
              className="w-full rounded-lg"
            />
            {block.data?.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case 'list':
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {(block.data?.items || []).map(
              (item: string, itemIndex: number) => (
                <li key={itemIndex} className="text-gray-700">
                  {item}
                </li>
              ),
            )}
          </ul>
        );

      case 'gallery':
        return (
          <div key={index} className="mb-6">
            {block.data?.images && block.data.images.length > 0 && (
              <ImageGallery
                images={block.data.images.map((img: any) => img.url)}
              />
            )}
          </div>
        );

      case 'video':
        return (
          <div key={index} className="mb-6">
            <video
              src={block.data?.url}
              controls
              className="w-full rounded-lg"
            />
            {block.data?.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case 'divider':
        return <hr key={index} className="my-8 border-gray-300" />;

      default:
        return (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm">
              Loại nội dung không được hỗ trợ: {block.type}
            </p>
            {block.data?.text && (
              <p className="text-gray-700 mt-2">{block.data.text}</p>
            )}
          </div>
        );
    }
  };

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có nội dung</p>
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      {content.map((block, index) => renderContentBlock(block, index))}
    </div>
  );
};
