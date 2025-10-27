import { AppConfig, showConnect, type UserData, UserSession } from '@stacks/connect';
import { useEffect, useState, useMemo } from 'react';

export function useStacks() {
  // Initially when the user is not logged in, userData is null
  const [userData, setUserData] = useState<UserData | null>(null);

  // create application config that allows
  // storing authentication state in browser's local storage
  // useMemo ensures these are only created once
  const appConfig = useMemo(() => new AppConfig(['store_write']), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  function connectWallet() {
    showConnect({
      appDetails: {
        name: 'Stacken',
        icon: '/stacken.svg',
      },
      onFinish: () => {
        // reload the webpage when wallet connection succeeds
        // to ensure that the user session gets populated from local storage
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    // sign out the user and close their session
    // also clear out the user data
    userSession.signUserOut();
    setUserData(null);
  }

  // When the page first loads, if the user is already signed in,
  // set the userData
  // If the user has a pending sign-in instead, resume the sign-in flow
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        setUserData(userData);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Helper functions for compatibility with existing code
  const isSignedIn = !!userData;
  const stxAddress =
    userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;

  // return the user data, connect wallet function, and disconnect wallet function
  return {
    userData,
    connectWallet,
    disconnectWallet,
    isSignedIn,
    stxAddress,
    userSession,
  };
}
