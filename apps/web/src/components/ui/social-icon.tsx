import React from 'react';
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandXing,
} from '@tabler/icons-react';
import type { SocialProfileKey } from '@/lib/social-profiles';

interface SocialIconProps {
  profile: SocialProfileKey;
  className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({ profile, className }) => {
  const commonProps = {
    className,
    size: 18,
    stroke: 1.75,
    'aria-hidden': true as const,
  };

  switch (profile) {
    case 'xing':
      return <IconBrandXing {...commonProps} />;
    case 'linkedin':
      return <IconBrandLinkedin {...commonProps} />;
    case 'github':
      return <IconBrandGithub {...commonProps} />;
    default:
      return null;
  }
};
