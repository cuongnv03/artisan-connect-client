import React, { useState, useEffect } from 'react';
import {
  SwatchIcon,
  PaintBrushIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  layout: 'modern' | 'classic' | 'minimal' | 'creative';
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: Partial<ThemeConfig>;
  isPremium: boolean;
}

export const CustomizePage: React.FC = () => {
  const { state } = useAuth();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ThemeConfig>({
    primaryColor: '#d4292f',
    secondaryColor: '#ffc233',
    accentColor: '#14b8a6',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter',
    borderRadius: '8px',
    layout: 'modern',
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await artisanService.getAvailableTemplates();
      setTemplates(templatesData);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof ThemeConfig, value: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyTemplate = (template: Template) => {
    if (template.isPremium) {
      error('Template này chỉ dành cho gói Premium');
      return;
    }

    setCurrentConfig((prev) => ({
      ...prev,
      ...template.config,
    }));

    success(`Đã áp dụng template "${template.name}"`);
  };

  const saveCustomization = async () => {
    setSaving(true);
    try {
      await artisanService.customizeTemplate({
        config: currentConfig,
      });

      success('Lưu tùy chỉnh thành công!');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi lưu tùy chỉnh');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setCurrentConfig({
      primaryColor: '#d4292f',
      secondaryColor: '#ffc233',
      accentColor: '#14b8a6',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter',
      borderRadius: '8px',
      layout: 'modern',
    });
  };

  const colorPresets = [
    { name: 'Vietnamese Red', primary: '#d4292f', secondary: '#ffc233' },
    { name: 'Golden Sunset', primary: '#f59e0b', secondary: '#ef4444' },
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#a855f7' },
    { name: 'Warm Brown', primary: '#92400e', secondary: '#d97706' },
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Montserrat', value: 'Montserrat' },
  ];

  const layoutOptions = [
    {
      name: 'Hiện đại',
      value: 'modern',
      description: 'Thiết kế sạch sẽ, tối giản',
    },
    {
      name: 'Cổ điển',
      value: 'classic',
      description: 'Phong cách truyền thống Việt Nam',
    },
    {
      name: 'Tối giản',
      value: 'minimal',
      description: 'Tập trung vào nội dung',
    },
    {
      name: 'Sáng tạo',
      value: 'creative',
      description: 'Bố cục linh hoạt, nghệ thuật',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải tùy chỉnh...</p>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'templates',
      label: 'Templates',
      icon: <PaintBrushIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  {template.isPremium && (
                    <Badge
                      variant="warning"
                      className="absolute top-2 right-2"
                      size="sm"
                    >
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => applyTemplate(template)}
                    disabled={template.isPremium}
                  >
                    {template.isPremium ? 'Cần Premium' : 'Áp dụng'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'colors',
      label: 'Màu sắc',
      icon: <SwatchIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Color Presets */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Bảng màu có sẵn
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    handleConfigChange('primaryColor', preset.primary);
                    handleConfigChange('secondaryColor', preset.secondary);
                  }}
                  className="p-3 border rounded-lg hover:border-gray-400 transition-colors"
                >
                  <div className="flex space-x-2 mb-2">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <p className="text-sm font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Custom Colors */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Tùy chỉnh màu sắc
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu chính
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={currentConfig.primaryColor}
                    onChange={(e) =>
                      handleConfigChange('primaryColor', e.target.value)
                    }
                    className="w-12 h-12 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={currentConfig.primaryColor}
                    onChange={(e) =>
                      handleConfigChange('primaryColor', e.target.value)
                    }
                    className="flex-1 rounded-lg border-gray-300 text-sm"
                    placeholder="#d4292f"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu phụ
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={currentConfig.secondaryColor}
                    onChange={(e) =>
                      handleConfigChange('secondaryColor', e.target.value)
                    }
                    className="w-12 h-12 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={currentConfig.secondaryColor}
                    onChange={(e) =>
                      handleConfigChange('secondaryColor', e.target.value)
                    }
                    className="flex-1 rounded-lg border-gray-300 text-sm"
                    placeholder="#ffc233"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu nền
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={currentConfig.backgroundColor}
                    onChange={(e) =>
                      handleConfigChange('backgroundColor', e.target.value)
                    }
                    className="w-12 h-12 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={currentConfig.backgroundColor}
                    onChange={(e) =>
                      handleConfigChange('backgroundColor', e.target.value)
                    }
                    className="flex-1 rounded-lg border-gray-300 text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu chữ
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={currentConfig.textColor}
                    onChange={(e) =>
                      handleConfigChange('textColor', e.target.value)
                    }
                    className="w-12 h-12 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={currentConfig.textColor}
                    onChange={(e) =>
                      handleConfigChange('textColor', e.target.value)
                    }
                    className="flex-1 rounded-lg border-gray-300 text-sm"
                    placeholder="#111827"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'typography',
      label: 'Typography',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Font chữ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleConfigChange('fontFamily', font.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    currentConfig.fontFamily === font.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-gray-400'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <h4 className="font-semibold mb-1">{font.name}</h4>
                  <p className="text-sm text-gray-600">
                    Đây là ví dụ về font chữ {font.name}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'layout',
      label: 'Bố cục',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kiểu bố cục</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layoutOptions.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => handleConfigChange('layout', layout.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    currentConfig.layout === layout.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <h4 className="font-semibold mb-1">{layout.name}</h4>
                  <p className="text-sm text-gray-600">{layout.description}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Bo góc</h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="borderRadius"
                  value="0px"
                  checked={currentConfig.borderRadius === '0px'}
                  onChange={(e) =>
                    handleConfigChange('borderRadius', e.target.value)
                  }
                  className="mr-2"
                />
                Vuông
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="borderRadius"
                  value="4px"
                  checked={currentConfig.borderRadius === '4px'}
                  onChange={(e) =>
                    handleConfigChange('borderRadius', e.target.value)
                  }
                  className="mr-2"
                />
                Nhỏ
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="borderRadius"
                  value="8px"
                  checked={currentConfig.borderRadius === '8px'}
                  onChange={(e) =>
                    handleConfigChange('borderRadius', e.target.value)
                  }
                  className="mr-2"
                />
                Vừa
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="borderRadius"
                  value="16px"
                  checked={currentConfig.borderRadius === '16px'}
                  onChange={(e) =>
                    handleConfigChange('borderRadius', e.target.value)
                  }
                  className="mr-2"
                />
                Lớn
              </label>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Tùy chỉnh trang cá nhân
        </h1>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
            leftIcon={<EyeIcon className="w-4 h-4" />}
          >
            {previewMode ? 'Thoát xem trước' : 'Xem trước'}
          </Button>

          <Button
            variant="ghost"
            onClick={resetToDefault}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Đặt lại
          </Button>

          <Button
            onClick={saveCustomization}
            loading={saving}
            leftIcon={<CheckIcon className="w-4 h-4" />}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Preview Banner */}
      {previewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            🎨 Chế độ xem trước: Trang cá nhân của bạn sẽ hiển thị với cấu hình
            này
          </p>
        </div>
      )}

      {/* Customization Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs items={tabItems} variant="line" />
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>

            <div
              className="border rounded-lg p-4 min-h-64"
              style={{
                backgroundColor: currentConfig.backgroundColor,
                color: currentConfig.textColor,
                fontFamily: currentConfig.fontFamily,
                borderRadius: currentConfig.borderRadius,
              }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-full mb-3"
                  style={{ backgroundColor: currentConfig.primaryColor }}
                />
                <h4 className="font-bold mb-1">
                  {state.user?.firstName} {state.user?.lastName}
                </h4>
                <p className="text-sm opacity-75">Nghệ nhân thủ công</p>
              </div>

              <div className="space-y-3">
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: currentConfig.secondaryColor + '20',
                    borderRadius: currentConfig.borderRadius,
                  }}
                >
                  <p className="text-sm">Sản phẩm mẫu</p>
                </div>

                <button
                  className="w-full py-2 px-4 text-white text-sm rounded font-medium"
                  style={{
                    backgroundColor: currentConfig.primaryColor,
                    borderRadius: currentConfig.borderRadius,
                  }}
                >
                  Theo dõi
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
