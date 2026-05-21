'use client';

import { useEffect, useState } from 'react';
import Welcome from '@/components/Welcome';
import CreateWallet from '@/components/CreateWallet';
import WalletDashboard from '@/components/WalletDashboard';
import { StorageService } from '@/services/storageService';

type Screen = 'welcome' | 'create' | 'dashboard';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if wallet already exists
    const hasWallet = StorageService.hasWallet();
    if (hasWallet) {
      setCurrentScreen('dashboard');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner" />
      </div>
    );
  }

  if (currentScreen === 'welcome') {
    return <Welcome onGetStarted={() => setCurrentScreen('create')} />;
  }

  if (currentScreen === 'create') {
    return (
      <CreateWallet
        onWalletCreated={() => setCurrentScreen('dashboard')}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  return <WalletDashboard />;
}
