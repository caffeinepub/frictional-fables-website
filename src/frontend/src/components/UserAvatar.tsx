import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ExternalBlob } from '../backend';

interface UserAvatarProps {
  name: string;
  profilePicture?: ExternalBlob;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ name, profilePicture, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const imageUrl = profilePicture?.getDirectURL();

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitial(name)}
      </AvatarFallback>
    </Avatar>
  );
}
