
import React, { useState } from 'react';
import { EnglishTool } from '../types';
import Card from './common/Card';
import {
  generateStory,
  generateVocabularyHelp,
  correctGrammar,
  analyzeText,
} from '../services/geminiService';

type ToolState = {
  input: string;
  output: string;
  loading: boolean;
  error: string;
};

const initialToolState: ToolState = {
  input: '',
  output: '',
  loading: false,
  error: '',
};

const EnglishLiteracyHub: React.FC = () => {
  const [toolStates, setToolStates] = useState<Record<EnglishTool, ToolState>>({
    [EnglishTool.Story]: { ...initialToolState },
    [EnglishTool.Vocabulary]: { ...initialToolState },
    [EnglishTool.Grammar]: { ...initialToolState },
    [EnglishTool.Analysis]: { ...initialToolState },
  });

  const handleInputChange = (tool: EnglishTool, value: string) => {
    setToolStates((prev) => ({
      ...prev,
      [tool]: { ...prev[tool], input: value, error: '' },
    }));
  };

  const handleSubmit = async (tool: EnglishTool) => {
    const state = toolStates[tool];
    if (!state.input.trim()) {
      setToolStates((prev) => ({
        ...prev,
        [tool]: { ...prev[tool], error: 'Input cannot be empty.' },
      }));
      return;
    }

    setToolStates((prev) => ({
      ...prev,
      [tool]: { ...prev[tool], loading: true, output: '', error: '' },
    }));

    let result = '';
    switch (tool) {
      case EnglishTool.Story:
        result = await generateStory(state.input);
        break;
      case EnglishTool.Vocabulary:
        result = await generateVocabularyHelp(state.input);
        break;
      case EnglishTool.Grammar:
        result = await correctGrammar(state.input);
        break;
      case EnglishTool.Analysis:
        result = await analyzeText(state.input);
        break;
    }

    setToolStates((prev) => ({
      ...prev,
      [tool]: { ...prev[tool], loading: false, output: result },
    }));
  };
  
  const renderTool = (
    tool: EnglishTool, 
    description: string, 
    placeholder: string,
    isTextarea: boolean = false
  ) => {
    const state = toolStates[tool];
    const InputComponent = isTextarea ? 'textarea' : 'input';

    return (
      <Card title={tool} description={description}>
        <div className="space-y-4">
          <InputComponent
            value={state.input}
            onChange={(e) => handleInputChange(tool, e.target.value)}
            placeholder={placeholder}
            className={`w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${isTextarea ? 'h-24 resize-none' : ''}`}
          />
          <button
            onClick={() => handleSubmit(tool)}
            disabled={state.loading}
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
          >
            {state.loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Generate'
            )}
          </button>
          {state.error && <p className="text-red-400 text-sm text-center">{state.error}</p>}
          {state.output && (
            <div className="mt-4 p-4 bg-gray-900 rounded-md">
              <p className="text-gray-300 whitespace-pre-wrap">{state.output}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };


  return (
    <div className="space-y-6">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
            English & Literacy Hub
            </h2>
            <p className="mt-2 text-lg text-gray-400">
            A suite of AI tools to enhance your language skills.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderTool(EnglishTool.Story, 'Generate a creative short story from a simple prompt.', 'e.g., A robot who wants to be a chef', true)}
            {renderTool(EnglishTool.Vocabulary, 'Get the definition, part of speech, and examples for any word.', 'e.g., Serendipity')}
            {renderTool(EnglishTool.Grammar, 'Correct grammar and get explanations for the changes.', 'e.g., Me and him goes to the store.', true)}
            {renderTool(EnglishTool.Analysis, 'Get a brief literary analysis of a piece of text.', 'e.g., "Two roads diverged in a wood..."', true)}
        </div>
    </div>
  );
};

export default EnglishLiteracyHub;
