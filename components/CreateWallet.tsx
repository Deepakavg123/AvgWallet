'use client';

import { useState } from 'react';
import { PlusCircle, Download, ArrowLeft, Copy, Check, Eye, EyeOff, Key } from 'lucide-react';
import { WalletService } from '@/services/walletService';
import { StorageService } from '@/services/storageService';
import { BlockchainNetwork } from '@/types';
import { NETWORKS } from '@/config/networks';

interface CreateWalletProps {
  onWalletCreated: () => void;
  onBack: () => void;
}

type Step = 'choice' | 'create' | 'import' | 'importPrivateKey';
type ImportMethod = 'mnemonic' | 'privateKey';

export default function CreateWallet({ onWalletCreated, onBack }: CreateWalletProps) {
  const [step, setStep] = useState<Step>('choice');
  const [mnemonic, setMnemonic] = useState('');
  const [importMnemonic, setImportMnemonic] = useState('');
  const [importMethod, setImportMethod] = useState<ImportMethod>('mnemonic');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('ethereum');
  const [copied, setCopied] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = () => {
    try {
      const newMnemonic = WalletService.generateMnemonic();
      setMnemonic(newMnemonic);
      setStep('create');
    } catch (err) {
      setError('Failed to generate wallet. Please try again.');
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmWallet = async () => {
    if (!confirmed) {
      setError('Please confirm that you have saved your recovery phrase');
      return;
    }

    setLoading(true);
    try {
      const wallet = WalletService.createMultiChainWallet(mnemonic);
      StorageService.saveWallet(wallet);
      onWalletCreated();
    } catch (err) {
      setError('Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    setError('');
    const trimmedMnemonic = importMnemonic.trim();

    if (!WalletService.validateMnemonic(trimmedMnemonic)) {
      setError('Invalid recovery phrase. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      const wallet = WalletService.importWallet(trimmedMnemonic);
      StorageService.saveWallet(wallet);
      onWalletCreated();
    } catch (err) {
      setError('Failed to import wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrivateKey = async () => {
    setError('');
    // Remove all whitespace characters (spaces, tabs, newlines, etc.)
    const trimmedPrivateKey = privateKey.trim().replace(/\s+/g, '');

    if (!trimmedPrivateKey) {
      setError('Please enter a private key');
      return;
    }

    setLoading(true);
    try {
      const existingWallet = StorageService.getWallet();
      let importedAccount: any;

      // Handle different blockchain types
      if (selectedNetwork === 'solana') {
        // Solana private key import
        importedAccount = WalletService.importSolanaFromPrivateKey(trimmedPrivateKey);

        if (existingWallet) {
          existingWallet.accounts.solana = importedAccount;
          StorageService.saveWallet(existingWallet);
        } else {
          // Create new wallet with only Solana imported
          const wallet = {
            mnemonic: '[Private Key Import - No Mnemonic Available]',
            accounts: {
              ethereum: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'ethereum' as const,
                balance: '0',
              },
              polygon: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'polygon' as const,
                balance: '0',
              },
              binance: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'binance' as const,
                balance: '0',
              },
              base: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'base' as const,
                balance: '0',
              },
              solana: importedAccount,
              bitcoin: {
                address: '1111111111111111111111111111111111',
                privateKey: '0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0000000000000000000000000000000000000000000000000000000000000000',
                network: 'bitcoin' as const,
                balance: '0',
              },
            },
            createdAt: Date.now(),
          };
          StorageService.saveWallet(wallet);
        }
      } else if (selectedNetwork === 'bitcoin') {
        // Bitcoin private key import
        importedAccount = WalletService.importBitcoinFromPrivateKey(trimmedPrivateKey);

        if (existingWallet) {
          existingWallet.accounts.bitcoin = importedAccount;
          StorageService.saveWallet(existingWallet);
        } else {
          // Create new wallet with only Bitcoin imported
          const wallet = {
            mnemonic: '[Private Key Import - No Mnemonic Available]',
            accounts: {
              ethereum: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'ethereum' as const,
                balance: '0',
              },
              polygon: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'polygon' as const,
                balance: '0',
              },
              binance: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'binance' as const,
                balance: '0',
              },
              base: {
                address: '0x0000000000000000000000000000000000000000',
                privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
                network: 'base' as const,
                balance: '0',
              },
              solana: {
                address: '11111111111111111111111111111111',
                privateKey: '0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '11111111111111111111111111111111',
                network: 'solana' as const,
                balance: '0',
              },
              bitcoin: importedAccount,
            },
            createdAt: Date.now(),
          };
          StorageService.saveWallet(wallet);
        }
      } else {
        // EVM chains (ethereum, polygon, binance, base)
        // Validate EVM private key format
        const hexPattern = /^(0x)?[0-9a-fA-F]{64}$/;
        if (!hexPattern.test(trimmedPrivateKey)) {
          setLoading(false);
          const actualLength = trimmedPrivateKey.startsWith('0x')
            ? trimmedPrivateKey.length - 2
            : trimmedPrivateKey.length;
          setError(`Invalid EVM private key format. Expected 64 hex characters, got ${actualLength}. Please check for missing or extra characters.`);
          return;
        }

        // Ensure 0x prefix
        const formattedPrivateKey = trimmedPrivateKey.startsWith('0x')
          ? trimmedPrivateKey
          : `0x${trimmedPrivateKey}`;

        // Import account with private key - works for all EVM chains
        importedAccount = WalletService.importFromPrivateKey(
          formattedPrivateKey,
          selectedNetwork as 'ethereum' | 'polygon' | 'binance' | 'base'
        );

        if (existingWallet) {
          // If wallet exists, update ALL EVM chain accounts (they share the same address)
          existingWallet.accounts.ethereum = { ...importedAccount, network: 'ethereum' as const };
          existingWallet.accounts.polygon = { ...importedAccount, network: 'polygon' as const };
          existingWallet.accounts.binance = { ...importedAccount, network: 'binance' as const };
          existingWallet.accounts.base = { ...importedAccount, network: 'base' as const };
          StorageService.saveWallet(existingWallet);
        } else {
          // Create wallet structure with the same account for all EVM chains
          const wallet = {
            mnemonic: '[Private Key Import - No Mnemonic Available]',
            accounts: {
              ethereum: { ...importedAccount, network: 'ethereum' as const },
              polygon: { ...importedAccount, network: 'polygon' as const },
              binance: { ...importedAccount, network: 'binance' as const },
              base: { ...importedAccount, network: 'base' as const },
              solana: {
                address: '11111111111111111111111111111111',
                privateKey: '0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '11111111111111111111111111111111',
                network: 'solana' as const,
                balance: '0',
              },
              bitcoin: {
                address: '1111111111111111111111111111111111',
                privateKey: '0000000000000000000000000000000000000000000000000000000000000000',
                publicKey: '0000000000000000000000000000000000000000000000000000000000000000',
                network: 'bitcoin' as const,
                balance: '0',
              },
            },
            createdAt: Date.now(),
          };
          StorageService.saveWallet(wallet);
        }
      }

      onWalletCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to import private key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Create or Import Wallet
          </h1>
          <p className="text-gray-600 mb-12">
            Choose how you want to set up your wallet
          </p>

          <div className="space-y-4">
            <button
              onClick={handleCreateWallet}
              className="primary-theme-btn w-full text-white p-6 rounded-2xl
           transition-all duration-200 active:scale-95
           flex items-center gap-4"
            >
              <div className="bg-white/20 p-3 rounded-xl">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Create New Wallet</h3>
                <p className="text-blue-100 text-sm">
                  Generate a new wallet for all supported chains
                </p>
              </div>
            </button>

            <button
              onClick={() => setStep('import')}
              className="w-full bg-gray-100 text-gray-900 p-6 rounded-2xl
                         hover:bg-gray-200 transition-all duration-200 active:scale-95
                         flex items-center gap-4"
            >
              <div className=" bg-white p-3 rounded-xl">
                <Download className="w-6 h-6 text-[#1A2B4C]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Import Wallet</h3>
                <p className="text-gray-600 text-sm">
                  Import using your recovery phrase
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-white">
        <button
          onClick={() => setStep('choice')}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Secret Recovery Phrase
          </h1>
          <p className="text-gray-600 mb-6">
            Write down or copy these words in the correct order and save them somewhere safe.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              ⚠️ Never share your recovery phrase. Anyone with this phrase can access your funds.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6 relative">
            <div className={`${!showMnemonic ? 'blur-sm' : ''} transition-all`}>
              <div className="grid grid-cols-3 gap-3">
                {mnemonic.split(' ').map((word, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg text-center"
                  >
                    <span className="text-xs text-gray-500">{index + 1}.</span>
                    <span className="text-sm font-medium ml-1">{word}</span>
                  </div>
                ))}
              </div>
            </div>

            {!showMnemonic && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setShowMnemonic(true)}
                  className="bg-gradient-to-br from-[#0B1220] via-[#1A2B4C] to-[#1E3A5F] text-white px-6 py-3 rounded-xl
                             hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Reveal Phrase
                </button>
              </div>
            )}
          </div>

          {showMnemonic && (
            <>
              <button
                onClick={handleCopyMnemonic}
                className="w-full btn-outline mb-6 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy to Clipboard
                  </>
                )}
              </button>

              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 accent-[#1A2B4C]
                             focus:ring-[#1A2B4C]"
                />
                <span className="text-sm text-gray-700">
                  I have saved my recovery phrase securely
                </span>
              </label>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmWallet}
                disabled={loading || !confirmed}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading && <div className="spinner" />}
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (step === 'import') {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-white">
        <button
          onClick={() => setStep('choice')}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Import Wallet
          </h1>
          <p className="text-gray-600 mb-6">
            Choose how you want to import your wallet
          </p>

          {/* Import Method Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setImportMethod('mnemonic')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                importMethod === 'mnemonic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Recovery Phrase
            </button>
            <button
              onClick={() => setImportMethod('privateKey')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                importMethod === 'privateKey'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Private Key
            </button>
          </div>

          {importMethod === 'mnemonic' ? (
            <>
              <p className="text-gray-600 text-sm mb-4">
                Enter your 12 or 24-word recovery phrase
              </p>

              <textarea
                value={importMnemonic}
                onChange={(e) => setImportMnemonic(e.target.value)}
                placeholder="Enter your recovery phrase separated by spaces"
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl
                           focus:border-trust-blue focus:outline-none resize-none mb-6"
              />

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleImportWallet}
                disabled={loading || !importMnemonic.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading && <div className="spinner" />}
                Import Wallet
              </button>
            </>
          ) : (
            <>
              {/* Network Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blockchain Network
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value as BlockchainNetwork)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                             focus:border-trust-blue focus:outline-none"
                >
                  <optgroup label="EVM Chains (Same Address)">
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="polygon">Polygon (MATIC)</option>
                    <option value="binance">BNB Smart Chain (BNB)</option>
                    <option value="base">Base (ETH)</option>
                  </optgroup>
                  <optgroup label="Non-EVM Chains">
                    <option value="solana">Solana (SOL)</option>
                    <option value="bitcoin">Bitcoin (BTC)</option>
                  </optgroup>
                </select>
              </div>

              {/* Info boxes based on selected network */}
              {(selectedNetwork === 'ethereum' || selectedNetwork === 'polygon' || selectedNetwork === 'binance' || selectedNetwork === 'base') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-blue-900 text-sm font-medium mb-1">
                    ℹ️ EVM Chains Share Same Address
                  </p>
                  <p className="text-blue-800 text-sm">
                    Your private key will work for all EVM chains (Ethereum, Polygon, BSC, Base). They all use the same address!
                  </p>
                </div>
              )}

              {selectedNetwork === 'solana' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                  <p className="text-purple-900 text-sm font-medium mb-1">
                    🔮 Solana Private Key (Phantom Compatible)
                  </p>
                  <p className="text-purple-800 text-sm">
                    Supports Phantom wallet format! You can export your private key from Phantom and paste it here. This will only import your Solana wallet.
                  </p>
                </div>
              )}

              {selectedNetwork === 'bitcoin' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <p className="text-orange-900 text-sm font-medium mb-1">
                    ₿ Bitcoin Private Key
                  </p>
                  <p className="text-orange-800 text-sm">
                    Bitcoin uses a different address format. This will only import your Bitcoin wallet. For multi-chain support, use recovery phrase instead.
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-sm mb-2 font-medium">
                {selectedNetwork === 'solana' && 'Enter your Solana private key'}
                {selectedNetwork === 'bitcoin' && 'Enter your Bitcoin private key'}
                {(selectedNetwork === 'ethereum' || selectedNetwork === 'polygon' || selectedNetwork === 'binance' || selectedNetwork === 'base') && 'Enter your EVM private key'}
              </p>

              {/* Format instructions */}
              <p className="text-gray-500 text-xs mb-4">
                {selectedNetwork === 'solana' && 'Format: Base58 (Phantom wallet) or hex (64/128 chars)'}
                {selectedNetwork === 'bitcoin' && 'Format: WIF (starts with 5/K/L) or 64-character hex'}
                {(selectedNetwork === 'ethereum' || selectedNetwork === 'polygon' || selectedNetwork === 'binance' || selectedNetwork === 'base') && 'Format: 64-character hex (with or without 0x prefix)'}
              </p>

              <div className="mb-6 relative">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder={
                    selectedNetwork === 'solana'
                      ? 'Base58 or hex format...'
                      : selectedNetwork === 'bitcoin'
                      ? 'WIF or 64 hex characters...'
                      : '0x... or without 0x prefix'
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl pr-12
                             focus:border-trust-blue focus:outline-none font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPrivateKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleImportPrivateKey}
                disabled={loading || !privateKey.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading && <div className="spinner" />}
                <Key className="w-5 h-5" />
                Import Private Key
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
