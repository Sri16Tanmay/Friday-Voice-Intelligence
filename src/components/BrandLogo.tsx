import React, { useId } from 'react';

export type BrandLogoVariant = 'official' | 'compact' | 'full' | 'mark';
export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  showWordmark?: boolean;
  showSubtitle?: boolean;
  accessibleLabel?: string;
  onDark?: boolean;
}

/**
 * Official FRIDAY Master Emblem.
 * The authoritative, definitive brand asset faithfully embodying:
 * - Circular champagne gold medallion with outer fine rings and cardinal stars
 * - Deep Imperial Emerald jewel disc providing pristine contrast on both light and dark canvas
 * - Symmetrical left and right audio waveform indicators
 * - Serene AI female profile silhouette in porcelain ivory with circular gold earpiece
 * - Flowing emerald and gold hair ribbons forming the iconic stylized 'F'
 * - High-contrast metallic and jewel vectors ensuring razor-sharp clarity at any scale
 */
export const OfficialFridayLogo: React.FC<{
  className?: string;
  sizeClass?: string;
  title?: string;
  variant?: 'mark' | 'official';
}> = ({
  className = '',
  sizeClass = 'w-[52px] h-[52px]',
  title = 'FRIDAY — AI Speech Intelligence',
  variant = 'mark',
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

  return (
    <svg
      viewBox="0 0 512 512"
      className={`${sizeClass} ${className} shrink-0 aspect-square select-none transition-transform duration-200 group-hover:scale-[1.03]`}
      aria-label={title}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Champagne Gold Gradients */}
        <linearGradient id={`goldGrad_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7E7C4" />
          <stop offset="25%" stopColor="#DDB86C" />
          <stop offset="50%" stopColor="#B38938" />
          <stop offset="75%" stopColor="#ECCF8E" />
          <stop offset="100%" stopColor="#966F24" />
        </linearGradient>

        <linearGradient id={`goldLight_${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A662" />
          <stop offset="50%" stopColor="#FFF2D6" />
          <stop offset="100%" stopColor="#B38938" />
        </linearGradient>

        {/* Deep Imperial Emerald Jewel Disc Gradient */}
        <radialGradient id={`emeraldDisc_${id}`} cx="48%" cy="46%" r="56%">
          <stop offset="0%" stopColor="#0E4A35" />
          <stop offset="45%" stopColor="#093828" />
          <stop offset="78%" stopColor="#05271C" />
          <stop offset="100%" stopColor="#031811" />
        </radialGradient>

        <linearGradient id={`emeraldRibbon_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#287355" />
          <stop offset="50%" stopColor="#144C37" />
          <stop offset="100%" stopColor="#09281D" />
        </linearGradient>

        <linearGradient id={`emeraldHighlight_${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3FA27B" />
          <stop offset="60%" stopColor="#1B5D44" />
          <stop offset="100%" stopColor="#0D3526" />
        </linearGradient>

        {/* Delicate Elevation Shadows */}
        <filter id={`softShadow_${id}`} x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="1.5" dy="3.5" stdDeviation="3" floodColor="#020E09" floodOpacity="0.45" />
        </filter>
        <filter id={`glowGold_${id}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#ECCF8E" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Medallion Bezel & Disc (Clear, high-contrast jewel on all backgrounds) */}
      <circle cx="256" cy="256" r="236" fill={`url(#goldGrad_${id})`} stroke="#634A1A" strokeWidth="2.5" />
      <circle cx="256" cy="256" r="226" fill={`url(#emeraldDisc_${id})`} stroke={`url(#goldLight_${id})`} strokeWidth="3" />
      <circle cx="256" cy="256" r="218" fill="none" stroke={`url(#goldGrad_${id})`} strokeWidth="1.2" opacity="0.65" />

      {/* Cardinal Four-Pointed Star Accents */}
      {/* Top Star */}
      <g transform="translate(256, 30)">
        <path d="M 0 -15 Q 2 -3.5 15 0 Q 2 3.5 0 15 Q -2 3.5 -15 0 Q -2 -3.5 0 -15 Z" fill={`url(#goldGrad_${id})`} stroke="#5E4314" strokeWidth="0.6" />
        <path d="M 0 -11 Q 1 -2 11 0 Q 1 2 0 11 Q -1 2 -11 0 Q -1 -2 0 -11 Z" fill={`url(#emeraldHighlight_${id})`} />
        <circle cx="0" cy="0" r="1.8" fill="#FFF8EB" />
      </g>

      {/* Bottom Star */}
      <g transform="translate(256, 482)">
        <path d="M 0 -15 Q 2 -3.5 15 0 Q 2 3.5 0 15 Q -2 3.5 -15 0 Q -2 -3.5 0 -15 Z" fill={`url(#goldGrad_${id})`} stroke="#5E4314" strokeWidth="0.6" />
        <path d="M 0 -11 Q 1 -2 11 0 Q 1 2 0 11 Q -1 2 -11 0 Q -1 -2 0 -11 Z" fill={`url(#emeraldHighlight_${id})`} />
        <circle cx="0" cy="0" r="1.8" fill="#FFF8EB" />
      </g>

      {/* Cardinal Left/Right Gold Studs */}
      <circle cx="30" cy="256" r="3.8" fill={`url(#goldLight_${id})`} stroke="#634A1A" strokeWidth="0.6" />
      <circle cx="482" cy="256" r="3.8" fill={`url(#goldLight_${id})`} stroke="#634A1A" strokeWidth="0.6" />

      {/* Center Artwork Group (Shifted for optimal medallion centering) */}
      <g transform={variant === 'mark' ? 'translate(0, 16)' : 'translate(0, 0)'}>
        {/* Left Waveform Audio Indicators */}
        <g filter={`url(#softShadow_${id})`}>
          <circle cx="68" cy="235" r="3.6" fill={`url(#goldGrad_${id})`} />
          <rect x="80" y="221" width="7" height="28" rx="3.5" fill={`url(#goldGrad_${id})`} />
          <rect x="94" y="205" width="7.5" height="60" rx="3.7" fill={`url(#emeraldHighlight_${id})`} stroke={`url(#goldLight_${id})`} strokeWidth="0.6" />
          <rect x="109" y="187" width="8" height="96" rx="4" fill={`url(#goldGrad_${id})`} />
          <rect x="124" y="175" width="8.5" height="120" rx="4.2" fill={`url(#emeraldHighlight_${id})`} stroke={`url(#goldLight_${id})`} strokeWidth="0.8" />
          <rect x="140" y="195" width="8" height="80" rx="4" fill={`url(#goldGrad_${id})`} />
          <circle cx="157" cy="235" r="3.6" fill={`url(#goldLight_${id})`} />
        </g>

        {/* Right Waveform Audio Indicators */}
        <g filter={`url(#softShadow_${id})`}>
          <circle cx="355" cy="235" r="3.6" fill={`url(#goldLight_${id})`} />
          <rect x="365" y="195" width="8" height="80" rx="4" fill={`url(#goldGrad_${id})`} />
          <rect x="380" y="175" width="8.5" height="120" rx="4.2" fill={`url(#emeraldHighlight_${id})`} stroke={`url(#goldLight_${id})`} strokeWidth="0.8" />
          <rect x="395" y="187" width="8" height="96" rx="4" fill={`url(#goldGrad_${id})`} />
          <rect x="410" y="205" width="7.5" height="60" rx="3.7" fill={`url(#emeraldHighlight_${id})`} stroke={`url(#goldLight_${id})`} strokeWidth="0.6" />
          <rect x="424" y="221" width="7" height="28" rx="3.5" fill={`url(#goldGrad_${id})`} />
          <circle cx="444" cy="235" r="3.6" fill={`url(#goldGrad_${id})`} />
        </g>

        {/* Centerpiece: 'F' Structure & AI Silhouette */}
        <g filter={`url(#softShadow_${id})`}>
          {/* Top Bar of 'F' */}
          <path
            d="M 166 94 C 180 84 212 80 260 80 L 366 80 C 374 80 376 86 371 93 C 362 106 350 124 336 142 L 290 142 C 298 126 312 110 328 102 L 244 102 C 218 102 195 110 180 124 Z"
            fill={`url(#goldGrad_${id})`}
            stroke="#5E4314"
            strokeWidth="0.8"
          />
          <path
            d="M 170 91 C 184 82 214 78 260 78 L 368 78 C 376 78 376 84 371 90 C 360 102 348 120 334 138 L 294 138 C 304 122 318 106 332 98 L 246 98 C 216 98 194 106 178 120 Z"
            fill={`url(#emeraldRibbon_${id})`}
            stroke={`url(#goldLight_${id})`}
            strokeWidth="1.2"
          />

          {/* Ribbons Forming F Stem and Curves */}
          <path
            d="M 168 92 C 196 100 240 124 252 170 C 238 180 206 200 190 236 C 176 268 180 286 166 300 C 146 270 148 220 170 168 C 182 140 178 116 168 92 Z"
            fill={`url(#emeraldRibbon_${id})`}
            stroke={`url(#goldLight_${id})`}
            strokeWidth="0.8"
          />
          <path
            d="M 194 88 C 214 100 248 128 256 168 C 248 174 224 196 210 230 C 198 258 202 278 190 292 C 178 268 178 234 192 198 C 206 164 204 128 194 88 Z"
            fill={`url(#goldGrad_${id})`}
            stroke="#876625"
            strokeWidth="1"
          />
          <path
            d="M 218 84 C 236 104 262 136 268 176 C 262 182 242 208 230 240 C 218 272 224 290 216 304 C 206 280 206 244 220 208 C 232 176 230 134 218 84 Z"
            fill={`url(#emeraldHighlight_${id})`}
            stroke={`url(#goldLight_${id})`}
            strokeWidth="0.8"
          />
          <path
            d="M 238 82 C 254 104 278 140 280 180 C 274 186 256 214 246 246 C 236 278 240 296 234 310 C 224 286 226 250 238 214 C 250 182 248 134 238 82 Z"
            fill={`url(#goldLight_${id})`}
            stroke="#876625"
            strokeWidth="1"
          />

          {/* Lower Flourish Hair Sweeps */}
          <path
            d="M 144 296 C 160 284 196 276 238 286 C 276 296 312 284 346 256 C 362 244 366 252 352 266 C 320 298 280 314 234 306 C 190 298 162 304 144 316 Z"
            fill={`url(#goldGrad_${id})`}
            stroke="#5E4314"
            strokeWidth="0.6"
          />
          <path
            d="M 148 300 C 164 288 198 280 238 290 C 272 298 304 288 334 266 C 342 260 344 264 336 274 C 310 300 276 314 236 306 C 194 298 166 306 148 318 Z"
            fill={`url(#emeraldRibbon_${id})`}
            stroke={`url(#goldLight_${id})`}
            strokeWidth="0.8"
          />

          {/* AI Female Face Silhouette (Pristine Porcelain Ivory, High Contrast) */}
          <g id={`femaleFace_${id}`}>
            <path
              d="M 276 138 C 288 144 298 152 304 162 C 309 170 307 178 300 185 C 306 186 314 188 316 193 C 317 197 312 201 306 203 C 314 207 316 213 313 218 C 310 223 301 224 296 225 C 298 230 299 236 295 240 C 288 247 274 250 264 252 C 272 240 274 220 272 204 C 270 188 268 174 276 138 Z"
              fill="#FFFFFF"
              stroke={`url(#goldLight_${id})`}
              strokeWidth="1.2"
            />
            {/* Eyelash */}
            <path d="M 285 168 C 289 171 295 171 298 167" fill="none" stroke="#05261B" strokeWidth="2" strokeLinecap="round" />
            <path d="M 295 168 L 298 166" fill="none" stroke="#05261B" strokeWidth="1.4" strokeLinecap="round" />
            {/* Lips */}
            <path d="M 304 208 C 307 208.5 311 208.5 313 207" fill="none" stroke="#B38938" strokeWidth="1.4" strokeLinecap="round" />
          </g>

          {/* Concentric Gold Earpiece */}
          <g transform="translate(256, 190)" filter={`url(#glowGold_${id})`}>
            <circle cx="0" cy="0" r="23" fill={`url(#goldGrad_${id})`} stroke="#634A1A" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="19" fill={`url(#emeraldDisc_${id})`} />
            <circle cx="0" cy="0" r="15.5" fill="none" stroke={`url(#goldLight_${id})`} strokeWidth="1.6" />
            <path d="M 0 -10 Q 1.5 -2.5 10 0 Q 1.5 2.5 0 10 Q -1.5 2.5 -10 0 Q -1.5 -2.5 0 -10 Z" fill={`url(#goldLight_${id})`} />
            <circle cx="0" cy="0" r="2.4" fill="#FFFFFF" />
          </g>
        </g>

        {/* Lower Medallion Curve Balance (For mark variant) */}
        {variant === 'mark' && (
          <path
            d="M 170 350 C 205 374 235 378 265 360 C 295 342 325 350 342 362"
            fill="none"
            stroke={`url(#goldGrad_${id})`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* Grand Wordmark & Subtitle ONLY if rendered in standalone 'official' variant */}
      {variant === 'official' && (
        <>
          <g filter={`url(#softShadow_${id})`} transform="translate(0, 30)">
            <text
              x="256"
              y="360"
              textAnchor="middle"
              fontFamily="'Fraunces', 'Bodoni Moda', Georgia, serif"
              fontSize="74"
              fontWeight="700"
              letterSpacing="5"
              fill={`url(#goldLight_${id})`}
              stroke={`url(#emeraldDisc_${id})`}
              strokeWidth="1.6"
              paintOrder="stroke fill"
            >
              FRIDAY
            </text>

            <g transform="translate(262, 300)">
              <path d="M 0 -7 Q 1 -1.5 7 0 Q 1 1.5 0 7 Q -1 1.5 -7 0 Q -1 -1.5 0 -7 Z" fill={`url(#goldLight_${id})`} />
              <circle cx="0" cy="0" r="1.4" fill="#FFFFFF" />
            </g>

            <path
              d="M 108 344 C 130 334 160 338 180 354 C 205 372 235 376 265 358 C 295 340 335 334 365 352 C 385 364 402 360 414 348"
              fill="none"
              stroke={`url(#goldGrad_${id})`}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>

          <g transform="translate(0, 32)">
            <line x1="112" y1="416" x2="168" y2="416" stroke={`url(#goldGrad_${id})`} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="170" cy="416" r="2" fill={`url(#goldGrad_${id})`} />
            <text
              x="256"
              y="420"
              textAnchor="middle"
              fontFamily="'Manrope', -apple-system, sans-serif"
              fontSize="12"
              fontWeight="700"
              letterSpacing="5.5"
              fill={`url(#goldLight_${id})`}
            >
              AI SPEECH INTELLIGENCE
            </text>
            <circle cx="342" cy="416" r="2" fill={`url(#goldGrad_${id})`} />
            <line x1="344" y1="416" x2="400" y2="416" stroke={`url(#goldGrad_${id})`} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </>
      )}
    </svg>
  );
};

export const FridayEmblemMark = OfficialFridayLogo;

/**
 * Universal BrandLogo Component.
 * Acts as the project-wide single source of truth for the official FRIDAY brand identity.
 *
 * Guarantees pristine legibility and royal aesthetics across all themes:
 * - Crisp, high-contrast deep Imperial Emerald & Antique Gold on light surfaces
 * - Luminous Royal Ivory & Champagne Gold on dark surfaces
 * - Unmistakably clear "Friday" display serif typography
 * - Prominent, crisp "AI SPEECH INTELLIGENCE" uppercase slogan
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = false,
  showSubtitle = true,
  accessibleLabel = 'FRIDAY — AI Speech Intelligence',
  onDark = false,
}) => {
  const sizeClasses: Record<BrandLogoSize, string> = {
    xs: 'w-[32px] h-[32px]',
    sm: 'w-[42px] h-[42px] sm:w-[46px] sm:h-[46px]',
    md: 'w-[50px] h-[50px] sm:w-[54px] sm:h-[54px]',
    lg: 'w-[72px] h-[72px]',
    xl: 'w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]',
  };

  const wordmarkSizes: Record<BrandLogoSize, { title: string; subtitle: string; gap: string; dot: string }> = {
    xs: { title: 'text-base font-bold', subtitle: 'text-[8px] tracking-[0.2em]', gap: 'gap-2', dot: 'w-1 h-1' },
    sm: { title: 'text-lg sm:text-xl font-bold', subtitle: 'text-[9px] sm:text-[9.5px] tracking-[0.22em]', gap: 'gap-2.5 sm:gap-3', dot: 'w-1.5 h-1.5' },
    md: { title: 'text-xl sm:text-2xl font-bold', subtitle: 'text-[10px] sm:text-[10.5px] tracking-[0.24em]', gap: 'gap-3 sm:gap-3.5', dot: 'w-2 h-2' },
    lg: { title: 'text-2xl sm:text-3xl font-bold', subtitle: 'text-[11.5px] tracking-[0.26em]', gap: 'gap-3.5 sm:gap-4', dot: 'w-2 h-2' },
    xl: { title: 'text-4xl sm:text-5xl font-bold', subtitle: 'text-xs sm:text-sm tracking-[0.28em]', gap: 'gap-4 sm:gap-5', dot: 'w-2.5 h-2.5' },
  };

  const textConfig = wordmarkSizes[size];

  if (!showWordmark) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 group select-none ${className}`}
        aria-label={accessibleLabel}
        role="img"
      >
        <OfficialFridayLogo sizeClass={sizeClasses[size]} title={accessibleLabel} variant="mark" />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${textConfig.gap} shrink-0 group select-none ${className}`}
      aria-label={accessibleLabel}
      role="img"
    >
      <OfficialFridayLogo sizeClass={sizeClasses[size]} title={accessibleLabel} variant="mark" />
      
      <div className="flex flex-col justify-center leading-none text-left">
        {/* Primary Name: "Friday" */}
        <div className="flex items-center gap-1.5">
          <span
            className={`font-serif tracking-tight font-bold transition-colors ${
              onDark
                ? 'text-[#FDFBF7] group-hover:text-[#F5E5C4]'
                : 'text-[#062D20] dark:text-[#FDFBF7] group-hover:text-[#0C4A36] dark:group-hover:text-[#F5E5C4]'
            } ${textConfig.title}`}
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Friday
          </span>
          <span
            className={`rounded-full shrink-0 shadow-xs ${textConfig.dot} ${
              onDark ? 'bg-[#DDB86C]' : 'bg-[#9E7A32] dark:bg-[#DDB86C]'
            }`}
          />
        </div>

        {/* Official Slogan: "AI SPEECH INTELLIGENCE" */}
        {showSubtitle && (
          <span
            className={`font-sans font-bold uppercase mt-1 transition-colors ${
              onDark
                ? 'text-[#DDB86C]'
                : 'text-[#7D5C1E] dark:text-[#DDB86C]'
            } ${textConfig.subtitle}`}
          >
            AI SPEECH INTELLIGENCE
          </span>
        )}
      </div>
    </div>
  );
};

export const BrandLockup: React.FC<{
  size?: BrandLogoSize;
  className?: string;
  showSubtitle?: boolean;
  onDark?: boolean;
}> = ({ size = 'md', className = '', showSubtitle = true, onDark = false }) => {
  return (
    <BrandLogo
      size={size}
      showWordmark={true}
      showSubtitle={showSubtitle}
      className={className}
      onDark={onDark}
    />
  );
};
