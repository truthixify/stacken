import { useState, useEffect } from 'react';

interface AllowedToken {
  _id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  logoUrl?: string;
}

export const useAllowedTokens = () => {
  const [tokens, setTokens] = useState<AllowedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllowedTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tokens/allowed');

        if (response.ok) {
          const data = await response.json();
          setTokens(data.tokens || []);
        } else {
          setError('Failed to fetch allowed tokens');
        }
      } catch (err) {
        console.error('Error fetching allowed tokens:', err);
        setError('Failed to fetch allowed tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchAllowedTokens();
  }, []);

  return { tokens, loading, error, refetch: () => setLoading(true) };
};
