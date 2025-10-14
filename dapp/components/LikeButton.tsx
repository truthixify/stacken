import React from 'react';
import { Heart } from 'lucide-react';
import { useLikes } from '../hooks/useLikes';

interface LikeButtonProps {
  targetType: 'MISSION' | 'SUBMISSION';
  targetId: string;
  className?: string;
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  className = '',
  showCount = true,
}) => {
  const { likeCount, userHasLiked, toggleLike, isToggling, loading } = useLikes(
    targetType,
    targetId
  );

  if (loading) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
        {showCount && <span className="text-sm text-gray-400">-</span>}
      </div>
    );
  }

  return (
    <button
      onClick={toggleLike}
      disabled={isToggling}
      className={`flex items-center space-x-1 transition-colors ${
        userHasLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <Heart
        size={20}
        className={`transition-all ${userHasLiked ? 'fill-current' : ''} ${
          isToggling ? 'scale-110' : ''
        }`}
      />
      {showCount && <span className="text-sm font-medium">{likeCount > 0 ? likeCount : ''}</span>}
    </button>
  );
};

export default LikeButton;
