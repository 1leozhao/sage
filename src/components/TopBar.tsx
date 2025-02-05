'use client';

import { useState, useEffect } from 'react';
import WalletInfoModal from '../components/WalletInfoModal';

export default function TopBar({ onConnect, connectedAddress, onDisconnect }: { onConnect: () => void, connectedAddress: string | null, onDisconnect: () => void }) {
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    console.log('TopBar received connectedAddress:', connectedAddress); // Debugging log
  }, [connectedAddress]);

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">
        Sage
      </div>
      <div>
        {connectedAddress ? (
          <button
            onClick={() => setInfoModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg font-mono shadow-md hover:from-emerald-500 hover:to-teal-600 transition-all"
          >
            {`${connectedAddress.slice(0, 4)}...${connectedAddress.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Connect
          </button>
        )}
      </div>
      <WalletInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        connectedAddress={connectedAddress} 
        onDisconnect={onDisconnect}
      />
    </div>
  );
} 