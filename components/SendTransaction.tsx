'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { MultiChainWallet, BlockchainNetwork, Token } from '@/types';
import { BlockchainService } from '@/services/blockchainService';
import { StorageService } from '@/services/storageService';
import { NETWORKS } from '@/config/networks';

interface SendTransactionProps {
  wallet: MultiChainWallet;
  network: BlockchainNetwork;
  onBack: () => void;
  onSuccess: () => void;
}

export default function SendTransaction({
  wallet,
  network,
  onBack,
  onSuccess,
}: SendTransactionProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState('0');

  const account = wallet.accounts[network];
  const networkConfig = NETWORKS[network];
  const isEVM = ['ethereum', 'polygon', 'binance', 'base'].includes(network);

  useEffect(() => {
    loadBalance();
    if (isEVM) {
      loadTokens();
    }
  }, [network]);

  const loadBalance = async () => {
    const bal = await BlockchainService.getBalance(account.address, network);
    setBalance(bal);
  };

  const loadTokens = () => {
    const allTokens = StorageService.getTokens();
    const networkTokens = allTokens.filter((t) => t.network === network);
    setTokens(networkTokens);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (!recipient.trim()) {
      setError('Please enter recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const availableBalance = selectedToken ? selectedToken.balance : balance;
    if (parseFloat(amount) > parseFloat(availableBalance)) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const txHash = await BlockchainService.sendTransaction({
        from: account.address,
        to: recipient.trim(),
        amount,
        network,
        privateKey: account.privateKey,
        tokenAddress: selectedToken?.address,
      });

      // Save transaction to history
      StorageService.addTransaction({
        hash: txHash,
        from: account.address,
        to: recipient.trim(),
        value: amount,
        timestamp: Date.now(),
        network,
        status: 'confirmed',
        type: 'send',
        tokenSymbol: selectedToken?.symbol || networkConfig.symbol,
      });

      setSuccess(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const availableBalance = selectedToken ? selectedToken.balance : balance;
    setAmount(availableBalance);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-trust-blue text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Send {networkConfig.symbol}</h1>
        <p className="text-blue-100 mt-1">
          Balance: {parseFloat(balance).toFixed(4)} {networkConfig.symbol}
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Token Selector (for EVM chains) */}
        {isEVM && tokens.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset
            </label>
            <select
              value={selectedToken?.address || ''}
              onChange={(e) => {
                const token = tokens.find((t) => t.address === e.target.value);
                setSelectedToken(token || null);
              }}
              className="input-field"
            >
              <option value="">
                {networkConfig.symbol} (Native)
              </option>
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {parseFloat(token.balance).toFixed(4)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recipient Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={`Enter ${networkConfig.name} address`}
            className="input-field"
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <button
              onClick={handleMaxAmount}
              className="text-trust-blue text-sm font-medium hover:underline"
            >
              Max
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="any"
              className="input-field pr-20"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {selectedToken?.symbol || networkConfig.symbol}
            </div>
          </div>
        </div>

        {/* Estimated Fee */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Network Fee</span>
            <span className="text-gray-900 font-medium">~ 0.001 {networkConfig.symbol}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fee may vary based on network congestion
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !recipient || !amount}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
