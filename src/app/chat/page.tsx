'use client';

import '@/utils/suppress-console';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import TopBar from '../../components/TopBar';
import { PortfolioBox } from '../../components/responses/PortfolioBox';
import { TokenBox } from '../../components/responses/TokenBox';
import { WalletProvider, ConnectionProvider, useWallet } from '@solana/wallet-adapter-react';
import { CoinbaseWalletAdapter, SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useRouter } from 'next/navigation';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import ConnectPromptModal from '../../components/ConnectPromptModal';
import WalletModal from '../../components/WalletModal';
import ModelSelector from '../../components/ModelSelector';

const endpoint = clusterApiUrl('mainnet-beta');

interface Message {
  role: 'user' | 'assistant';
  content: string | null;
  timestamp: Date;
  isPortfolio?: boolean;
  tokenData?: any;
}

interface AIAssistantProps {
  address: string | undefined;
  chatId: string;
  chats: Chat[];
  onUpdateChat: (messages: Message[]) => void;
  onFirstMessage: (message: string) => void;
}

function AIAssistant({ address, chatId, chats, onUpdateChat, onFirstMessage }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [portfolioData, setPortfolioData] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(chat => chat.id === chatId);
  const messages = currentChat?.messages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateChat(newMessages);

    if (messages.length === 0) {
      onFirstMessage(input);
    }

    setInput('');
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
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.portfolioData) {
        setPortfolioData(data.portfolioData);
        onUpdateChat([...newMessages, { role: 'assistant', content: null, timestamp: new Date(), isPortfolio: true }]);
      } else if (data.tokenData) {
        onUpdateChat([...newMessages, { role: 'assistant', content: null, timestamp: new Date(), tokenData: data.tokenData }]);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        onUpdateChat([...newMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      onUpdateChat([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
              <img src="/icons/sage.svg" alt="Sage" className="w-16 h-16 mb-4" />
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">
                Ask the Sage!
              </h1>
              <p className="text-gray-600 mb-8">
                Explore the Solana ecosystem.
              </p>
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask the sage anything..."
                      className="w-full h-24 px-4 pt-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-black placeholder:text-gray-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }
                      }}
                    />
                    <div className="absolute left-2 bottom-3">
                      <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
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
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the sage anything..."
                  className="w-full h-24 px-4 pt-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-black placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <div className="absolute left-2 bottom-3">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

const ChatContent = () => {
  const router = useRouter();
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState('');
  const { disconnect, wallet } = useWallet();

  useEffect(() => {
    if (connectedAddress) {
      const savedChats = localStorage.getItem(`chats-${connectedAddress}`);
      const savedActiveChat = localStorage.getItem(`activeChat-${connectedAddress}`);
      
      if (savedChats) {
        setChats(JSON.parse(savedChats));
        setActiveChat(savedActiveChat || JSON.parse(savedChats)[0]?.id || '');
      } else {
        const defaultChat = { id: `chat-${Date.now()}`, name: 'New Chat', messages: [] };
        setChats([defaultChat]);
        setActiveChat(defaultChat.id);
      }
    }
  }, [connectedAddress]);

  useEffect(() => {
    if (connectedAddress && chats.length > 0) {
      localStorage.setItem(`chats-${connectedAddress}`, JSON.stringify(chats));
      localStorage.setItem(`activeChat-${connectedAddress}`, activeChat);
    }
  }, [chats, activeChat, connectedAddress]);

  const handleDisconnect = useCallback(async () => {
    try {
      if (wallet) {
        await disconnect();
      }
      localStorage.removeItem('connectedAddress');
      localStorage.removeItem(`chats-${connectedAddress}`);
      localStorage.removeItem(`activeChat-${connectedAddress}`);
      setConnectedAddress(null);
      setChats([]);
      setActiveChat('');
      setShowConnectPrompt(false);
      setTimeout(() => {
        setShowConnectPrompt(true);
      }, 10);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, [disconnect, wallet, connectedAddress]);

  const handleWalletConnect = useCallback((address: string) => {
    localStorage.setItem('connectedAddress', address);
    setConnectedAddress(address);
    setShowConnectPrompt(false);
    setIsWalletModalOpen(false);
  }, []);

  const createNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      name: 'New Chat',
      messages: []
    };
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat.id);
  };

  const updateChatName = (chatId: string, firstMessage: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const name = firstMessage.length > 30 
          ? firstMessage.substring(0, 30) + '...'
          : firstMessage;
        return { ...chat, name };
      }
      return chat;
    }));
  };

  useEffect(() => {
    const storedAddress = localStorage.getItem('connectedAddress');
    if (storedAddress && !connectedAddress) {
      setConnectedAddress(storedAddress);
    }
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
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <button
              onClick={createNewChat}
              className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg shadow hover:shadow-md transition-all duration-200"
            >
              New Chat
            </button>
          </div>
          <div className="overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left p-3 hover:bg-gray-100 transition-colors duration-200 ${
                  activeChat === chat.id ? 'bg-gray-100' : ''
                }`}
              >
                <p className="text-sm truncate">{chat.name}</p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-2">
          <div className="bg-white rounded-lg shadow-md overflow-y-auto h-full">
            <AIAssistant 
              address={connectedAddress || undefined} 
              chatId={activeChat}
              chats={chats}
              onUpdateChat={(messages: Message[]) => {
                setChats(prev => prev.map(chat => {
                  if (chat.id === activeChat) {
                    return { ...chat, messages };
                  }
                  return chat;
                }));
              }}
              onFirstMessage={(message: string) => {
                updateChatName(activeChat, message);
              }}
            />
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
      <WalletProvider wallets={wallets} autoConnect={true}>
        <ChatContent />
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Chat; 