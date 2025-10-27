import { useEffect, useRef, useState, useCallback } from 'react';
import { useStacks } from './useStacks';

export const useAutoRegister = () => {
  const { isSignedIn, stxAddress } = useStacks();
  const [status, setStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const attempted = useRef<Set<string>>(new Set());
  const retries = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const registerUser = useCallback(async (address: string, retryCount = 0) => {
    const maxRetries = 3;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);

    if (attempted.current.has(address)) return;

    try {
      setStatus('registering');
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stacksAddress: address }),
      });

      if (res.ok || res.status === 409) {
        console.log('User registration success');
        attempted.current.add(address);
        setStatus('success');
        return;
      }

      throw new Error(`Registration failed: ${res.status}`);
    } catch (err) {
      console.error('Auto-register error:', err);
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        const timeoutId = setTimeout(() => {
          retries.current.delete(address);
          registerUser(address, retryCount + 1);
        }, delay);
        retries.current.set(address, timeoutId);
      } else {
        setStatus('error');
        attempted.current.add(address);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn || !stxAddress?.trim()) return;
    if (!/^S[PT]/.test(stxAddress)) return;

    const timeout = setTimeout(() => registerUser(stxAddress.trim()), 300);
    return () => clearTimeout(timeout);
  }, [isSignedIn, stxAddress, registerUser]);

  useEffect(() => {
    return () => retries.current.forEach(clearTimeout);
  }, []);

  return { status, isRegistering: status === 'registering' };
};
