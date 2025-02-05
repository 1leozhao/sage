'use client';

import '@/utils/suppress-console';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for Next.js 13
import TopBar from '../../components/TopBar'; // Adjust the path as necessary
import WalletModal from '../../components/WalletModal'; // Adjust the path as necessary
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Define the network and endpoint
const network = WalletAdapterNetwork.Mainnet; // or 'devnet', 'testnet'
const endpoint = clusterApiUrl(network);

export default function Login() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log('Checking local storage for connected address');
    const storedAddress = localStorage.getItem('connectedAddress');
    if (storedAddress) {
      console.log('Found stored address:', storedAddress);
      setConnectedAddress(storedAddress);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    console.log('isLoggedIn changed:', isLoggedIn);
    if (isLoggedIn) {
      console.log('Redirecting to chat page');
      router.push('/chat');
    }
  }, [isLoggedIn, router]);

  const toggleModal = () => {
    setModalOpen(prev => !prev);
  };

  const handleNavigate = (path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleWalletConnect = useCallback((address: string) => {
    console.log('Setting connected address:', address);
    setConnectedAddress(address);
    localStorage.setItem('connectedAddress', address);
    setIsLoggedIn(true);
  }, [setConnectedAddress, setIsLoggedIn]);

  const handleWalletDisconnect = useCallback(() => {
    console.log('Clearing connected address');
    setConnectedAddress(null);
    localStorage.removeItem('connectedAddress');
    setIsLoggedIn(false);
  }, []);

  // Memoize wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect = {false}>
        <div className="relative min-h-screen bg-gray-50 text-black">
          <TopBar 
            onConnect={toggleModal} 
            connectedAddress={connectedAddress} 
            onDisconnect={handleWalletDisconnect}
          />
          <WalletModal 
            isOpen={isModalOpen} 
            onClose={toggleModal} 
            navigate={handleNavigate}
            onWalletConnect={handleWalletConnect}
          />
          <div className="flex flex-col items-center justify-start pt-32">
            <h1 className="text-5xl font-extrabold mb-4 animate-dramatic-fade-in-up bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text leading-tight">
              Ask The Sage
            </h1>
            <p className="mb-6 text-lg animate-dramatic-fade-in-up">
              Explore the DeFi landscape with the guidance of an AI Agent
            </p>
            <button
              onClick={toggleModal}
              className="px-6 py-3 mb-8 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get started
            </button>
          </div>
        </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}
