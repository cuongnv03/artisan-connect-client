import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBlock, BlockType } from '../../../types/post.types';

interface PostContentProps {
  content: ContentBlock[];
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case BlockType.PARAGRAPH:
        return (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      case BlockType.HEADING:
        const HeadingTag =
          `h${block.data.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            className={`font-bold text-gray-900 mb-4 ${
              block.data.level === 2 ? 'text-2xl' : 'text-xl'
            }`}
          >
            {block.data.text}
          </HeadingTag>
        );

      case BlockType.IMAGE:
        return (
          <figure className="my-8">
            <img
              src={block.data.url}
              alt={block.data.caption || ''}
              className="w-full h-auto rounded-lg"
            />
            {block.data.caption && (
              <figcaption className="mt-2 text-center text-sm text-gray-500">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case BlockType.GALLERY:
        return (
          <div className="my-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {block.data.images.map((image: any, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
            {block.data.caption && (
              <p className="mt-2 text-center text-sm text-gray-500">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case BlockType.VIDEO:
        return (
          <div className="my-8">
            <div className="aspect-video rounded-lg overflow-hidden">
              {block.data.provider === 'youtube' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${block.data.videoId}`}
                  title="YouTube video"
                  allowFullScreen
                  className="border-0"
                ></iframe>
              ) : (
                <video
                  src={block.data.url}
                  controls
                  className="w-full h-full"
                  poster={block.data.poster}
                />
              )}
            </div>
            {block.data.caption && (
              <p className="mt-2 text-center text-sm text-gray-500">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case BlockType.QUOTE:
        return (
          <blockquote className="border-l-4 border-accent pl-4 my-6 italic text-gray-700">
            <p className="text-lg">{block.data.text}</p>
            {block.data.author && (
              <footer className="mt-2 text-sm text-gray-500">
                — {block.data.author}
                {block.data.source && (
                  <span>
                    , <cite>{block.data.source}</cite>
                  </span>
                )}
              </footer>
            )}
          </blockquote>
        );

      case BlockType.LIST:
        if (block.data.style === 'ordered') {
          return (
            <ol className="list-decimal pl-6 my-4 space-y-2">
              {block.data.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          );
        } else {
          return (
            <ul className="list-disc pl-6 my-4 space-y-2">
              {block.data.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          );
        }

      case BlockType.PRODUCT:
        return (
          <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center">
              {block.data.image && (
                <img
                  src={block.data.image}
                  alt={block.data.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <div className={block.data.image ? 'ml-4' : ''}>
                <h4 className="font-medium text-gray-900">
                  {block.data.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {block.data.description}
                </p>
                <div className="mt-2">
                  <Link
                    to={`/product/${block.data.productId}`}
                    className="text-sm font-medium text-accent hover:text-accent-dark"
                  >
                    View Product →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      case BlockType.DIVIDER:
        return <hr className="my-6 border-gray-200" />;

      case BlockType.HTML:
        return (
          <div
            className="my-6"
            dangerouslySetInnerHTML={{ __html: block.data.html }}
          />
        );

      case BlockType.EMBED:
        return (
          <div className="my-6">
            <div
              className="rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: block.data.embed }}
            />
            {block.data.caption && (
              <p className="mt-2 text-center text-sm text-gray-500">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      default:
        return <p>Unsupported block type: {block.type}</p>;
    }
  };

  return (
    <div className="post-content">
      {content.map((block) => (
        <div key={block.id} className="mb-4">
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
};
