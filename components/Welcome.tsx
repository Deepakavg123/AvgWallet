'use client'

import { Wallet, Shield, Zap } from 'lucide-react'

interface WelcomeProps {
  onGetStarted: () => void
}

export default function Welcome({ onGetStarted }: WelcomeProps) {
  const features = [
    {
      icon: <Wallet className="w-8 h-8 text-trust-blue" />,
      title: 'Multi-Chain Support',
      description: 'Support for Ethereum, Polygon, Binance, Base, Solana & Bitcoin',
    },
    {
      icon: <Shield className="w-8 h-8 text-trust-blue" />,
      title: 'Secure & Private',
      description: 'Your keys, your crypto. We never have access to your funds',
    },
    {
      icon: <Zap className="w-8 h-8 text-trust-blue" />,
      title: 'Fast Transactions',
      description: 'Send and receive crypto instantly across multiple networks',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-b from-trust-blue to-blue-700">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div className="mb-8 animate-fadeIn">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <Wallet className="w-12 h-12 text-trust-blue" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-3 animate-fadeIn">EXTrust Wallet</h1>
        <p className="text-blue-100 text-lg mb-12 animate-fadeIn">
          Your gateway to the world of crypto
        </p>

        {/* Features */}
        <div className="space-y-6 mb-12 w-full max-w-md">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-left animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white rounded-xl p-2 flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started Button */}
      <button
        onClick={onGetStarted}
        className="w-full bg-white text-trust-blue font-bold py-4 rounded-2xl
                   hover:bg-blue-50 transition-all duration-200 active:scale-95
                   shadow-xl"
      >
        Get Started
      </button>
    </div>
  )
}
