import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { TEMPLATES } from '../../../data/templates';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ThemeConfig } from '../../../types/theme';

interface TemplateGalleryProps {
  currentTheme: ThemeConfig | null;
  onApplyTemplate: (config: ThemeConfig) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  currentTheme,
  onApplyTemplate,
}) => {
  const handleApplyTemplate = (template: any) => {
    if (template.isPremium) {
      // Could show premium modal here
      return;
    }
    onApplyTemplate(template.config);
  };

  return (
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
                <div className="text-xs opacity-75">{template.description}</div>
                <div
                  className="mt-2 px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: template.config.colors.secondary + '20',
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
                  currentTheme?.id === template.id ? 'primary' : 'outline'
                }
                size="sm"
                fullWidth
                onClick={() => handleApplyTemplate(template)}
                disabled={template.isPremium}
              >
                {currentTheme?.id === template.id ? (
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
  );
};
