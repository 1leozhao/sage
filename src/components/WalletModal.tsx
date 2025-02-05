import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';

export default function WalletModal({
  isOpen,
  onClose,
  navigate,
  onWalletConnect,
}: {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  onWalletConnect: (address: string) => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { select, connect, publicKey, connected, wallet } = useWallet();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (connected && publicKey && !hasNavigated) {
      const publicKeyString = publicKey.toBase58();
      onWalletConnect(publicKeyString);
      onClose();
      setHasNavigated(true);
      if (window.location.pathname !== '/chat') {
        navigate('/chat');
      }
    }
  }, [connected, publicKey, onWalletConnect, onClose, navigate, hasNavigated]);

  useEffect(() => {
    if (!isOpen) {
      setHasNavigated(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedWallet && wallet) {
      connect().catch((error: any) => {
        setSelectedWallet(null);
      });
    }
  }, [selectedWallet, connect, wallet]);

  const handleConnect = useCallback((walletName: WalletName) => {
    select(walletName);
    setSelectedWallet(walletName);
  }, [select]);

  if (!isAnimating && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0" onClick={onClose} />
      <div 
        className={`absolute top-20 right-4 bg-white p-4 rounded-lg shadow-xl w-80 border border-gray-200
          transform transition-all duration-300 ease-in-out origin-top-right
          ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}
        `}
      >
        {!connected && (
          <>
            <button
              onClick={() => handleConnect('Solflare' as WalletName)}
              className="flex items-center w-full mb-3 bg-gradient-to-r from-rose-700 to-orange-700 text-white font-semibold rounded-lg px-4 py-3 shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              <img src="/icons/solflare.png" alt="Solflare" className="w-6 h-6 mr-3" />
              Solflare
            </button>
            <button
              onClick={() => handleConnect('Phantom' as WalletName)}
              className="flex items-center w-full mb-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-lg px-4 py-3 shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              <img src="/icons/phantom.png" alt="Phantom" className="w-6 h-6 mr-3" />
              Phantom
            </button>
            <button
              onClick={() => handleConnect('Coinbase Wallet' as WalletName)}
              className="flex items-center w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg px-4 py-3 shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              <img src="/icons/coinbase.png" alt="Coinbase" className="w-6 h-6 mr-3" />
              Coinbase
            </button>
          </>
        )}
      </div>
    </div>
  );
}
