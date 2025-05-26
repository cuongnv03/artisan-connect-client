import React, { useState } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { ContentBlock, BlockType } from '../../types/post';

interface ContentEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
}) => {
  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === BlockType.DIVIDER ? undefined : '',
      metadata: type === BlockType.IMAGE ? {} : undefined,
    };
    onChange([...content, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    const updatedContent = content.map((block) =>
      block.id === id ? { ...block, ...updates } : block,
    );
    onChange(updatedContent);
  };

  const removeBlock = (id: string) => {
    const filteredContent = content.filter((block) => block.id !== id);
    onChange(filteredContent);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    blockId: string,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      updateBlock(blockId, {
        metadata: {
          ...content.find((b) => b.id === blockId)?.metadata,
          url: reader.result as string,
          file: file, // Store file for upload
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const commonClasses =
      'relative group border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors';

    switch (block.type) {
      case BlockType.PARAGRAPH:
        return (
          <div key={block.id} className={commonClasses}>
            <textarea
              className="w-full border-none resize-none focus:outline-none placeholder-gray-400"
              rows={3}
              placeholder="Nhập nội dung đoạn văn..."
              value={block.content || ''}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
            />
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      case BlockType.HEADING:
        return (
          <div key={block.id} className={commonClasses}>
            <input
              type="text"
              className="w-full border-none font-semibold text-xl focus:outline-none placeholder-gray-400"
              placeholder="Nhập tiêu đề..."
              value={block.content || ''}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
            />
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      case BlockType.QUOTE:
        return (
          <div key={block.id} className={commonClasses}>
            <div className="border-l-4 border-primary bg-gray-50 p-4 rounded-r-lg">
              <textarea
                className="w-full bg-transparent border-none resize-none focus:outline-none placeholder-gray-400 italic"
                rows={2}
                placeholder="Nhập trích dẫn..."
                value={block.content || ''}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-gray-400 mt-2"
                placeholder="Tác giả (tùy chọn)..."
                value={block.metadata?.author || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...block.metadata, author: e.target.value },
                  })
                }
              />
            </div>
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      case BlockType.IMAGE:
        return (
          <div key={block.id} className={commonClasses}>
            {block.metadata?.url ? (
              <div className="relative">
                <img
                  src={block.metadata.url}
                  alt="Uploaded content"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
                <input
                  type="text"
                  className="w-full mt-2 border-none text-sm focus:outline-none placeholder-gray-400"
                  placeholder="Thêm mô tả cho ảnh (tùy chọn)..."
                  value={block.metadata?.caption || ''}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      metadata: { ...block.metadata, caption: e.target.value },
                    })
                  }
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Nhấp để thêm ảnh</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, block.id)}
                />
              </label>
            )}
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      case BlockType.LIST:
        return (
          <div key={block.id} className={commonClasses}>
            <div className="space-y-2">
              {((block.metadata?.items as string[]) || ['']).map(
                (item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <input
                      type="text"
                      className="flex-1 border-none focus:outline-none placeholder-gray-400"
                      placeholder="Nhập mục danh sách..."
                      value={item}
                      onChange={(e) => {
                        const items = [
                          ...((block.metadata?.items as string[]) || ['']),
                        ];
                        items[itemIndex] = e.target.value;
                        updateBlock(block.id, {
                          metadata: { ...block.metadata, items },
                        });
                      }}
                    />
                    {itemIndex > 0 && (
                      <button
                        onClick={() => {
                          const items = [
                            ...((block.metadata?.items as string[]) || ['']),
                          ];
                          items.splice(itemIndex, 1);
                          updateBlock(block.id, {
                            metadata: { ...block.metadata, items },
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ),
              )}
              <button
                onClick={() => {
                  const items = [
                    ...((block.metadata?.items as string[]) || ['']),
                    '',
                  ];
                  updateBlock(block.id, {
                    metadata: { ...block.metadata, items },
                  });
                }}
                className="text-primary hover:text-primary-dark text-sm"
              >
                + Thêm mục
              </button>
            </div>
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      case BlockType.DIVIDER:
        return (
          <div key={block.id} className="relative group py-4">
            <hr className="border-gray-300" />
            <BlockControls onRemove={() => removeBlock(block.id)} />
          </div>
        );

      default:
        return null;
    }
  };

  const BlockControls: React.FC<{ onRemove: () => void }> = ({ onRemove }) => (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onRemove}
        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.PARAGRAPH)}
          leftIcon={<DocumentTextIcon className="w-4 h-4" />}
        >
          Đoạn văn
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.HEADING)}
          leftIcon={<DocumentTextIcon className="w-4 h-4" />}
        >
          Tiêu đề
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.QUOTE)}
          leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
        >
          Trích dẫn
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.IMAGE)}
          leftIcon={<PhotoIcon className="w-4 h-4" />}
        >
          Hình ảnh
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.LIST)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Danh sách
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock(BlockType.DIVIDER)}
        >
          Phân cách
        </Button>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        {content.map((block, index) => renderBlock(block, index))}

        {content.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có nội dung. Nhấp vào các nút trên để thêm nội dung.</p>
          </div>
        )}
      </div>
    </div>
  );
};
