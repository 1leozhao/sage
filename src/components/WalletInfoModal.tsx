import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletInfoModal({ 
  isOpen, 
  onClose, 
  connectedAddress, 
  onDisconnect,
  navigate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  connectedAddress: string | null; 
  onDisconnect: () => void;
  navigate: (path: string) => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { disconnect } = useWallet();
  const router = useRouter();

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDisconnect = async () => {
    console.log('Disconnecting wallet and clearing local storage');
    onClose();
    localStorage.removeItem('connectedAddress');
    await disconnect();
    onDisconnect();
  };

  if (!isAnimating && !isOpen) return null;

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="fixed top-20 right-4 z-50">
        <div 
          className={`bg-gray-900 p-6 rounded-lg shadow-xl w-80 border border-gray-700
            transform transition-all duration-300 ease-in-out origin-top-right
            ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-mono text-gray-200">{formatAddress(connectedAddress)}</h2>
            <button 
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 