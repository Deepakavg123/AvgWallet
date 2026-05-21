'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { MultiChainWallet, BlockchainNetwork } from '@/types';
import { NETWORKS } from '@/config/networks';

interface ExportWalletProps {
  wallet: MultiChainWallet;
  onBack: () => void;
}

export default function ExportWallet({ wallet, onBack }: ExportWalletProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({});
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(wallet.mnemonic);
    setCopiedMnemonic(true);
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  const handleCopyPrivateKey = (network: string, privateKey: string) => {
    navigator.clipboard.writeText(privateKey);
    setCopiedPrivateKey(network);
    setTimeout(() => setCopiedPrivateKey(''), 2000);
  };

  const togglePrivateKeyVisibility = (network: string) => {
    setShowPrivateKeys((prev) => ({
      ...prev,
      [network]: !prev[network],
    }));
  };

  const networks: BlockchainNetwork[] = ['ethereum', 'polygon', 'binance', 'base', 'solana', 'bitcoin'];
  const isPrivateKeyImport = wallet.mnemonic.includes('[Private Key Import');

  // Filter out dummy accounts (addresses starting with 0x0000 or 1111)
  const validNetworks = networks.filter((network) => {
    const account = wallet.accounts[network];
    return !account.address.startsWith('0x0000') && !account.address.startsWith('1111');
  });

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Security Warning
          </h1>

          <div className="space-y-4 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Never Share Your Keys</h3>
              <p className="text-red-800 text-sm">
                Anyone with your recovery phrase or private keys can access and steal your funds. Only export your keys in a secure environment.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">🔒 Keep Your Keys Safe</h3>
              <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                <li>Never share your keys with anyone</li>
                <li>Store them in a secure location</li>
                <li>Don&apos;t take screenshots or photos</li>
                <li>Beware of phishing attempts</li>
              </ul>
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-trust-blue
                         focus:ring-trust-blue mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I understand the risks and want to export my wallet credentials. I will keep them secure and never share them with anyone.
            </span>
          </label>

          <button
            onClick={() => setConfirmed(true)}
            disabled={!confirmed}
            className="w-full btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-trust-blue text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Export Wallet</h1>
        <p className="text-blue-100 mt-1">
          View and backup your wallet credentials
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Recovery Phrase Section - Only show if not a private key import */}
        {!isPrivateKeyImport && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔑</span> Recovery Phrase
            </h2>

            <div className="bg-gray-50 rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Your 12-word recovery phrase
                </p>
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="text-trust-blue hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  {showMnemonic ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm">Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Reveal</span>
                    </>
                  )}
                </button>
              </div>

              {showMnemonic ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {wallet.mnemonic.split(' ').map((word, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg text-center border border-gray-200"
                      >
                        <span className="text-xs text-gray-500">{index + 1}.</span>
                        <span className="text-sm font-medium ml-1">{word}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCopyMnemonic}
                    className="w-full btn-outline flex items-center justify-center gap-2"
                  >
                    {copiedMnemonic ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Recovery Phrase
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Click &quot;Reveal&quot; to view your recovery phrase</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info for private key imports */}
        {isPrivateKeyImport && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-blue-900 text-sm font-medium mb-1">
              ℹ️ Private Key Import
            </p>
            <p className="text-blue-800 text-sm">
              This wallet was imported using a private key. Recovery phrase is not available. Only the imported account(s) will be shown below.
            </p>
          </div>
        )}

        {/* Private Keys Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🔐</span> Private Keys
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            {isPrivateKeyImport
              ? 'View private keys for imported account(s)'
              : 'View private keys for each network'
            }
          </p>

          <div className="space-y-3">
            {validNetworks.map((network) => {
              const account = wallet.accounts[network];
              const networkConfig = NETWORKS[network];
              const isVisible = showPrivateKeys[network];

              return (
                <div key={network} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${networkConfig.color}20` }}
                      >
                        {networkConfig.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{networkConfig.name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {account.address.slice(0, 10)}...{account.address.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePrivateKeyVisibility(network)}
                      className="text-trust-blue hover:text-blue-600 transition-colors"
                    >
                      {isVisible ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {isVisible && (
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Private Key</p>
                        <p className="text-xs font-mono break-all text-gray-900">
                          {account.privateKey}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyPrivateKey(network, account.privateKey)}
                        className="w-full py-2 px-4 bg-white border-2 border-trust-blue text-trust-blue
                                   rounded-lg hover:bg-trust-blue hover:text-white transition-all
                                   flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        {copiedPrivateKey === network ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Private Key
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Footer */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Remember: Never share these credentials with anyone. Anyone with access to your recovery phrase or private keys can steal your funds.
          </p>
        </div>
      </div>
    </div>
  );
}
