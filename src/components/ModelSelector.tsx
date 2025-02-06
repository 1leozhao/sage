import { useState } from 'react';

export interface AIModel {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  textColor: string;
}

const models: AIModel[] = [
  { 
    id: 'openai', 
    name: 'Open AI', 
    icon: '/icons/openai.png',
    gradient: 'bg-gradient-to-r from-green-600 to-green-500',
    textColor: 'text-white'
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    icon: '/icons/perplexity.png',
    gradient: 'bg-gradient-to-r from-gray-700 to-gray-800',
    textColor: 'text-white'
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    icon: '/icons/claude.png',
    gradient: 'bg-gradient-to-r from-orange-400 to-amber-400',
    textColor: 'text-white'
  },
  { 
    id: 'gemini', 
    name: 'Gemini', 
    icon: '/icons/gemini.png',
    gradient: 'bg-gradient-to-r from-gray-900 to-black',
    textColor: 'text-white'
  },
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
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${selectedModelData.gradient} ${selectedModelData.textColor}`}
      >
        <img src={selectedModelData.icon} alt={selectedModelData.name} className="w-4 h-4" />
        <span className="text-xs font-medium">{selectedModelData.name}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 space-y-1 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md hover:opacity-90 transition-all ${
                model.gradient
              } ${model.textColor} w-[120px]`}
            >
              <img src={model.icon} alt={model.name} className="w-4 h-4" />
              <span className="text-xs font-medium">{model.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
