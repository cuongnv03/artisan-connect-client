import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../../components/common/Button';
import { MediaUploader } from './MediaUploader';
import { BlockType, ContentBlock } from '../../../types/post.types';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterTextIcon,
  ListBulletIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      data: getInitialDataForBlockType(type),
    };

    onChange([...blocks, newBlock]);
    setActiveMenu(null);
  };

  const getInitialDataForBlockType = (type: BlockType): any => {
    switch (type) {
      case BlockType.PARAGRAPH:
        return { text: '' };
      case BlockType.HEADING:
        return { text: '', level: 2 };
      case BlockType.IMAGE:
        return { url: '', caption: '' };
      case BlockType.GALLERY:
        return { images: [], caption: '' };
      case BlockType.VIDEO:
        return { url: '', caption: '' };
      case BlockType.QUOTE:
        return { text: '', author: '', source: '' };
      case BlockType.LIST:
        return { items: [''], style: 'unordered' };
      case BlockType.PRODUCT:
        return { productId: '', title: '', description: '', image: '' };
      case BlockType.DIVIDER:
        return {};
      case BlockType.HTML:
        return { html: '' };
      case BlockType.EMBED:
        return { embed: '', caption: '' };
      default:
        return {};
    }
  };

  const updateBlock = (index: number, data: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], data };
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const blockToMove = newBlocks[index];

    if (direction === 'up') {
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = blockToMove;
    } else {
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = blockToMove;
    }

    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case BlockType.PARAGRAPH:
        return (
          <textarea
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
            rows={3}
            placeholder="Type paragraph text here..."
            value={block.data.text}
            onChange={(e) =>
              updateBlock(index, { ...block.data, text: e.target.value })
            }
          ></textarea>
        );

      case BlockType.HEADING:
        return (
          <div className="space-y-2">
            <select
              className="block w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
              value={block.data.level}
              onChange={(e) =>
                updateBlock(index, {
                  ...block.data,
                  level: parseInt(e.target.value),
                })
              }
            >
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
            </select>
            <input
              type="text"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Heading text..."
              value={block.data.text}
              onChange={(e) =>
                updateBlock(index, { ...block.data, text: e.target.value })
              }
            />
          </div>
        );

      case BlockType.IMAGE:
        return (
          <div className="space-y-2">
            <MediaUploader
              type="image"
              value={block.data.url}
              onChange={(url) => updateBlock(index, { ...block.data, url })}
              placeholder="Upload an image"
            />
            <input
              type="text"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Image caption (optional)"
              value={block.data.caption || ''}
              onChange={(e) =>
                updateBlock(index, { ...block.data, caption: e.target.value })
              }
            />
          </div>
        );

      case BlockType.VIDEO:
        return (
          <div className="space-y-2">
            <MediaUploader
              type="video"
              value={block.data.url}
              onChange={(url) => updateBlock(index, { ...block.data, url })}
              placeholder="Upload a video"
            />
            <input
              type="text"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Video caption (optional)"
              value={block.data.caption || ''}
              onChange={(e) =>
                updateBlock(index, { ...block.data, caption: e.target.value })
              }
            />
          </div>
        );

      case BlockType.QUOTE:
        return (
          <div className="space-y-2">
            <textarea
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
              rows={3}
              placeholder="Quote text..."
              value={block.data.text}
              onChange={(e) =>
                updateBlock(index, { ...block.data, text: e.target.value })
              }
            ></textarea>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                placeholder="Author (optional)"
                value={block.data.author || ''}
                onChange={(e) =>
                  updateBlock(index, { ...block.data, author: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                placeholder="Source (optional)"
                value={block.data.source || ''}
                onChange={(e) =>
                  updateBlock(index, { ...block.data, source: e.target.value })
                }
              />
            </div>
          </div>
        );

      case BlockType.LIST:
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <select
                className="block border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                value={block.data.style}
                onChange={(e) =>
                  updateBlock(index, { ...block.data, style: e.target.value })
                }
              >
                <option value="unordered">Bullet List</option>
                <option value="ordered">Numbered List</option>
              </select>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  updateBlock(index, {
                    ...block.data,
                    items: [...block.data.items, ''],
                  })
                }
              >
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {block.data.items.map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                    placeholder="List item..."
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.data.items];
                      newItems[itemIndex] = e.target.value;
                      updateBlock(index, { ...block.data, items: newItems });
                    }}
                  />
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...block.data.items];
                      newItems.splice(itemIndex, 1);
                      updateBlock(index, { ...block.data, items: newItems });
                    }}
                    disabled={block.data.items.length <= 1}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      // Simplified implementations for other block types...
      case BlockType.DIVIDER:
        return (
          <div className="py-2">
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return (
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <p className="text-gray-500">
              {block.type} editor not implemented in this example
            </p>
          </div>
        );
    }
  };

  const blockTypeIcons = {
    [BlockType.PARAGRAPH]: DocumentTextIcon,
    [BlockType.HEADING]: DocumentTextIcon,
    [BlockType.IMAGE]: PhotoIcon,
    [BlockType.GALLERY]: PhotoIcon,
    [BlockType.VIDEO]: VideoCameraIcon,
    [BlockType.QUOTE]: ChatBubbleBottomCenterTextIcon,
    [BlockType.LIST]: ListBulletIcon,
    [BlockType.PRODUCT]: ShoppingBagIcon,
  };

  return (
    <div className="space-y-6 border border-gray-300 rounded-lg p-4">
      {blocks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No content blocks yet</p>
          <Button
            variant="outline"
            onClick={() => setActiveMenu('add')}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add Block
          </Button>
        </div>
      ) : (
        <>
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="border border-gray-200 rounded-lg p-4 relative"
            >
              <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {blockTypeIcons[block.type as keyof typeof blockTypeIcons] ? (
                    React.createElement(
                      blockTypeIcons[block.type as keyof typeof blockTypeIcons],
                      { className: 'h-5 w-5 text-gray-500 mr-2' },
                    )
                  ) : (
                    <div className="w-7"></div>
                  )}
                  <span className="text-sm font-medium text-gray-500">
                    {block.type
                      .split('_')
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(' ')}
                  </span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => deleteBlock(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              {renderBlockEditor(block, index)}
            </div>
          ))}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setActiveMenu('add')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Add Block
            </Button>
          </div>
        </>
      )}

      {/* Block Type Menu */}
      {activeMenu === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Content Block
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.PARAGRAPH)}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
              >
                Paragraph
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.HEADING)}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
              >
                Heading
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.IMAGE)}
                leftIcon={<PhotoIcon className="h-5 w-5" />}
              >
                Image
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.VIDEO)}
                leftIcon={<VideoCameraIcon className="h-5 w-5" />}
              >
                Video
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.QUOTE)}
                leftIcon={
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                }
              >
                Quote
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.LIST)}
                leftIcon={<ListBulletIcon className="h-5 w-5" />}
              >
                List
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.DIVIDER)}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
              >
                Divider
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => addBlock(BlockType.PRODUCT)}
                leftIcon={<ShoppingBagIcon className="h-5 w-5" />}
              >
                Product
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setActiveMenu(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
