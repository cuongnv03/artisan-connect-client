import React from 'react';
import { LAYOUT_OPTIONS } from '../../../templates/templates';
import { Card } from '../../ui/Card';
import { ThemeConfig } from '../../../types/theme';

interface LayoutSettingsProps {
  config: ThemeConfig | null;
  onChange: (config: ThemeConfig) => void;
}

export const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  config,
  onChange,
}) => {
  const handleLayoutChange = (layoutOption: any) => {
    if (!config) return;

    const newConfig = {
      ...config,
      layout: {
        ...config.layout,
        borderRadius: layoutOption.borderRadius,
        spacing: layoutOption.spacing,
        cardStyle: layoutOption.cardStyle,
        headerStyle: layoutOption.value,
      },
    };
    onChange(newConfig);
  };

  if (!config) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Kiểu bố cục</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout.value}
              onClick={() => handleLayoutChange(layout)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                config.layout.headerStyle === layout.value
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-gray-400'
              }`}
            >
              <h4 className="font-semibold mb-1">{layout.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{layout.description}</p>

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
  );
};
