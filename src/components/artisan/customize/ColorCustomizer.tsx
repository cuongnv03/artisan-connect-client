import React from 'react';
import { COLOR_PRESETS } from '../../../templates/templates';
import { Card } from '../../ui/Card';
import { ThemeConfig } from '../../../types/theme';

interface ColorCustomizerProps {
  config: ThemeConfig | null;
  onChange: (config: ThemeConfig) => void;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  config,
  onChange,
}) => {
  const handleColorChange = (
    colorKey: keyof ThemeConfig['colors'],
    value: string,
  ) => {
    if (!config) return;

    const newConfig = {
      ...config,
      colors: {
        ...config.colors,
        [colorKey]: value,
      },
    };
    onChange(newConfig);
  };

  const applyColorPreset = (preset: any) => {
    if (!config) return;

    const newConfig = {
      ...config,
      colors: {
        ...config.colors,
        primary: preset.primary,
        secondary: preset.secondary,
      },
    };
    onChange(newConfig);
  };

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Bảng màu có sẵn</h3>

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
        <h3 className="font-semibold text-gray-900 mb-4">Tùy chỉnh màu sắc</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(config.colors).map(([key, value]) => (
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
  );
};
