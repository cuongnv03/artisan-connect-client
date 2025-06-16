import React from 'react';
import { PostType } from '../../../types/post';
import { Select } from '../../ui/Dropdown';

interface PostTypeSelectorProps {
  value: PostType;
  onChange: (value: PostType) => void;
  error?: string;
}

export const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const postTypeOptions = [
    { label: 'Câu chuyện', value: PostType.STORY },
    { label: 'Hướng dẫn', value: PostType.TUTORIAL },
    { label: 'Giới thiệu sản phẩm', value: PostType.PRODUCT_SHOWCASE },
    { label: 'Hậu trường', value: PostType.BEHIND_THE_SCENES },
    { label: 'Sự kiện', value: PostType.EVENT },
    { label: 'Chung', value: PostType.GENERAL },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Loại bài viết
      </label>
      <Select
        value={value}
        onChange={(selectedValue) => onChange(selectedValue as PostType)}
        options={postTypeOptions}
        placeholder="Chọn loại bài viết"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
