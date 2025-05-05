import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Alert } from '../../../components/ui/Alert';
import { Loader } from '../../../components/ui/Loader';
import { Tabs } from '../../../components/ui/Tabs';
import { ArtisanService } from '../../../services/artisan.service';
import {
  GenerateTemplateDto,
  TemplateResult,
} from '../../../types/artisan.types';

interface ArtisanTemplateGeneratorProps {
  onComplete: () => void;
  onCancel: () => void;
}

const ArtisanTemplateGenerator: React.FC<ArtisanTemplateGeneratorProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    colorScheme: 'neutral',
    layout: 'standard',
    emphasis: 'balanced',
  });
  const [description, setDescription] = useState('');
  const [generatedTemplate, setGeneratedTemplate] =
    useState<TemplateResult | null>(null);

  // Fetch available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Loading template styles...');
        const data = await ArtisanService.getDefaultTemplates();
        setTemplates(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleGenerateTemplate = async () => {
    if (!selectedTemplate || !description) {
      setError('Please select a template style and provide a description');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Generating your custom template...');
      setError(null);

      const templateData: GenerateTemplateDto = {
        style: selectedTemplate,
        preferences: preferences,
        description: description,
      };

      const result = await ArtisanService.generateTemplate(templateData);
      setGeneratedTemplate(result);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isLoading) {
    return <Loader size="lg" text={loadingMessage} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-full flex justify-between">
          {['Choose Template', 'Customize', 'Preview & Save'].map(
            (label, index) => {
              const stepNum = index + 1;
              return (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step === stepNum
                        ? 'border-accent bg-accent text-white'
                        : step > stepNum
                        ? 'border-accent text-accent'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {step > stepNum ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <div
                    className={`ml-2 text-sm font-medium ${
                      step >= stepNum ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        step > stepNum ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select a template style that best represents your shop's aesthetic.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedTemplate === template.style
                    ? 'border-accent ring-2 ring-accent ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.style)}
              >
                <div className="h-36 bg-gray-100">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setStep(2)} disabled={!selectedTemplate}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Customize */}
      {step === 2 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Customize your template by selecting preferences and describing your
            shop's unique style.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Scheme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['warm', 'cool', 'neutral', 'earthy'].map((color) => (
                  <div
                    key={color}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      preferences.colorScheme === color
                        ? 'border-accent ring-2 ring-accent ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() =>
                      setPreferences({ ...preferences, colorScheme: color })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{
                          backgroundColor:
                            color === 'warm'
                              ? '#e63946'
                              : color === 'cool'
                              ? '#457b9d'
                              : color === 'earthy'
                              ? '#606c38'
                              : '#2a9d8f',
                        }}
                      />
                      <span className="capitalize">{color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['standard', 'portfolio', 'storefront', 'blog'].map(
                  (layout) => (
                    <div
                      key={layout}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        preferences.layout === layout
                          ? 'border-accent ring-2 ring-accent ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() =>
                        setPreferences({ ...preferences, layout: layout })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{layout}</span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Describe Your Shop's Style
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                placeholder="Describe your craft, aesthetic, and what makes your products unique. This helps us generate a template that matches your style..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters. Be specific about colors, textures, and
                the mood you want to convey.
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={handleGenerateTemplate}
              disabled={!description || description.length < 10}
            >
              Generate Template
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Save */}
      {step === 3 && generatedTemplate && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Here's a preview of your generated template. If you're happy with
            it, click "Save Template" to apply it to your shop.
          </p>

          <Card className="overflow-hidden mb-6">
            <div className="h-60 bg-gray-100 relative">
              <img
                src={generatedTemplate.preview}
                alt="Template Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">Template Details</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Style:</span>{' '}
                  {generatedTemplate.templateStyle}
                </p>
                <p>
                  <span className="font-medium">Color Scheme:</span>{' '}
                  {preferences.colorScheme}
                </p>
                <p>
                  <span className="font-medium">Layout:</span>{' '}
                  {preferences.layout}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={handleComplete}>Save Template</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanTemplateGenerator;
