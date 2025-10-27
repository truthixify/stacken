import '../styles/globals.css';
import { useEffect } from 'react';
import { useAutoRegister } from '../hooks/useAutoRegister';

import type { AppProps } from 'next/app';

function AppContent({ Component, pageProps }: AppProps) {
  // Auto-register users when they connect
  useAutoRegister();

  return <Component {...pageProps} />;
}

export default function MyApp(props: AppProps) {
  // Apply dark theme on client side to avoid hydration mismatch
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <AppContent {...props} />;
}
