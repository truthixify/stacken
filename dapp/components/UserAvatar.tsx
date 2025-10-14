import React from 'react';
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  userAddress: string;
  avatar?: string;
  displayName?: string;
  size?: number;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  userAddress,
  avatar,
  displayName,
  size = 32,
  className = '',
}) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName || 'User avatar'}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Generate consistent avatar based on address
  return (
    <Avatar
      size={size}
      name={userAddress || displayName || 'anon'}
      variant="beam"
      colors={['#EA580C', '#FDBA74', '#F97316', '#FB923C', '#FED7AA']}
      className={className}
    />
  );
};

export default UserAvatar;
