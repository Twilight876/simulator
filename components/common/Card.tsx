
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Card;
