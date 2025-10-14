import { useState, useEffect } from 'react';
import { useAuth, useAccount } from '@micro-stacks/react';
import toast from 'react-hot-toast';

interface LikeData {
  likeCount: number;
  userHasLiked: boolean;
  loading: boolean;
}

export const useLikes = (targetType: 'CAMPAIGN' | 'SUBMISSION', targetId: string) => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [likeData, setLikeData] = useState<LikeData>({
    likeCount: 0,
    userHasLiked: false,
    loading: true,
  });
  const [toggling, setToggling] = useState(false);

  // Fetch like data
  useEffect(() => {
    const fetchLikes = async () => {
      if (!targetId) return;

      try {
        const params = new URLSearchParams({
          targetType,
          targetId,
        });

        if (stxAddress) {
          params.append('userAddress', stxAddress);
        }

        const response = await fetch(`/api/likes?${params}`);
        if (response.ok) {
          const data = await response.json();
          setLikeData({
            likeCount: data.likeCount,
            userHasLiked: data.userHasLiked,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
        setLikeData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchLikes();
  }, [targetType, targetId, stxAddress]);

  // Toggle like
  const toggleLike = async () => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Connect your wallet to like this');
      return;
    }

    if (toggling) return;

    setToggling(true);

    // Optimistic update
    const previousData = { ...likeData };
    setLikeData(prev => ({
      ...prev,
      userHasLiked: !prev.userHasLiked,
      likeCount: prev.userHasLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikeData(prev => ({
          ...prev,
          userHasLiked: data.liked,
          likeCount: data.likeCount,
        }));
      } else {
        // Revert optimistic update on error
        setLikeData(previousData);
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLikeData(previousData);
      toast.error('Something went wrong');
    } finally {
      setToggling(false);
    }
  };

  return {
    ...likeData,
    toggleLike,
    isToggling: toggling,
  };
};
