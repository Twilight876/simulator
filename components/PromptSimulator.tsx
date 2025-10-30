import React, { useState, useEffect } from 'react';
import { generateInteractiveSimulation } from '../services/geminiService';
import { SimulationState } from '../types';
import LoadingSpinner from './common/LoadingSpinner';

const PromptSimulator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<{ choice: string; description: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [simulationStarted, setSimulationStarted] = useState<boolean>(false);
  const [key, setKey] = useState(0); // Used to re-trigger animations

  useEffect(() => {
    if (simulationState) {
      setKey(prevKey => prevKey + 1);
    }
  }, [simulationState]);


  const handleStart = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to simulate.');
      return;
    }
    setError('');
    setLoading(true);
    setSimulationState(null);
    setHistory([]);
    
    try {
      const result = await generateInteractiveSimulation(prompt, []);
      setSimulationState(result);
      setSimulationStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: string) => {
    if (!simulationState) return;

    const newHistory = [...history, { choice, description: simulationState.description }];
    setHistory(newHistory);
    setLoading(true);
    setError('');

    try {
      const result = await generateInteractiveSimulation(prompt, newHistory);
      setSimulationState(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setSimulationState(null);
    setHistory([]);
    setLoading(false);
    setError('');
    setSimulationStarted(false);
    setKey(0);
  };
  
  const renderInitialView = () => (
     <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Simulate the process of photosynthesis' or 'Explain black holes like I'm 10'"
          className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
        />
        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Starting Simulation...</span>
            </>
          ) : (
            <span>Start Interactive Simulation</span>
          )}
        </button>
      </div>
  );

  const renderSimulationView = () => (
    <div className="space-y-6">
      <div key={key} className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
        {simulationState?.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md border-2 border-gray-700">
              <img 
                src={simulationState.imageUrl} 
                alt="A visual representation of the current simulation state." 
                className="w-full h-auto object-cover" 
              />
            </div>
        )}
        <h3 className="text-xl font-bold text-indigo-300 mb-4">Current Situation</h3>
        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
          {simulationState?.description}
        </div>
      </div>
      
      {loading && (
        <div className="text-center p-4">
            <LoadingSpinner />
            <p className="text-indigo-300 mt-2 animate-pulse">Generating next step and creating image...</p>
        </div>
      )}

      {!loading && simulationState && !simulationState.is_final_state && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-xl font-bold text-indigo-300 mb-4">What do you do next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulationState.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full text-left bg-gray-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-600 disabled:bg-gray-900 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && simulationState && simulationState.is_final_state && (
         <div className="text-center p-6 bg-gray-800 rounded-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-green-400">Simulation Complete!</h3>
            <p className="text-gray-400 mt-2">You have reached the end of this simulation path.</p>
         </div>
      )}

       <button
          onClick={handleReset}
          className="mt-4 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          Reset Simulation
        </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          Interactive Simulator
        </h2>
        <p className="mt-2 text-lg text-gray-400">
          Make choices to guide the simulation and learn dynamically.
        </p>
      </div>

      {error && <p className="text-red-400 mt-4 text-center p-4 bg-red-900/50 rounded-md">{error}</p>}
      
      {!simulationStarted ? renderInitialView() : renderSimulationView()}
    </div>
  );
};

export default PromptSimulator;