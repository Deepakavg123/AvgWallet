'use client'

import { Wallet, Shield, Zap } from 'lucide-react'

interface WelcomeProps {
  onGetStarted: () => void
}

export default function Welcome({
  onGetStarted,
}: WelcomeProps) {
  const features = [
    {
      icon: (
        <Wallet className="w-8 h-8 text-[#A0E817]" />
      ),

      title: 'Multi-Chain Support',

      description:
        'Support for Ethereum, Polygon, Binance, Base, Solana & Bitcoin',
    },

    {
      icon: (
        <Shield className="w-8 h-8 text-[#FF9902]" />
      ),

      title: 'Secure & Private',

      description:
        'Your keys, your crypto. We never have access to your funds',
    },

    {
      icon: (
        <Zap className="w-8 h-8 text-[#0063CE]" />
      ),

      title: 'Fast Transactions',

      description:
        'Send and receive crypto instantly across multiple networks',
    },
  ]

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        items-center
        justify-between
        p-6
        bg-gradient-to-br
        from-[#0B1220]
        via-[#1A2B4C]
        to-[#1E3A5F]
        overflow-hidden
        relative
      "
    >
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#0063CE]/20 rounded-full blur-3xl" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#A0E817]/10 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Logo */}
        <div className="mb-10 animate-fadeIn">
          <div
            className="
              w-32
              h-32
              bg-white/10
              backdrop-blur-2xl
              border
              border-white/10
              rounded-[38px]
              flex
              items-center
              justify-center
              shadow-[0_10px_40px_rgba(0,0,0,0.35)]
            "
          >
            <img
              src="/logo.png"
              alt="AGILAVETRI"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="
            text-5xl
            font-extrabold
            text-white
            tracking-wide
            mb-3
            animate-fadeIn
          "
        >
          AGILAVETRI
        </h1>

        <p
          className="
            text-[#A0E817]
            text-sm
            uppercase
            tracking-[0.35em]
            mb-14
            animate-fadeIn
          "
        >
          Crypto Wallet
        </p>

        {/* Features */}
        <div className="space-y-6 mb-14 w-full max-w-md">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-white/5
                border
                border-white/10
                backdrop-blur-2xl
                rounded-[32px]
                p-6
                text-left
                animate-fadeIn
                shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                hover:scale-[1.02]
                transition-all
              "
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon Box */}
                <div
                  className="
                    bg-white/10
                    border
                    border-white/10
                    rounded-2xl
                    p-3
                    flex-shrink-0
                  "
                >
                  {feature.icon}
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="
                      text-white
                      font-semibold
                      text-lg
                      mb-2
                    "
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                      text-gray-300
                      text-sm
                      leading-relaxed
                    "
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started Button */}
      <button
        onClick={onGetStarted}
        className="
          w-full
          max-w-md
          bg-gradient-to-r
          from-[#0063CE]
          to-[#0B1220]
          text-white
          font-bold
          py-5
          rounded-[28px]
          border
          border-white/10
          hover:scale-[1.02]
          transition-all
          duration-300
          active:scale-95
          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          relative
          z-10
        "
      >
        Get Started
      </button>
    </div>
  )
}