import React, { useState, useEffect } from 'react';
import {
  SwatchIcon,
  PaintBrushIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  TEMPLATES,
  COLOR_PRESETS,
  FONT_OPTIONS,
  LAYOUT_OPTIONS,
} from '../../data/templates';
import { ThemeConfig } from '../../types/theme';

export const CustomizePage: React.FC = () => {
  const { state } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [customConfig, setCustomConfig] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    if (currentTheme) {
      setCustomConfig({ ...currentTheme });
    }
  }, [currentTheme]);

  const applyTemplate = (template: any) => {
    if (template.isPremium) {
      error('Template này chỉ dành cho gói Premium');
      return;
    }

    setCustomConfig(template.config);
    setTheme(template.config);
    success(`Đã áp dụng template "${template.name}"`);
  };

  const handleColorChange = (
    colorKey: keyof ThemeConfig['colors'],
    value: string,
  ) => {
    if (!customConfig) return;

    const newConfig = {
      ...customConfig,
      colors: {
        ...customConfig.colors,
        [colorKey]: value,
      },
    };
    setCustomConfig(newConfig);
    setTheme(newConfig);
  };

  const applyColorPreset = (preset: any) => {
    if (!customConfig) return;

    const newConfig = {
      ...customConfig,
      colors: {
        ...customConfig.colors,
        primary: preset.primary,
        secondary: preset.secondary,
      },
    };
    setCustomConfig(newConfig);
    setTheme(newConfig);
    success(`Đã áp dụng bảng màu "${preset.name}"`);
  };

  const handleFontChange = (
    fontType: 'fontFamily' | 'headingFont',
    value: string,
  ) => {
    if (!customConfig) return;

    const newConfig = {
      ...customConfig,
      typography: {
        ...customConfig.typography,
        [fontType]: value,
      },
    };
    setCustomConfig(newConfig);
    setTheme(newConfig);
  };

  const handleLayoutChange = (layoutOption: any) => {
    if (!customConfig) return;

    const newConfig = {
      ...customConfig,
      layout: {
        ...customConfig.layout,
        borderRadius: layoutOption.borderRadius,
        spacing: layoutOption.spacing,
        cardStyle: layoutOption.cardStyle,
        headerStyle: layoutOption.value,
      },
    };
    setCustomConfig(newConfig);
    setTheme(newConfig);
  };

  const saveCustomization = async () => {
    if (!customConfig) return;

    setSaving(true);
    try {
      await artisanService.customizeTemplate({
        templateId: customConfig.id,
        config: customConfig,
      });

      success('Lưu tùy chỉnh thành công!');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi lưu tùy chỉnh');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultTemplate = TEMPLATES[0];
    setCustomConfig(defaultTemplate.config);
    setTheme(defaultTemplate.config);
    success('Đã đặt lại về template mặc định');
  };

  if (loading || !customConfig) {
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
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative p-4">
                  {/* Template Preview */}
                  <div
                    className="w-full h-full rounded-lg p-3"
                    style={{
                      backgroundColor: template.config.colors.background,
                      color: template.config.colors.text,
                      fontFamily: template.config.typography.fontFamily,
                      border: `1px solid ${template.config.colors.border}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-2"
                      style={{
                        backgroundColor: template.config.colors.primary,
                      }}
                    />
                    <div className="text-xs font-semibold mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {template.description}
                    </div>
                    <div
                      className="mt-2 px-2 py-1 text-xs rounded"
                      style={{
                        backgroundColor:
                          template.config.colors.secondary + '20',
                        borderRadius: template.config.layout.borderRadius,
                      }}
                    >
                      Mẫu
                    </div>
                  </div>

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
                    variant={
                      customConfig.id === template.id ? 'primary' : 'outline'
                    }
                    size="sm"
                    fullWidth
                    onClick={() => applyTemplate(template)}
                    disabled={template.isPremium}
                  >
                    {customConfig.id === template.id ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Đang sử dụng
                      </>
                    ) : template.isPremium ? (
                      'Cần Premium'
                    ) : (
                      'Áp dụng'
                    )}
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
              {COLOR_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyColorPreset(preset)}
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
              {Object.entries(customConfig.colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(
                          key as keyof ThemeConfig['colors'],
                          e.target.value,
                        )
                      }
                      className="w-12 h-12 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(
                          key as keyof ThemeConfig['colors'],
                          e.target.value,
                        )
                      }
                      className="flex-1 rounded-lg border-gray-300 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
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

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font tiêu đề
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={`heading-${font.value}`}
                      onClick={() =>
                        handleFontChange('headingFont', font.value)
                      }
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        customConfig.typography.headingFont === font.value
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-gray-400'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <h4 className="font-semibold mb-1">{font.name}</h4>
                      <p className="text-sm text-gray-600">
                        Tiêu đề mẫu với {font.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font nội dung
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={`body-${font.value}`}
                      onClick={() => handleFontChange('fontFamily', font.value)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        customConfig.typography.fontFamily === font.value
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
              </div>
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
              {LAYOUT_OPTIONS.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => handleLayoutChange(layout)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    customConfig.layout.headerStyle === layout.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <h4 className="font-semibold mb-1">{layout.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {layout.description}
                  </p>

                  {/* Layout Preview */}
                  <div
                    className="w-full h-16 bg-gray-100 p-2"
                    style={{ borderRadius: layout.borderRadius }}
                  >
                    <div
                      className={`w-full h-6 bg-white mb-1 ${
                        layout.cardStyle === 'shadow'
                          ? 'shadow-sm'
                          : layout.cardStyle === 'border'
                          ? 'border border-gray-200'
                          : layout.cardStyle === 'elevated'
                          ? 'shadow-md'
                          : ''
                      }`}
                      style={{ borderRadius: layout.borderRadius }}
                    />
                    <div
                      className={`w-3/4 h-4 bg-white ${
                        layout.cardStyle === 'shadow'
                          ? 'shadow-sm'
                          : layout.cardStyle === 'border'
                          ? 'border border-gray-200'
                          : layout.cardStyle === 'elevated'
                          ? 'shadow-md'
                          : ''
                      }`}
                      style={{ borderRadius: layout.borderRadius }}
                    />
                  </div>
                </button>
              ))}
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
                backgroundColor: customConfig.colors.background,
                color: customConfig.colors.text,
                fontFamily: customConfig.typography.fontFamily,
                borderRadius: customConfig.layout.borderRadius,
                borderColor: customConfig.colors.border,
              }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-full mb-3"
                  style={{ backgroundColor: customConfig.colors.primary }}
                />
                <h4
                  className="font-bold mb-1"
                  style={{
                    fontFamily: customConfig.typography.headingFont,
                    color: customConfig.colors.text,
                  }}
                >
                  {state.user?.firstName} {state.user?.lastName}
                </h4>
                <p
                  className="text-sm opacity-75"
                  style={{ color: customConfig.colors.textSecondary }}
                >
                  Nghệ nhân thủ công
                </p>
              </div>

              <div className="space-y-3">
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: customConfig.colors.surface,
                    borderRadius: customConfig.layout.borderRadius,
                    border:
                      customConfig.layout.cardStyle === 'border'
                        ? `1px solid ${customConfig.colors.border}`
                        : undefined,
                    boxShadow:
                      customConfig.layout.cardStyle === 'shadow'
                        ? '0 1px 3px rgba(0,0,0,0.1)'
                        : customConfig.layout.cardStyle === 'elevated'
                        ? '0 4px 6px rgba(0,0,0,0.1)'
                        : undefined,
                  }}
                >
                  <p className="text-sm">Sản phẩm mẫu</p>
                </div>

                <button
                  className="w-full py-2 px-4 text-white text-sm rounded font-medium"
                  style={{
                    backgroundColor: customConfig.colors.primary,
                    borderRadius: customConfig.layout.borderRadius,
                  }}
                >
                  Theo dõi
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Template:{' '}
                <span className="font-medium">{customConfig.name}</span>
              </p>
              <p className="text-xs text-gray-600">
                Font:{' '}
                <span className="font-medium">
                  {customConfig.typography.fontFamily}
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
