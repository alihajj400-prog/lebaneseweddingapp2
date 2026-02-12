import { cn } from '@/lib/utils';

interface LebaneseFlagHeartProps {
  className?: string;
  size?: number;
}

export function LebaneseFlagHeart({ className, size = 24 }: LebaneseFlagHeartProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
    >
      <defs>
        {/* Lebanese flag gradient - horizontal stripes */}
        <clipPath id="heartClip">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </clipPath>
      </defs>
      
      {/* Heart with Lebanese flag colors */}
      <g clipPath="url(#heartClip)">
        {/* Top red stripe */}
        <rect x="0" y="0" width="24" height="8" fill="#EE161F" />
        {/* Middle white stripe */}
        <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />
        {/* Bottom red stripe */}
        <rect x="0" y="16" width="24" height="8" fill="#EE161F" />
        
        {/* Cedar tree silhouette in the center */}
        <g transform="translate(12, 12) scale(0.35)">
          {/* Trunk */}
          <rect x="-1.5" y="6" width="3" height="6" fill="#00A650" />
          {/* Tree layers - stylized cedar */}
          <path d="M0 -12 L-4 -4 L-2 -4 L-6 2 L-3 2 L-8 10 L8 10 L3 2 L6 2 L2 -4 L4 -4 Z" fill="#00A650" />
        </g>
      </g>
      
      {/* Heart outline for definition */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="hsl(var(--primary))"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}
