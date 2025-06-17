import React from 'react';
import { FONT_OPTIONS } from '../../../templates/templates';
import { Card } from '../../ui/Card';
import { ThemeConfig } from '../../../types/theme';

interface TypographySettingsProps {
  config: ThemeConfig | null;
  onChange: (config: ThemeConfig) => void;
}

export const TypographySettings: React.FC<TypographySettingsProps> = ({
  config,
  onChange,
}) => {
  const handleFontChange = (
    fontType: 'fontFamily' | 'headingFont',
    value: string,
  ) => {
    if (!config) return;

    const newConfig = {
      ...config,
      typography: {
        ...config.typography,
        [fontType]: value,
      },
    };
    onChange(newConfig);
  };

  if (!config) return null;

  return (
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
                  onClick={() => handleFontChange('headingFont', font.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    config.typography.headingFont === font.value
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
                    config.typography.fontFamily === font.value
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
  );
};
