import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ThemeConfig } from '../../../types/theme';

interface PreviewPanelProps {
  config: ThemeConfig | null;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config }) => {
  const { state: authState } = useAuth();

  if (!config) return null;

  return (
    <Card className="p-6 sticky top-6">
      <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>

      <div
        className="border rounded-lg p-4 min-h-64"
        style={{
          backgroundColor: config.colors.background,
          color: config.colors.text,
          fontFamily: config.typography.fontFamily,
          borderRadius: config.layout.borderRadius,
          borderColor: config.colors.border,
        }}
      >
        <div className="mb-4">
          <div
            className="w-12 h-12 rounded-full mb-3"
            style={{ backgroundColor: config.colors.primary }}
          />
          <h4
            className="font-bold mb-1"
            style={{
              fontFamily: config.typography.headingFont,
              color: config.colors.text,
            }}
          >
            {authState.user?.firstName} {authState.user?.lastName}
          </h4>
          <p
            className="text-sm opacity-75"
            style={{ color: config.colors.textSecondary }}
          >
            Nghệ nhân thủ công
          </p>
        </div>

        <div className="space-y-3">
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: config.colors.surface,
              borderRadius: config.layout.borderRadius,
              border:
                config.layout.cardStyle === 'border'
                  ? `1px solid ${config.colors.border}`
                  : undefined,
              boxShadow:
                config.layout.cardStyle === 'shadow'
                  ? '0 1px 3px rgba(0,0,0,0.1)'
                  : config.layout.cardStyle === 'elevated'
                  ? '0 4px 6px rgba(0,0,0,0.1)'
                  : undefined,
            }}
          >
            <p className="text-sm">Sản phẩm mẫu</p>
          </div>

          <button
            className="w-full py-2 px-4 text-white text-sm rounded font-medium"
            style={{
              backgroundColor: config.colors.primary,
              borderRadius: config.layout.borderRadius,
            }}
          >
            Theo dõi
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          Template: <span className="font-medium">{config.name}</span>
        </p>
        <p className="text-xs text-gray-600">
          Font:{' '}
          <span className="font-medium">{config.typography.fontFamily}</span>
        </p>
      </div>
    </Card>
  );
};
