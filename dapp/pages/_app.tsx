import '../styles/globals.css';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback, useEffect } from 'react';
import { destroySession, saveSession } from '../common/fetchers';
import { STACKS_NETWORK } from '../common/constants';
import { useAutoRegister } from '../hooks/useAutoRegister';
import walletConfig from '../lib/wallet-config';

import type { AppProps } from 'next/app';
import type { ClientConfig } from '@micro-stacks/client';

// Component to handle auto-registration and theme inside ClientProvider
function AppWithAutoRegister({ Component, pageProps }: { Component: any; pageProps: any }) {
    useAutoRegister(); // Auto-register users when they connect wallet

    // Apply dark theme on client side to avoid hydration mismatch
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return <Component {...pageProps} />;
}

export default function MyApp({ Component, pageProps }: AppProps) {
    const onPersistState: ClientConfig['onPersistState'] = useCallback(
        async (dehydratedState: string) => {
            await saveSession(dehydratedState);
        },
        []
    );

    const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
        await destroySession();
    }, []);

    return (
        <ClientProvider
            {...walletConfig}
            network={STACKS_NETWORK}
            dehydratedState={pageProps?.dehydratedState}
            onPersistState={onPersistState}
            onSignOut={onSignOut}
        >
            <AppWithAutoRegister Component={Component} pageProps={pageProps} />
        </ClientProvider>
    );
}
