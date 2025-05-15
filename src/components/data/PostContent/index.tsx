import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBlock, BlockType } from '../../../types/post.types';

interface PostContentProps {
  content: ContentBlock[] | any;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  // Ensure content is an array
  const safeContent = Array.isArray(content) ? content : [];

  const renderBlock = (block: any) => {
    if (!block || typeof block !== 'object') {
      return <div className="p-2 bg-gray-100 rounded">Invalid block</div>;
    }

    const blockType = block.type || 'unknown';

    // Handle different block types based on the actual structure
    switch (blockType) {
      case BlockType.PARAGRAPH:
      case 'paragraph':
        return (
          <div className="prose prose-lg max-w-none my-4">
            {block.content || ''}
          </div>
        );

      case BlockType.HEADING:
      case 'heading': {
        const level = block.level || 2;
        const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
        return (
          <HeadingTag className="font-bold text-gray-900 mb-4">
            {block.content || 'Untitled Heading'}
          </HeadingTag>
        );
      }

      case BlockType.IMAGE:
      case 'image':
        return (
          <figure className="my-8">
            {block.url ? (
              <img
                src={block.url}
                alt={block.caption || ''}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="bg-gray-200 w-full h-48 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Image not available</span>
              </div>
            )}
            {block.caption && (
              <figcaption className="mt-2 text-center text-sm text-gray-500">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case BlockType.GALLERY:
      case 'gallery': {
        const images = block.images || [];
        return (
          <div className="my-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image: any, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url || ''}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
            {block.caption && (
              <p className="mt-2 text-center text-sm text-gray-500">
                {block.caption}
              </p>
            )}
          </div>
        );
      }

      case BlockType.QUOTE:
      case 'quote':
        return (
          <blockquote className="border-l-4 border-accent pl-4 my-6 italic text-gray-700">
            <p className="text-lg">{block.content || ''}</p>
            {block.author && (
              <footer className="mt-2 text-sm text-gray-500">
                — {block.author}
                {block.source && (
                  <span>
                    , <cite>{block.source}</cite>
                  </span>
                )}
              </footer>
            )}
          </blockquote>
        );

      case BlockType.LIST:
      case 'list': {
        const items = block.items || [];
        const listStyle = block.style || 'unordered';

        if (listStyle === 'ordered') {
          return (
            <ol className="list-decimal pl-6 my-4 space-y-2">
              {items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          );
        } else {
          return (
            <ul className="list-disc pl-6 my-4 space-y-2">
              {items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          );
        }
      }

      case 'features': {
        // Handle the custom 'features' block type
        const featureItems = block.items || [];
        return (
          <div className="my-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              {featureItems.map((item: string, index: number) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case BlockType.DIVIDER:
      case 'divider':
        return <hr className="my-6 border-gray-200" />;

      default:
        return (
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 my-4">
            <p className="text-gray-500">Block type: {blockType}</p>
            <pre className="mt-2 text-xs text-gray-400 overflow-auto">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (safeContent.length === 0) {
    return (
      <div className="py-8 px-4 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No content available</p>
      </div>
    );
  }

  return (
    <div className="post-content">
      {safeContent.map((block: any, index: number) => (
        <div key={block.id || `block-${index}`} className="mb-4">
          {(() => {
            try {
              return renderBlock(block);
            } catch (error) {
              console.error(`Error rendering block ${index}:`, error);
              return (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                  Error rendering content block
                </div>
              );
            }
          })()}
        </div>
      ))}
    </div>
  );
};

export default PostContent;
