'use client';

import '@/utils/suppress-console';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import TopBar from '../../components/TopBar'; // Adjust the path as necessary
import { PortfolioBox } from '../../components/responses/PortfolioBox'; // Adjust the path as necessary
import { TokenBox } from '../../components/responses/TokenBox'; // Adjust the path as necessary
import { WalletProvider, ConnectionProvider, useWallet } from '@solana/wallet-adapter-react';
import { CoinbaseWalletAdapter, SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useRouter } from 'next/navigation';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import ConnectPromptModal from '../../components/ConnectPromptModal';
import WalletModal from '../../components/WalletModal';

interface Message {
  role: 'user' | 'assistant';
  content: string | null;
  timestamp: Date;
  isPortfolio?: boolean;
  tokenData?: any;
}

interface AIAssistantProps {
  address: string | undefined;
}

function AIAssistant({ address }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          address: address,
          history: messages,
        }),
      });

      const data = await response.json();
      if (data.portfolioData) {
        setPortfolioData(data.portfolioData);
        setMessages(prev => [...prev, { role: 'assistant', content: null, timestamp: new Date(), isPortfolio: true }]);
      } else if (data.tokenData) {
        setMessages(prev => [...prev, { role: 'assistant', content: null, timestamp: new Date(), tokenData: data.tokenData }]);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.isPortfolio ? (
                <PortfolioBox portfolioData={portfolioData} />
              ) : message.tokenData ? (
                message.tokenData.map((token: any, idx: number) => (
                  <TokenBox key={idx} token={token} />
                ))
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-500">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-teal-500 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}

const network = WalletAdapterNetwork.Mainnet;
const endpoint = clusterApiUrl(network);

const ChatContent = () => {
  const router = useRouter();
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { disconnect, wallet } = useWallet();

  useEffect(() => {
    const storedAddress = localStorage.getItem('connectedAddress');
    if (!storedAddress) {
      setShowConnectPrompt(true);
    } else {
      setConnectedAddress(storedAddress);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      if (wallet) {
        await disconnect();
      }
      localStorage.removeItem('connectedAddress');
      setConnectedAddress(null);
      setShowConnectPrompt(false);
      setTimeout(() => {
        setShowConnectPrompt(true);
      }, 10);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, [disconnect, wallet]);

  const handleWalletConnect = useCallback((address: string) => {
    localStorage.setItem('connectedAddress', address);
    setConnectedAddress(address);
    setShowConnectPrompt(false);
    setIsWalletModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar 
        onConnect={() => setIsWalletModalOpen(true)}
        connectedAddress={connectedAddress}
        onDisconnect={handleDisconnect}
        navigate={router.push}
      />
      <ConnectPromptModal
        isOpen={showConnectPrompt}
        onConnect={() => setIsWalletModalOpen(true)}
      />
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        navigate={router.push}
        onWalletConnect={handleWalletConnect}
      />
      <div className="flex flex-1" style={{ marginTop: '5rem' }}>
        <div className="w-64">
          {/* Nav content will go here */}
        </div>
        
        <div className="flex-1 p-2">
          <div className="bg-white rounded-lg shadow-md overflow-y-auto h-full">
            <AIAssistant address={connectedAddress || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <ChatContent />
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Chat; 