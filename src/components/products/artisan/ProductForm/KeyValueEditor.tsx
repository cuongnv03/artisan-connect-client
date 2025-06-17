import React, { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface KeyValueEditorProps {
  title: string;
  description?: string;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  placeholder?: { key: string; value: string };
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  title,
  description,
  data,
  onChange,
  placeholder = { key: 'Key', value: 'Value' },
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addKeyValue = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({
        ...data,
        [newKey.trim()]: newValue.trim(),
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const removeKeyValue = (key: string) => {
    const newData = { ...data };
    delete newData[key];
    onChange(newData);
  };

  const updateValue = (key: string, value: string) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const entries = Object.entries(data || {});

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {/* Existing Key-Value Pairs */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <Input
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const newData = { ...data };
                  delete newData[key];
                  newData[newKey] = value;
                  onChange(newData);
                }}
                placeholder={placeholder.key}
                className="flex-1"
              />
              <Input
                value={String(value)}
                onChange={(e) => updateValue(key, e.target.value)}
                placeholder={placeholder.value}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeKeyValue(key)}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Key-Value Pair */}
      <div className="flex space-x-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={placeholder.key}
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addKeyValue()}
        />
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder.value}
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addKeyValue()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addKeyValue}
          disabled={!newKey.trim() || !newValue.trim()}
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
