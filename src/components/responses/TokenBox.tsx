import React from 'react';

interface Token {
  icon: string;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  volume: number;
}

export function TokenBox({ token }: { token: Token }) {
  return (
    <div className="token-box p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <img src={token.icon} alt={token.name} className="token-icon w-12 h-12 mb-2" />
      <div className="token-info">
        <strong className="block text-lg font-semibold">{token.name} ({token.symbol})</strong>
        <p className="text-sm text-gray-600">Price: ${token.price.toFixed(5)} ({token.priceChange.toFixed(2)}%)</p>
        <p className="text-sm text-gray-600">24h Volume: ${token.volume.toFixed(2)}</p>
      </div>
    </div>
  );
} 