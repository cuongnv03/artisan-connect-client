import React from 'react';
import { Input } from '../../../ui/Input';

interface DimensionsEditorProps {
  dimensions?: Record<string, any> | null;
  onChange: (dimensions: Record<string, any>) => void;
}

export const DimensionsEditor: React.FC<DimensionsEditorProps> = ({
  dimensions = {},
  onChange,
}) => {
  const handleChange = (field: string, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onChange({
      ...dimensions,
      [field]: numValue,
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Kích thước (cm)
      </label>
      <div className="grid grid-cols-3 gap-3">
        <Input
          placeholder="Dài"
          type="number"
          value={dimensions?.length || ''}
          onChange={(e) => handleChange('length', e.target.value)}
          min={0}
          step={0.1}
        />
        <Input
          placeholder="Rộng"
          type="number"
          value={dimensions?.width || ''}
          onChange={(e) => handleChange('width', e.target.value)}
          min={0}
          step={0.1}
        />
        <Input
          placeholder="Cao"
          type="number"
          value={dimensions?.height || ''}
          onChange={(e) => handleChange('height', e.target.value)}
          min={0}
          step={0.1}
        />
      </div>
      {(dimensions?.length || dimensions?.width || dimensions?.height) && (
        <p className="mt-1 text-sm text-gray-500">
          Kích thước: {dimensions?.length || 0} × {dimensions?.width || 0} ×{' '}
          {dimensions?.height || 0} cm
        </p>
      )}
    </div>
  );
};
