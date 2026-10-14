import React from 'react';
import { BrandLogo, BrandLogoProps, BrandLogoSize, BrandLogoVariant } from './BrandLogo';

export interface FridayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs';
  variant?: BrandLogoVariant;
  showSubtitle?: boolean;
}

/**
 * FridayLogo compatibility wrapper delegating to the official BrandLogo component.
 * Ensures project-wide unified single source of truth for the FRIDAY brand emblem.
 */
export const FridayLogo: React.FC<FridayLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'compact',
  showSubtitle = true,
}) => {
  return (
    <BrandLogo
      variant={variant}
      size={size as BrandLogoSize}
      className={className}
      showSubtitle={showSubtitle}
    />
  );
};

export { BrandLogo };
