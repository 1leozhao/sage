import React, { useState, useEffect } from 'react';

interface ConnectPromptModalProps {
  isOpen: boolean;
  onConnect: () => void;
}

export default function ConnectPromptModal({ isOpen, onConnect }: ConnectPromptModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (isOpen && !hasShown) {
      setIsAnimating(true);
      setHasShown(true);
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setHasShown(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShown]);

  if (!isAnimating && !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 text-center
          transform transition-all duration-500 ease-in-out
          ${isOpen && isAnimating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
        `}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Connect Wallet</h2>
        <p className="text-gray-600 mb-6">
          Please connect a wallet to continue.
        </p>
        <button
          onClick={onConnect}
          className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}