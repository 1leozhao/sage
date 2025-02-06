import { useState } from 'react';

export interface AIModel {
  id: string;
  name: string;
  icon: string;
}

const models: AIModel[] = [
  { id: 'openai', name: 'Open AI', icon: '/icons/openai.png' },
  { id: 'perplexity', name: 'Perplexity', icon: '/icons/perplexity.png' },
  { id: 'claude', name: 'Claude', icon: '/icons/claude.png' },
  { id: 'gemini', name: 'Gemini', icon: '/icons/gemini.png' },
  { id: 'deepseek', name: 'Deepseek', icon: '/icons/deepseek.png' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img src={selectedModelData.icon} alt={selectedModelData.name} className="w-5 h-5" />
        <span className="text-sm text-gray-700">{selectedModelData.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 ${
                selectedModel === model.id ? 'bg-gray-50' : ''
              }`}
            >
              <img src={model.icon} alt={model.name} className="w-5 h-5" />
              <span className="text-sm text-gray-700">{model.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
