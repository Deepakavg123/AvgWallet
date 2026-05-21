'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { BlockchainNetwork, Token } from '@/types';
import { BlockchainService } from '@/services/blockchainService';
import { StorageService } from '@/services/storageService';
import { NETWORKS, COMMON_TOKENS } from '@/config/networks';

interface AddTokenProps {
  network: BlockchainNetwork;
  onBack: () => void;
  onTokenAdded: () => void;
}

export default function AddToken({ network, onBack, onTokenAdded }: AddTokenProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  } | null>(null);

  const networkConfig = NETWORKS[network];
  const commonTokens = COMMON_TOKENS[network] || [];

  const handleSearchToken = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const metadata = await BlockchainService.getTokenMetadata(
        tokenAddress.trim(),
        network
      );
      setTokenInfo(metadata);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch token information');
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!tokenInfo) return;

    try {
      const wallet = StorageService.getWallet();
      if (!wallet) {
        setError('Wallet not found');
        return;
      }

      const walletAddress = wallet.accounts[network].address;
      const { balance } = await BlockchainService.getTokenBalance(
        tokenAddress.trim(),
        walletAddress,
        network
      );

      const token: Token = {
        address: tokenAddress.trim(),
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        balance,
        network,
      };

      StorageService.addToken(token);
      onTokenAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add token');
    }
  };

  const handleAddCommonToken = async (token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }) => {
    try {
      const wallet = StorageService.getWallet();
      if (!wallet) return;

      const walletAddress = wallet.accounts[network].address;
      const { balance } = await BlockchainService.getTokenBalance(
        token.address,
        walletAddress,
        network
      );

      const newToken: Token = {
        ...token,
        balance,
        network,
      };

      StorageService.addToken(newToken);
      onTokenAdded();
    } catch (err) {
      console.error('Error adding token:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-[#0B1220] via-[#1A2B4C] to-[#1E3A5F] text-white p-6 rounded-b-3xl shadow-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Add Token</h1>
        <p className="text-blue-100 mt-1">
          Import custom tokens to {networkConfig.name}
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Popular Tokens */}
        {commonTokens.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Popular Tokens
            </h2>
            <div className="space-y-2">
              {commonTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleAddCommonToken(token)}
                  className="w-full card-hover flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{token.symbol}</p>
                      <p className="text-sm text-gray-400">{token.name}</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-trust-blue" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Token */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Custom Token
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Contract Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className="input-field flex-1"
              />
              <button
                onClick={handleSearchToken}
                disabled={loading}
                className="btn-primary px-4 flex items-center gap-2"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {tokenInfo && (
            <div className="bg-[#A0E817]/15 rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Token Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0E817]">Symbol:</span>
                  <span className="font-medium text-gray-900">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0E817]">Decimals:</span>
                  <span className="font-medium text-gray-900">{tokenInfo.decimals}</span>
                </div>
              </div>

              <button
                onClick={handleAddToken}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
