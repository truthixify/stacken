import { useState, useEffect } from 'react';
import { useAuth, useAccount } from '@micro-stacks/react';

interface UserInfo {
  username?: string;
  displayName?: string;
  avatar?: string;
}

export const useUserInfo = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    if (!isSignedIn || !stxAddress) {
      setUserInfo(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${stxAddress}`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          username: data.user.username,
          displayName: data.user.displayName,
          avatar: data.user.avatar
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [isSignedIn, stxAddress]);

  const getDisplayName = () => {
    if (!userInfo || !stxAddress) return '';
    
    if (userInfo.displayName) return userInfo.displayName;
    if (userInfo.username) return `@${userInfo.username}`;
    
    // Fallback to truncated address
    return `${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}`;
  };

  return {
    userInfo,
    loading,
    displayName: getDisplayName(),
    refetch: fetchUserInfo
  };
};

export default useUserInfo;