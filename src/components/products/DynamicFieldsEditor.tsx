import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DynamicField {
  key: string;
  value: string;
}

interface DynamicFieldsEditorProps {
  title: string;
  fields: Record<string, any>;
  onFieldsChange: (fields: Record<string, any>) => void;
  placeholder?: {
    key: string;
    value: string;
  };
  suggestions?: DynamicField[];
}

export const DynamicFieldsEditor: React.FC<DynamicFieldsEditorProps> = ({
  title,
  fields,
  onFieldsChange,
  placeholder = { key: 'Tên trường', value: 'Giá trị' },
  suggestions = [],
}) => {
  const [newField, setNewField] = useState({ key: '', value: '' });

  const fieldEntries = Object.entries(fields || {});

  const addField = () => {
    if (newField.key.trim() && newField.value.trim()) {
      onFieldsChange({
        ...fields,
        [newField.key]: newField.value,
      });
      setNewField({ key: '', value: '' });
    }
  };

  const updateField = (oldKey: string, newKey: string, value: string) => {
    const newFields = { ...fields };

    if (oldKey !== newKey) {
      delete newFields[oldKey];
    }

    if (newKey.trim()) {
      newFields[newKey] = value;
    }

    onFieldsChange(newFields);
  };

  const removeField = (key: string) => {
    const newFields = { ...fields };
    delete newFields[key];
    onFieldsChange(newFields);
  };

  const addSuggestedField = (suggestion: DynamicField) => {
    if (!fields[suggestion.key]) {
      onFieldsChange({
        ...fields,
        [suggestion.key]: suggestion.value,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <span className="text-xs text-gray-500">
          {fieldEntries.length} trường
        </span>
      </div>

      {/* Suggested Fields */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Gợi ý:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.key}
                type="button"
                onClick={() => addSuggestedField(suggestion)}
                disabled={!!fields[suggestion.key]}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {suggestion.key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Existing Fields */}
      {fieldEntries.length > 0 && (
        <div className="space-y-3">
          {fieldEntries.map(([key, value], index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                value={key}
                onChange={(e) => updateField(key, e.target.value, value)}
                placeholder={placeholder.key}
                className="flex-1"
              />
              <Input
                value={value}
                onChange={(e) => updateField(key, key, e.target.value)}
                placeholder={placeholder.value}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeField(key)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Field */}
      <div className="border-t pt-3">
        <div className="flex gap-2 items-end">
          <Input
            value={newField.key}
            onChange={(e) => setNewField({ ...newField, key: e.target.value })}
            placeholder={placeholder.key}
            className="flex-1"
          />
          <Input
            value={newField.value}
            onChange={(e) =>
              setNewField({ ...newField, value: e.target.value })
            }
            placeholder={placeholder.value}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addField()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            disabled={!newField.key.trim() || !newField.value.trim()}
            className="px-3"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {fieldEntries.length === 0 && (
        <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm">Chưa có {title.toLowerCase()} nào</p>
          <p className="text-xs">Nhấn + để thêm trường mới</p>
        </div>
      )}
    </div>
  );
};
