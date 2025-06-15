'use client';

import React from 'react';

export interface LogoProps {
  businessName: string;
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  style: 'modern' | 'elegant' | 'luxury' | 'professional' | 'premium';
  size?: number;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Logos SVG génératifs pour chaque secteur
export const LogoGenerator = {
  // RESTAURANT LOGOS
  restaurant: {
    modern: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="restaurantModern" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#8B4513'} />
            <stop offset="100%" stopColor={colors?.secondary || '#D2691E'} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle cx="60" cy="60" r="55" fill="url(#restaurantModern)" opacity="0.1" />
        
        {/* Main logo - Fork & Knife */}
        <g transform="translate(60,60)" filter="url(#glow)">
          {/* Fork */}
          <path d="M-15,-25 L-15,25 M-20,-20 L-20,-10 M-15,-20 L-15,-10 M-10,-20 L-10,-10" 
                stroke={colors?.primary || '#8B4513'} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          
          {/* Knife */}
          <path d="M10,-25 L10,25 M5,-20 L15,-15 L15,-25 L5,-25 Z" 
                stroke={colors?.primary || '#8B4513'} strokeWidth="2.5" fill={colors?.secondary || '#D2691E'} strokeLinecap="round"/>
          
          {/* Plate */}
          <ellipse cx="0" cy="30" rx="25" ry="4" fill={colors?.accent || '#F4A460'} opacity="0.7"/>
        </g>
        
        {/* Business name */}
        <text x="60" y="100" textAnchor="middle" className="text-xs font-bold" fill={colors?.primary || '#8B4513'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    ),

    elegant: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="restaurantElegant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#2C3E50'} />
            <stop offset="100%" stopColor={colors?.secondary || '#E74C3C'} />
          </linearGradient>
        </defs>
        
        {/* Ornate frame */}
        <rect x="10" y="10" width="100" height="100" rx="20" fill="none" 
              stroke="url(#restaurantElegant)" strokeWidth="2" opacity="0.3"/>
        
        {/* Chef hat */}
        <g transform="translate(60,45)">
          <path d="M-20,0 Q-20,-15 -10,-20 Q0,-25 10,-20 Q20,-15 20,0 Q20,10 15,15 L-15,15 Q-20,10 -20,0 Z" 
                fill={colors?.primary || '#2C3E50'} opacity="0.9"/>
          <rect x="-18" y="10" width="36" height="8" fill={colors?.secondary || '#E74C3C'}/>
          
          {/* Chef hat details */}
          <circle cx="-8" cy="-5" r="2" fill="white" opacity="0.8"/>
          <circle cx="8" cy="-8" r="2" fill="white" opacity="0.8"/>
          <circle cx="0" cy="-12" r="2" fill="white" opacity="0.8"/>
        </g>
        
        <text x="60" y="95" textAnchor="middle" className="text-xs font-serif font-bold" fill={colors?.primary || '#2C3E50'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    ),

    luxury: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-xl">
        <defs>
          <radialGradient id="restaurantLuxury" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors?.accent || '#F39C12'} />
            <stop offset="100%" stopColor={colors?.primary || '#1A1A1A'} />
          </radialGradient>
        </defs>
        
        {/* Luxury emblem */}
        <circle cx="60" cy="60" r="50" fill="url(#restaurantLuxury)" opacity="0.2"/>
        
        {/* Wine glass & cutlery */}
        <g transform="translate(60,60)">
          {/* Wine glass */}
          <path d="M-10,-20 Q-10,-25 -5,-25 L5,-25 Q10,-25 10,-20 L10,-10 Q10,-5 5,-5 L-5,-5 Q-10,-5 -10,-10 Z" 
                fill={colors?.primary || '#1A1A1A'}/>
          <rect x="-1" y="-5" width="2" height="15" fill={colors?.primary || '#1A1A1A'}/>
          <ellipse cx="0" cy="12" rx="8" ry="2" fill={colors?.primary || '#1A1A1A'}/>
          
          {/* Crown */}
          <path d="M-15,-30 L-10,-25 L-5,-28 L0,-25 L5,-28 L10,-25 L15,-30 L15,-22 L-15,-22 Z" 
                fill={colors?.accent || '#D4AF37'} stroke={colors?.primary || '#1A1A1A'} strokeWidth="1"/>
          
          {/* Diamonds */}
          <circle cx="-8" cy="-26" r="1.5" fill={colors?.accent || '#D4AF37'}/>
          <circle cx="0" cy="-26" r="1.5" fill={colors?.accent || '#D4AF37'}/>
          <circle cx="8" cy="-26" r="1.5" fill={colors?.accent || '#D4AF37'}/>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-serif font-bold tracking-wide" fill={colors?.primary || '#1A1A1A'}>
          {businessName.slice(0, 10)}
        </text>
      </svg>
    )
  },

  // BEAUTE LOGOS
  beaute: {
    modern: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="beauteModern" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#FF69B4'} />
            <stop offset="100%" stopColor={colors?.secondary || '#FFB6C1'} />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <circle cx="60" cy="60" r="50" fill="url(#beauteModern)" opacity="0.1"/>
        
        {/* Beauty icon - Lipstick & Mirror */}
        <g transform="translate(60,60)">
          {/* Mirror */}
          <circle cx="-15" cy="0" r="12" fill="none" stroke={colors?.primary || '#FF69B4'} strokeWidth="2"/>
          <circle cx="-15" cy="0" r="8" fill={colors?.secondary || '#FFB6C1'} opacity="0.3"/>
          <line x1="-15" y1="12" x2="-15" y2="20" stroke={colors?.primary || '#FF69B4'} strokeWidth="2"/>
          <ellipse cx="-15" cy="22" rx="3" ry="1" fill={colors?.primary || '#FF69B4'}/>
          
          {/* Lipstick */}
          <rect x="10" y="-15" width="6" height="20" rx="3" fill={colors?.primary || '#FF69B4'}/>
          <ellipse cx="13" cy="-17" rx="3" ry="2" fill={colors?.accent || '#C71585'}/>
          <rect x="11" y="5" width="4" height="12" fill={colors?.secondary || '#FFB6C1'}/>
          
          {/* Sparkles */}
          <g opacity="0.8">
            <path d="M5,-25 L6,-23 L5,-21 L4,-23 Z" fill={colors?.accent || '#C71585'}/>
            <path d="M-25,-10 L-23,-11 L-21,-10 L-23,-9 Z" fill={colors?.accent || '#C71585'}/>
            <path d="M20,10 L21,12 L20,14 L19,12 Z" fill={colors?.accent || '#C71585'}/>
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-bold" fill={colors?.primary || '#FF69B4'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    ),

    luxury: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-xl">
        <defs>
          <radialGradient id="beauteLuxury">
            <stop offset="0%" stopColor={colors?.secondary || '#DDA0DD'} />
            <stop offset="100%" stopColor={colors?.primary || '#E6E6FA'} />
          </radialGradient>
        </defs>
        
        {/* Ornate frame */}
        <circle cx="60" cy="60" r="45" fill="none" stroke={colors?.accent || '#9370DB'} strokeWidth="1" opacity="0.5"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke={colors?.accent || '#9370DB'} strokeWidth="1" opacity="0.3"/>
        
        {/* Luxury beauty symbol */}
        <g transform="translate(60,60)">
          {/* Diamond */}
          <path d="M0,-20 L-10,-10 L-8,0 L0,10 L8,0 L10,-10 Z" 
                fill="url(#beauteLuxury)" stroke={colors?.accent || '#9370DB'} strokeWidth="1"/>
          
          {/* Inner diamond details */}
          <path d="M0,-15 L-6,-8 L0,5 L6,-8 Z" fill={colors?.accent || '#9370DB'} opacity="0.3"/>
          
          {/* Decorative elements */}
          <circle cx="-20" cy="-5" r="2" fill={colors?.accent || '#9370DB'} opacity="0.6"/>
          <circle cx="20" cy="-5" r="2" fill={colors?.accent || '#9370DB'} opacity="0.6"/>
          <circle cx="0" cy="20" r="2" fill={colors?.accent || '#9370DB'} opacity="0.6"/>
          
          {/* Elegant curves */}
          <path d="M-15,-15 Q0,-5 15,-15" stroke={colors?.accent || '#9370DB'} strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M-15,15 Q0,5 15,15" stroke={colors?.accent || '#9370DB'} strokeWidth="1" fill="none" opacity="0.5"/>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-serif font-bold tracking-widest" fill={colors?.accent || '#9370DB'}>
          {businessName.slice(0, 10)}
        </text>
      </svg>
    ),

    elegant: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="beauteElegant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#8B4513'} />
            <stop offset="100%" stopColor={colors?.secondary || '#CD853F'} />
          </linearGradient>
        </defs>
        
        {/* Vintage frame */}
        <rect x="15" y="15" width="90" height="90" rx="45" fill="none" 
              stroke="url(#beauteElegant)" strokeWidth="2" opacity="0.3"/>
        
        {/* Scissors & Comb */}
        <g transform="translate(60,60)">
          {/* Vintage scissors */}
          <g transform="rotate(-20)">
            <circle cx="-8" cy="-10" r="3" fill="none" stroke={colors?.primary || '#8B4513'} strokeWidth="2"/>
            <circle cx="-8" cy="10" r="3" fill="none" stroke={colors?.primary || '#8B4513'} strokeWidth="2"/>
            <line x1="-8" y1="-7" x2="8" y2="7" stroke={colors?.primary || '#8B4513'} strokeWidth="2"/>
            <line x1="-8" y1="7" x2="8" y2="-7" stroke={colors?.primary || '#8B4513'} strokeWidth="2"/>
          </g>
          
          {/* Vintage comb */}
          <g transform="rotate(20)">
            <rect x="5" y="-15" width="2" height="30" fill={colors?.secondary || '#CD853F'}/>
            <rect x="8" y="-10" width="1" height="6" fill={colors?.secondary || '#CD853F'}/>
            <rect x="10" y="-10" width="1" height="6" fill={colors?.secondary || '#CD853F'}/>
            <rect x="12" y="-10" width="1" height="6" fill={colors?.secondary || '#CD853F'}/>
            <rect x="14" y="-10" width="1" height="6" fill={colors?.secondary || '#CD853F'}/>
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-serif" fill={colors?.primary || '#8B4513'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    )
  },

  // ARTISAN LOGOS
  artisan: {
    professional: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="artisanPro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#8B4513'} />
            <stop offset="100%" stopColor={colors?.secondary || '#D2691E'} />
          </linearGradient>
        </defs>
        
        {/* Background hex */}
        <path d="M60,10 L90,30 L90,70 L60,90 L30,70 L30,30 Z" 
              fill="url(#artisanPro)" opacity="0.1" stroke={colors?.primary || '#8B4513'} strokeWidth="1"/>
        
        {/* Tools */}
        <g transform="translate(60,60)">
          {/* Hammer */}
          <rect x="-20" y="-3" width="15" height="6" rx="3" fill={colors?.primary || '#8B4513'}/>
          <rect x="-8" y="-15" width="3" height="30" fill={colors?.secondary || '#D2691E'}/>
          
          {/* Wrench */}
          <g transform="rotate(45)">
            <rect x="5" y="-2" width="20" height="4" rx="2" fill={colors?.accent || '#228B22'}/>
            <circle cx="23" cy="0" r="4" fill="none" stroke={colors?.accent || '#228B22'} strokeWidth="2"/>
            <rect x="8" y="-1" width="2" height="2" fill={colors?.accent || '#228B22'}/>
          </g>
          
          {/* Gear */}
          <g opacity="0.7">
            <circle cx="15" cy="15" r="8" fill="none" stroke={colors?.primary || '#8B4513'} strokeWidth="2"/>
            <circle cx="15" cy="15" r="4" fill={colors?.secondary || '#D2691E'}/>
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect key={i} x="13" y="6" width="4" height="3" rx="1" 
                    fill={colors?.primary || '#8B4513'}
                    transform={`rotate(${angle} 15 15)`}/>
            ))}
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-bold uppercase tracking-wide" fill={colors?.primary || '#8B4513'}>
          {businessName.slice(0, 10)}
        </text>
      </svg>
    ),

    modern: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="artisanModern" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#2F4F4F'} />
            <stop offset="100%" stopColor={colors?.secondary || '#708090'} />
          </linearGradient>
        </defs>
        
        {/* Modern geometric background */}
        <polygon points="60,15 95,37.5 95,82.5 60,105 25,82.5 25,37.5" 
                 fill="url(#artisanModern)" opacity="0.1"/>
        
        {/* Forge & Anvil */}
        <g transform="translate(60,60)">
          {/* Anvil */}
          <rect x="-15" y="-5" width="30" height="8" rx="2" fill={colors?.primary || '#2F4F4F'}/>
          <rect x="-12" y="3" width="24" height="4" fill={colors?.primary || '#2F4F4F'}/>
          <rect x="-3" y="7" width="6" height="8" fill={colors?.secondary || '#708090'}/>
          
          {/* Hammer hitting */}
          <g transform="rotate(-30) translate(0,-15)">
            <rect x="-10" y="-2" width="8" height="4" rx="2" fill={colors?.accent || '#B22222'}/>
            <rect x="-5" y="2" width="2" height="12" fill={colors?.secondary || '#708090'}/>
          </g>
          
          {/* Sparks */}
          <g opacity="0.8">
            <circle cx="5" cy="-10" r="1" fill={colors?.accent || '#B22222'}/>
            <circle cx="-8" cy="-8" r="1" fill={colors?.accent || '#B22222'}/>
            <circle cx="12" cy="-5" r="1" fill={colors?.accent || '#B22222'}/>
            <circle cx="-10" cy="-12" r="1" fill={colors?.accent || '#B22222'}/>
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-bold" fill={colors?.primary || '#2F4F4F'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    ),

    elegant: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="artisanElegant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#8B008B'} />
            <stop offset="100%" stopColor={colors?.secondary || '#DDA0DD'} />
          </linearGradient>
        </defs>
        
        {/* Elegant frame */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#artisanElegant)" strokeWidth="2" opacity="0.3"/>
        <circle cx="60" cy="60" r="40" fill="none" stroke="url(#artisanElegant)" strokeWidth="1" opacity="0.5"/>
        
        {/* Fabric & Needle */}
        <g transform="translate(60,60)">
          {/* Fabric pattern */}
          <path d="M-20,-20 Q-10,-15 0,-20 Q10,-15 20,-20 Q15,-10 20,0 Q15,10 20,20 Q10,15 0,20 Q-10,15 -20,20 Q-15,10 -20,0 Q-15,-10 -20,-20 Z" 
                fill="url(#artisanElegant)" opacity="0.2"/>
          
          {/* Needle */}
          <line x1="-15" y1="-15" x2="15" y2="15" stroke={colors?.primary || '#8B008B'} strokeWidth="2"/>
          <circle cx="-13" cy="-13" r="2" fill="none" stroke={colors?.primary || '#8B008B'} strokeWidth="1"/>
          
          {/* Thread */}
          <path d="M-10,-10 Q0,-5 10,10" stroke={colors?.accent || '#FFD700'} strokeWidth="1.5" fill="none"/>
          <path d="M10,10 Q15,15 12,20" stroke={colors?.accent || '#FFD700'} strokeWidth="1.5" fill="none"/>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-serif font-bold" fill={colors?.primary || '#8B008B'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    )
  },

  // MEDICAL LOGOS
  medical: {
    professional: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="medicalPro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#008B8B'} />
            <stop offset="100%" stopColor={colors?.secondary || '#20B2AA'} />
          </linearGradient>
        </defs>
        
        {/* Medical cross background */}
        <circle cx="60" cy="60" r="45" fill="url(#medicalPro)" opacity="0.1"/>
        
        {/* Medical cross */}
        <g transform="translate(60,60)">
          <rect x="-4" y="-20" width="8" height="40" rx="2" fill={colors?.primary || '#008B8B'}/>
          <rect x="-20" y="-4" width="40" height="8" rx="2" fill={colors?.primary || '#008B8B'}/>
          
          {/* Stethoscope */}
          <g transform="translate(20,0)">
            <circle cx="0" cy="0" r="6" fill="none" stroke={colors?.secondary || '#20B2AA'} strokeWidth="2"/>
            <path d="M-6,0 Q-15,-10 -20,-20" stroke={colors?.secondary || '#20B2AA'} strokeWidth="2" fill="none"/>
            <path d="M6,0 Q15,-10 20,-20" stroke={colors?.secondary || '#20B2AA'} strokeWidth="2" fill="none"/>
            <circle cx="-20" cy="-20" r="3" fill={colors?.secondary || '#20B2AA'}/>
            <circle cx="20" cy="-20" r="3" fill={colors?.secondary || '#20B2AA'}/>
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-bold" fill={colors?.primary || '#008B8B'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    ),

    premium: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-xl">
        <defs>
          <radialGradient id="medicalPremium">
            <stop offset="0%" stopColor={colors?.secondary || '#87CEEB'} />
            <stop offset="100%" stopColor={colors?.primary || '#4169E1'} />
          </radialGradient>
        </defs>
        
        {/* Premium shield */}
        <path d="M60,10 L85,25 L85,60 Q85,75 60,90 Q35,75 35,60 L35,25 Z" 
              fill="url(#medicalPremium)" opacity="0.2" stroke={colors?.primary || '#4169E1'} strokeWidth="2"/>
        
        {/* Caduceus */}
        <g transform="translate(60,60)">
          {/* Central staff */}
          <rect x="-1" y="-25" width="2" height="40" fill={colors?.primary || '#4169E1'}/>
          
          {/* Wings */}
          <path d="M-10,-20 Q-15,-25 -20,-20 Q-15,-15 -10,-20" fill={colors?.accent || '#00BFFF'} opacity="0.8"/>
          <path d="M10,-20 Q15,-25 20,-20 Q15,-15 10,-20" fill={colors?.accent || '#00BFFF'} opacity="0.8"/>
          
          {/* Serpents */}
          <path d="M-8,-15 Q8,-10 -8,-5 Q8,0 -8,5 Q8,10 -8,15" 
                stroke={colors?.primary || '#4169E1'} strokeWidth="2" fill="none"/>
          <path d="M8,-15 Q-8,-10 8,-5 Q-8,0 8,5 Q-8,10 8,15" 
                stroke={colors?.primary || '#4169E1'} strokeWidth="2" fill="none"/>
          
          {/* Serpent heads */}
          <circle cx="-8" cy="-15" r="2" fill={colors?.primary || '#4169E1'}/>
          <circle cx="8" cy="-15" r="2" fill={colors?.primary || '#4169E1'}/>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-bold tracking-wide" fill={colors?.primary || '#4169E1'}>
          {businessName.slice(0, 10)}
        </text>
      </svg>
    ),

    elegant: ({ businessName, colors, size = 120 }: LogoProps) => (
      <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
        <defs>
          <linearGradient id="medicalElegant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors?.primary || '#9370DB'} />
            <stop offset="100%" stopColor={colors?.secondary || '#DDA0DD'} />
          </radialGradient>
        </defs>
        
        {/* Elegant circular frame */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#medicalElegant)" strokeWidth="2" opacity="0.3"/>
        <circle cx="60" cy="60" r="42" fill="none" stroke="url(#medicalElegant)" strokeWidth="1" opacity="0.5"/>
        
        {/* Lotus/Wellness symbol */}
        <g transform="translate(60,60)">
          {/* Lotus petals */}
          <path d="M0,-20 Q-10,-10 0,0 Q10,-10 0,-20" fill={colors?.primary || '#9370DB'} opacity="0.6"/>
          <path d="M0,-20 Q-15,-5 0,0 Q15,-5 0,-20" fill={colors?.primary || '#9370DB'} opacity="0.4"/>
          <path d="M0,-20 Q-20,0 0,0 Q20,0 0,-20" fill={colors?.primary || '#9370DB'} opacity="0.2"/>
          
          {/* Center */}
          <circle cx="0" cy="-5" r="4" fill={colors?.accent || '#BA55D3'}/>
          
          {/* Healing hands */}
          <g transform="translate(0,10)">
            <ellipse cx="-8" cy="0" rx="6" ry="8" fill={colors?.secondary || '#DDA0DD'} opacity="0.6"/>
            <ellipse cx="8" cy="0" rx="6" ry="8" fill={colors?.secondary || '#DDA0DD'} opacity="0.6"/>
            <circle cx="0" cy="0" r="3" fill={colors?.accent || '#BA55D3'} opacity="0.8"/>
          </g>
        </g>
        
        <text x="60" y="105" textAnchor="middle" className="text-xs font-serif" fill={colors?.primary || '#9370DB'}>
          {businessName.slice(0, 12)}
        </text>
      </svg>
    )
  }
};

// Fonction pour générer un logo basé sur les paramètres
export const generateLogo = (props: LogoProps): JSX.Element => {
  const { sector, style } = props;
  
  const logoConfig = LogoGenerator[sector]?.[style];
  
  if (!logoConfig) {
    // Logo par défaut si pas de configuration trouvée
    return (
      <svg width={props.size || 120} height={props.size || 120} viewBox="0 0 120 120" className="drop-shadow-lg">
        <circle cx="60" cy="60" r="50" fill={props.colors?.primary || '#6B7280'} opacity="0.1"/>
        <text x="60" y="60" textAnchor="middle" className="text-2xl font-bold" fill={props.colors?.primary || '#6B7280'}>
          {props.businessName.charAt(0)}
        </text>
        <text x="60" y="100" textAnchor="middle" className="text-xs font-bold" fill={props.colors?.primary || '#6B7280'}>
          {props.businessName.slice(0, 12)}
        </text>
      </svg>
    );
  }
  
  return logoConfig(props);
};