import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';
import { TemplateGallery } from '../../components/artisan/customize/TemplateGallery';
import { ColorCustomizer } from '../../components/artisan/customize/ColorCustomizer';
import { TypographySettings } from '../../components/artisan/customize/TypographySettings';
import { LayoutSettings } from '../../components/artisan/customize/LayoutSettings';
import { PreviewPanel } from '../../components/artisan/customize/PreviewPanel';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';

export const CustomizePage: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const { success } = useToastContext();
  const [customConfig, setCustomConfig] = useState(currentTheme);

  const handleSave = () => {
    // Chỉ lưu local theme, không gọi service
    if (customConfig) {
      setTheme(customConfig);
      success('Lưu tùy chỉnh thành công!');
    }
  };

  const tabItems = [
    {
      key: 'templates',
      label: 'Templates',
      content: (
        <TemplateGallery
          currentTheme={customConfig}
          onApplyTemplate={setCustomConfig}
        />
      ),
    },
    {
      key: 'colors',
      label: 'Màu sắc',
      content: (
        <ColorCustomizer config={customConfig} onChange={setCustomConfig} />
      ),
    },
    {
      key: 'typography',
      label: 'Typography',
      content: (
        <TypographySettings config={customConfig} onChange={setCustomConfig} />
      ),
    },
    {
      key: 'layout',
      label: 'Bố cục',
      content: (
        <LayoutSettings config={customConfig} onChange={setCustomConfig} />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tùy chỉnh giao diện</h1>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
        <Tabs items={tabItems} />
      </div>

      <div className="lg:col-span-1">
        <PreviewPanel config={customConfig} />
      </div>
    </div>
  );
};
