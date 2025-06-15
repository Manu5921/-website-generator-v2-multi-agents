/**
 * Language Switcher Component
 * Allows users to switch between French and English versions
 */

'use client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getAlternateLocale, type Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  showFlags?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  showFlags = true,
  size = 'md'
}) => {
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);
  
  const currentLocale = (router.locale as Locale) || 'fr';
  const alternateLocale = getAlternateLocale(currentLocale);
  
  const languages = {
    fr: {
      name: 'Français',
      flag: '🇫🇷',
      code: 'FR'
    },
    en: {
      name: 'English', 
      flag: '🇺🇸',
      code: 'EN'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const handleLanguageChange = async () => {
    setIsChanging(true);
    
    try {
      // Get current path without locale prefix
      const currentPath = router.asPath;
      
      // Navigate to the same path but with different locale
      await router.push(currentPath, currentPath, { 
        locale: alternateLocale,
        scroll: false // Prevent scroll to top
      });
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`language-switcher ${className}`}>
      <button
        onClick={handleLanguageChange}
        disabled={isChanging}
        className={`
          ${sizeClasses[size]}
          flex items-center space-x-2
          bg-white border border-gray-200 rounded-lg
          hover:bg-gray-50 hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm
        `}
        aria-label={`Switch to ${languages[alternateLocale].name}`}
      >
        {showFlags && (
          <span className="text-lg">
            {languages[alternateLocale].flag}
          </span>
        )}
        
        <span className="font-medium text-gray-700">
          {languages[alternateLocale].code}
        </span>
        
        {isChanging && (
          <svg 
            className="animate-spin h-4 w-4 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </button>
      
      {/* Dropdown version for more languages (future use) */}
      <div className="hidden">
        <select 
          value={currentLocale}
          onChange={(e) => handleLanguageChange()}
          className="bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>
    </div>
  );
};

// Alternative compact version
export const CompactLanguageSwitcher: React.FC<{className?: string}> = ({ className = '' }) => {
  const router = useRouter();
  const currentLocale = (router.locale as Locale) || 'fr';
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={() => router.push(router.asPath, router.asPath, { locale: 'fr' })}
        className={`
          px-2 py-1 text-xs font-medium rounded
          ${currentLocale === 'fr' 
            ? 'bg-blue-100 text-blue-800' 
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        FR
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => router.push(router.asPath, router.asPath, { locale: 'en' })}
        className={`
          px-2 py-1 text-xs font-medium rounded
          ${currentLocale === 'en' 
            ? 'bg-blue-100 text-blue-800' 
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;