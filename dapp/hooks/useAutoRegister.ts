import { useEffect } from 'react';
import { useAuth, useAccount } from '@micro-stacks/react';

export const useAutoRegister = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();

  useEffect(() => {
    const registerUser = async () => {
      if (!isSignedIn || !stxAddress) return;

      try {
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stacksAddress: stxAddress
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User registration:', data.message);
        } else {
          console.error('Failed to register user');
        }
      } catch (error) {
        console.error('Error during user registration:', error);
      }
    };

    // Register user when they connect wallet
    if (isSignedIn && stxAddress) {
      registerUser();
    }
  }, [isSignedIn, stxAddress]);
};

export default useAutoRegister;