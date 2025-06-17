import React from 'react';
import { ContentBlock } from '../../../types/post';
import { ImageGallery } from '../../common/ImageGallery';

interface PostContentProps {
  content: ContentBlock[] | { blocks: ContentBlock[] } | any;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  // Debug log
  console.log('PostContent received:', content);

  // Chỉ xử lý format mới với blocks
  const getContentBlocks = (): ContentBlock[] => {
    if (!content) {
      console.log('No content provided');
      return [];
    }

    // Format: {blocks: [...]}
    if (content.blocks && Array.isArray(content.blocks)) {
      console.log('Found blocks format:', content.blocks);
      return content.blocks;
    }

    // Already an array of blocks
    if (Array.isArray(content)) {
      console.log('Found array format:', content);
      return content;
    }

    // String format - try to parse
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          return parsed.blocks;
        } else if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse content string:', error);
      }
    }

    console.warn('Unknown content format:', content);
    return [];
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    console.log('Rendering block:', block); // Debug log

    if (!block || !block.type) {
      console.warn('Invalid block - missing type:', block);
      return null;
    }

    // Xử lý cả trường hợp có data và không có data
    const data = block.data || {};

    switch (block.type) {
      case 'paragraph':
        const paragraphText = data.text || block.content || '';
        if (!paragraphText.trim()) {
          console.log('Empty paragraph text:', data);
          return null;
        }
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {paragraphText}
          </p>
        );

      case 'heading':
        const headingText = data.text || block.content || '';
        if (!headingText.trim()) {
          console.log('Empty heading text:', data);
          return null;
        }
        return (
          <h2
            key={index}
            className="text-2xl font-semibold text-gray-900 mb-4 mt-8"
          >
            {headingText}
          </h2>
        );

      case 'quote':
        const quoteText = data.text || block.content || '';
        if (!quoteText.trim()) {
          console.log('Empty quote text:', data);
          return null;
        }
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary bg-gray-50 p-4 rounded-r-lg mb-4 italic text-gray-700"
          >
            <p>{quoteText}</p>
            {data.author && (
              <cite className="block text-sm text-gray-500 mt-2">
                — {data.author}
              </cite>
            )}
          </blockquote>
        );

      case 'image':
        const imageUrl = data.url || data.src || block.metadata?.url;
        if (!imageUrl) {
          console.log('No image URL found:', data);
          return null;
        }
        return (
          <div key={index} className="mb-6">
            <img
              src={imageUrl}
              alt={data.caption || data.alt || 'Hình ảnh'}
              className="w-full rounded-lg"
            />
            {(data.caption || data.alt) && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {data.caption || data.alt}
              </p>
            )}
          </div>
        );

      case 'list':
        const items = data.items || data.listItems || [];
        if (!Array.isArray(items) || items.length === 0) {
          console.log('No list items found:', data);
          return null;
        }
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {items.map((item: string, itemIndex: number) => (
              <li key={itemIndex} className="text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        );

      case 'gallery':
        const galleryImages = data.images || data.items || [];
        if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
          console.log('No gallery images found:', data);
          return null;
        }

        const imageUrls = galleryImages
          .map((img: any) =>
            typeof img === 'string' ? img : img.url || img.src,
          )
          .filter(Boolean);

        if (imageUrls.length === 0) return null;

        return (
          <div key={index} className="mb-6">
            <ImageGallery images={imageUrls} />
          </div>
        );

      case 'video':
        const videoUrl = data.url || data.src;
        if (!videoUrl) {
          console.log('No video URL found:', data);
          return null;
        }
        return (
          <div key={index} className="mb-6">
            <video src={videoUrl} controls className="w-full rounded-lg" />
            {data.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {data.caption}
              </p>
            )}
          </div>
        );

      case 'divider':
        return <hr key={index} className="my-8 border-gray-300" />;

      case 'html':
        const htmlContent = data.html || data.content || '';
        if (!htmlContent.trim()) {
          console.log('Empty HTML content:', data);
          return null;
        }
        return (
          <div
            key={index}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );

      case 'embed':
        const embedUrl = data.url || data.embedUrl;
        if (!embedUrl) {
          console.log('No embed URL found:', data);
          return null;
        }
        return (
          <div key={index} className="mb-6">
            <iframe
              src={embedUrl}
              className="w-full h-64 rounded-lg"
              frameBorder="0"
              allowFullScreen
              title={`Embed content ${index}`}
            />
          </div>
        );

      default:
        console.warn('Unknown block type:', block.type);
        // Hiển thị fallback cho unknown block
        const fallbackText = data.text || block.content || '';
        if (fallbackText.trim()) {
          return (
            <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-600 text-sm mb-2">
                Loại nội dung: {block.type}
              </p>
              <p className="text-gray-700">{fallbackText}</p>
            </div>
          );
        }
        return null;
    }
  };

  const contentBlocks = getContentBlocks();
  console.log('Content blocks to render:', contentBlocks);

  if (contentBlocks.length === 0) {
    console.log('No content blocks found, showing empty message');
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có nội dung</p>
      </div>
    );
  }

  // Sort by order if available
  const sortedContent = [...contentBlocks].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  console.log('Sorted content for rendering:', sortedContent);

  // Render các blocks và filter out null values
  const renderedBlocks = sortedContent
    .map((block, index) => renderContentBlock(block, index))
    .filter(Boolean); // Remove null/undefined blocks

  console.log('Rendered blocks count:', renderedBlocks.length);

  // Nếu không có block nào được render thành công
  if (renderedBlocks.length === 0) {
    console.log('No blocks rendered successfully');
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có nội dung hiển thị được</p>
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer">
            Debug info
          </summary>
          <pre className="text-xs text-gray-400 mt-2 text-left">
            {JSON.stringify(contentBlocks, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return <div className="prose max-w-none">{renderedBlocks}</div>;
};
