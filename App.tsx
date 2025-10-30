
import React, { useState } from 'react';
import { Tab } from './types';
import PromptSimulator from './components/PromptSimulator';
import EnglishLiteracyHub from './components/EnglishLiteracyHub';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Simulator);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Simulator:
        return <PromptSimulator />;
      case Tab.EnglishLiteracy:
        return <EnglishLiteracyHub />;
      default:
        return <PromptSimulator />;
    }
  };

  const TabButton = ({ tab, children }: { tab: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm md:text-base font-medium transition-colors duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.05 3.95a.75.75 0 011.06 0l1.063 1.063a.75.75 0 01-1.06 1.06L5.05 5.012a.75.75 0 010-1.062zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zm1.988 5.05a.75.75 0 010-1.06l1.06-1.063a.75.75 0 111.06 1.06L6.05 16.11a.75.75 0 01-1.062 0zM10 17a.75.75 0 01-.75.75v1.5a.75.75 0 011.5 0v-1.5a.75.75 0 01-.75-.75zm4.95-1.95a.75.75 0 01-1.06 0l-1.063-1.063a.75.75 0 111.06-1.06l1.063 1.063a.75.75 0 010 1.06zM17 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0117 10zm-1.988-5.05a.75.75 0 010 1.06l-1.06 1.063a.75.75 0 01-1.06-1.06L13.95 3.95a.75.75 0 011.062 0zM12.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">EduSim AI</h1>
          </div>
          <nav className="flex space-x-2 md:space-x-4">
            <TabButton tab={Tab.Simulator}>Simulator</TabButton>
            <TabButton tab={Tab.EnglishLiteracy}>English & Literacy</TabButton>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini. Built for educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
