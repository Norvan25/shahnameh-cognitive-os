import React from 'react';

interface Props {
  archetype: string;
  color: string;
  size?: number;
}

export function ArchetypeIcon({ archetype, color, size = 40 }: Props) {
  const icons: Record<string, React.ReactElement> = {
    // Awareness - Eye symbol
    'awareness-os': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="2" opacity="0.3"/>
        <ellipse cx="20" cy="20" rx="12" ry="8" stroke={color} strokeWidth="2"/>
        <circle cx="20" cy="20" r="4" fill={color}/>
        <circle cx="20" cy="20" r="1.5" fill="#0D1326"/>
      </svg>
    ),

    // Simorgh - Bird/Phoenix
    'simorgh': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M20 8 L8 24 L20 20 L32 24 Z" stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <path d="M20 20 L14 32 L20 28 L26 32 Z" stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <circle cx="20" cy="14" r="2" fill={color}/>
      </svg>
    ),

    // Rostam - Shield
    'rostam': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M20 6 L32 12 L32 22 C32 28 26 34 20 36 C14 34 8 28 8 22 L8 12 Z" 
          stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <path d="M20 14 L20 28" stroke={color} strokeWidth="2"/>
        <path d="M14 20 L26 20" stroke={color} strokeWidth="2"/>
      </svg>
    ),

    // Sohrab - Rising star
    'sohrab': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M20 6 L23 16 L34 16 L25 22 L28 32 L20 26 L12 32 L15 22 L6 16 L17 16 Z"
          stroke={color} strokeWidth="2" fill={`${color}30`}/>
      </svg>
    ),

    // Zahhak - Serpents
    'zahhak': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="6" stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <path d="M14 20 C10 16 6 18 4 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M26 20 C30 16 34 18 36 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="4" cy="14" r="2" fill={color}/>
        <circle cx="36" cy="14" r="2" fill={color}/>
      </svg>
    ),

    // Zal - Feather
    'zal': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M20 4 C20 4 28 12 28 24 C28 32 24 36 20 36 C16 36 12 32 12 24 C12 12 20 4 20 4"
          stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <path d="M20 8 L20 32" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),

    // Kaveh - Hammer
    'kaveh': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect x="16" y="6" width="8" height="12" rx="1" stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <rect x="18" y="18" width="4" height="16" stroke={color} strokeWidth="2" fill={`${color}30`}/>
        <path d="M10 34 L30 34" stroke={color} strokeWidth="2"/>
      </svg>
    ),

    // Fear - Eye with slash
    'div-sepid': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="20" rx="14" ry="10" stroke={color} strokeWidth="2" fill={`${color}20`}/>
        <circle cx="20" cy="20" r="5" stroke={color} strokeWidth="2"/>
        <path d="M8 32 L32 8" stroke={color} strokeWidth="2"/>
      </svg>
    ),

    // Afrasiab - Storm
    'afrasiab': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M8 20 Q14 8 20 20 Q26 32 32 20" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 28 Q14 16 20 28 Q26 40 32 28" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M8 12 Q14 0 20 12 Q26 24 32 12" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
      </svg>
    ),

    // Khvarenah - Crown/Halo
    'khvarenah': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="2" fill="none" opacity="0.3"/>
        <circle cx="20" cy="20" r="10" stroke={color} strokeWidth="2" fill={`${color}20`}/>
        <path d="M20 6 L22 14 L20 12 L18 14 Z" fill={color}/>
        <path d="M34 20 L26 22 L28 20 L26 18 Z" fill={color}/>
        <path d="M20 34 L18 26 L20 28 L22 26 Z" fill={color}/>
        <path d="M6 20 L14 18 L12 20 L14 22 Z" fill={color}/>
      </svg>
    ),

    // Esfandiyar - Armored eye
    'esfandiyar': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="2" fill={`${color}20`}/>
        <circle cx="20" cy="20" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="20" cy="20" r="2" fill={color}/>
      </svg>
    ),

    // Guilt/Siyavash - Fire
    'siyavash-wound': (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M20 36 C12 36 8 28 8 22 C8 16 12 12 16 8 C16 14 18 16 20 14 C22 16 24 14 24 8 C28 12 32 16 32 22 C32 28 28 36 20 36" 
          stroke={color} strokeWidth="2" fill={`${color}20`}/>
        <path d="M20 36 C16 36 14 30 14 26 C14 22 16 20 20 18 C24 20 26 22 26 26 C26 30 24 36 20 36" 
          fill={color} opacity="0.5"/>
      </svg>
    ),
  };

  // Default icon for kings
  const defaultKing = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M6 28 L10 12 L20 20 L30 12 L34 28 Z" stroke={color} strokeWidth="2" fill={`${color}30`}/>
      <circle cx="10" cy="12" r="2" fill={color}/>
      <circle cx="20" cy="8" r="2" fill={color}/>
      <circle cx="30" cy="12" r="2" fill={color}/>
      <rect x="6" y="28" width="28" height="6" rx="1" stroke={color} strokeWidth="2" fill={`${color}30`}/>
    </svg>
  );

  // Default icon for heroes
  const defaultHero = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="2" fill={`${color}20`}/>
      <circle cx="20" cy="20" r="6" fill={color} opacity="0.4"/>
    </svg>
  );

  // Default icon for shadows/saboteurs
  const defaultShadow = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 36,20 20,36 4,20" stroke={color} strokeWidth="2" fill={`${color}20`}/>
      <line x1="20" y1="12" x2="20" y2="28" stroke={color} strokeWidth="2" opacity="0.5"/>
    </svg>
  );

  if (icons[archetype]) {
    return icons[archetype];
  }

  // Return default based on naming patterns
  if (archetype.includes('king') || archetype.includes('kay') || archetype.includes('jamshid') || 
      archetype.includes('goshtasp') || archetype.includes('fereydun') || archetype.includes('manuchehr')) {
    return defaultKing;
  }
  
  if (archetype.includes('div') || archetype.includes('sudabeh') || archetype.includes('garsivaz') || 
      archetype.includes('piran') || archetype.includes('human')) {
    return defaultShadow;
  }

  return defaultHero;
}
