import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Token {
  symbol: string;
  balance: number;
  value: number;
  price: number;
}

interface PortfolioData {
  address: string;
  totalValue: number;
  tokens: Token[];
}

export function PortfolioBox({ portfolioData }: { portfolioData: PortfolioData | null }) {
  if (!portfolioData) {
    return <div className="text-gray-500">No portfolio data available.</div>;
  }

  const { address, totalValue, tokens } = portfolioData;

  const data = {
    labels: tokens.map(token => token.symbol),
    datasets: [
      {
        data: tokens.map(token => token.value),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border-2 border-gradient-to-r from-emerald-500 to-teal-500">
      <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
      <div className="mb-2">
        <span className="font-semibold">Wallet Address:</span> {address}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Total Value:</span> ${totalValue.toFixed(2)}
      </div>
      <div>
        <span className="font-semibold">Assets:</span>
        {tokens.length ? (
          <ul className="mt-2 space-y-2">
            {tokens.map((token, index) => (
              <li key={index} className="flex justify-between">
                <span>{token.symbol}</span>
                <span>{token.balance.toFixed(4)} ($ {token.value.toFixed(2)} @ $ {token.price.toFixed(2)})</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No assets found</div>
        )}
      </div>
      <div className="mt-6">
        <Pie data={data} />
      </div>
    </div>
  );
} 