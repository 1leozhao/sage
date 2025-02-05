'use client';

import { useState, useEffect } from 'react';
import WalletInfoModal from '../components/WalletInfoModal';
import { useWallet } from '@solana/wallet-adapter-react';

export default function TopBar({ 
  onConnect, 
  connectedAddress, 
  onDisconnect,
  navigate 
}: { 
  onConnect: () => void, 
  connectedAddress: string | null, 
  onDisconnect: () => void,
  navigate: (path: string) => void 
}) {
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const { wallet } = useWallet();
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAddress !== currentAddress) {
      setCurrentAddress(connectedAddress);
    }
  }, [connectedAddress]);

  const getWalletStyle = () => {
    if (!wallet) return '';
    switch (wallet.adapter.name) {
      case 'Phantom':
        return 'from-purple-600 to-indigo-500';
      case 'Solflare':
        return 'from-rose-700 to-orange-700';
      case 'Coinbase Wallet':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-emerald-400 to-teal-500';
    }
  };

  const getWalletIcon = (): string | null => {
    if (!wallet) return null;
    switch (wallet.adapter.name) {
      case 'Phantom':
        return '/icons/phantom.png';
      case 'Solflare':
        return '/icons/solflare.png';
      case 'Coinbase Wallet':
        return '/icons/coinbase.png';
      default:
        return null;
    }
  };

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
            className={`inline-flex items-center w-40 px-4 py-2 bg-gradient-to-r ${getWalletStyle()} text-white rounded-lg font-mono shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
          >
            {(() => {
              const icon = getWalletIcon();
              return icon && <img src={icon} alt={wallet?.adapter.name} className="w-5 h-5 mr-2" />;
            })()}
            {`${connectedAddress.slice(0, 4)}...${connectedAddress.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="inline-flex items-center justify-center w-40 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Connect Wallet
          </button>
        )}
      </div>
      <WalletInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        connectedAddress={connectedAddress} 
        onDisconnect={onDisconnect}
        navigate={navigate}
      />
    </div>
  );
} 