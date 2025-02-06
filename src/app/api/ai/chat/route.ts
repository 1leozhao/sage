import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Connection, PublicKey } from '@solana/web3.js';

if (!process.env.SOLANA_RPC_URL) {
  throw new Error('SOLANA_RPC_URL environment variable is not set');
}

const connection = new Connection(process.env.SOLANA_RPC_URL);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchSolanaPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 0;
  }
}

async function fetchTokenPrice(mintAddress: string) {
  try {
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintAddress}`);
    const data = await response.json();
    const priceData = data.data?.[mintAddress];
    return priceData?.price ? parseFloat(priceData.price) : 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}

async function fetchTokenInfo(mintAddress: string) {
  try {
    const response = await fetch(`https://api.jup.ag/tokens/v1/token/${mintAddress}`);
    const tokenInfo = await response.json();
    
    console.log(`Token info for ${mintAddress}:`, tokenInfo);
    
    if (tokenInfo) {
      const price = await fetchTokenPrice(mintAddress);
      console.log(`Price for ${tokenInfo.symbol}:`, price);
      
      return {
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        price: price,
        logoURI: tokenInfo.logoURI
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token info for ' + mintAddress + ':', error);
    return null;
  }
}

async function fetchPortfolioData(address: string) {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    const solBalance = balance / 1e9;
    const solPrice = await fetchSolanaPrice();
    const solValue = solBalance * solPrice;

    const tokens = [{
      symbol: 'SOL',
      name: 'Solana',
      balance: solBalance,
      value: solValue,
      price: solPrice,
      icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    }];

    for (const account of tokenAccounts.value) {
      const mintAddress = account.account.data.parsed.info.mint;
      const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
      const tokenInfo = await fetchTokenInfo(mintAddress);
      
      if (tokenInfo) {
        console.log(`Processing token ${tokenInfo.symbol}:`, {
          balance,
          price: tokenInfo.price,
          value: balance * tokenInfo.price
        });

        tokens.push({
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          balance: balance,
          value: balance * tokenInfo.price,
          price: tokenInfo.price,
          icon: tokenInfo.logoURI || ''
        });
      }
    }

    const filteredTokens = tokens.filter(token => token.balance > 0);
    const totalValue = filteredTokens.reduce((sum, token) => sum + token.value, 0);

    const portfolioData = {
      address: address,
      totalValue: totalValue,
      tokens: filteredTokens
    };

    console.log('Final portfolio data:', portfolioData);
    return portfolioData;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { message, address, history, model } = await req.json();

    if (message.toLowerCase().includes('portfolio') && address) {
      const portfolioData = await fetchPortfolioData(address);
      if (portfolioData) {
        return NextResponse.json({ portfolioData });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content || '',
        })),
        { role: "user", content: message }
      ],
    });

    return NextResponse.json({ 
      response: response.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}
