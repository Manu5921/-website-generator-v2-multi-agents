/**
 * Internationalization configuration and utilities for BigSpring France
 * Handles French translations with fallback to English
 */

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// Available locales
export const locales = ['fr', 'en'] as const;
export type Locale = typeof locales[number];

// Default locale
export const defaultLocale: Locale = 'fr';

// Translation namespaces
export const namespaces = [
  'common',
  'homepage', 
  'about',
  'pricing',
  'blog',
  'seo',
  'contact',
  'forms'
] as const;

export type Namespace = typeof namespaces[number];

// Translation hook
export function useTranslation(namespace: Namespace) {
  const router = useRouter();
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current locale from router or default to French
  const locale = (router.locale as Locale) || defaultLocale;
  
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        // Try to load translations for current locale
        const translationModule = await import(`../locales/${locale}/${namespace}.json`);
        setTranslations(translationModule.default || translationModule);
      } catch (error) {
        console.warn(`Translation file not found: ${locale}/${namespace}.json`);
        
        // Fallback to English if French not available
        if (locale !== 'en') {
          try {
            const fallbackModule = await import(`../locales/en/${namespace}.json`);
            setTranslations(fallbackModule.default || fallbackModule);
          } catch (fallbackError) {
            console.error(`Fallback translation also failed: en/${namespace}.json`);
            setTranslations({});
          }
        } else {
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [locale, namespace]);

  // Translation function with nested key support
  const t = (key: string, replacements?: Record<string, string>): string => {
    if (!key) return '';
    
    // Handle nested keys like 'hero.title'
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation key not found: ${key} in ${namespace}`);
        return key;
      }
    }
    
    // Return the key if value is not a string
    if (typeof value !== 'string') {
      return key;
    }
    
    // Handle variable replacements like {{variable}}
    if (replacements) {
      return Object.entries(replacements).reduce(
        (str, [replaceKey, replaceValue]) => 
          str.replace(new RegExp(`{{${replaceKey}}}`, 'g'), replaceValue),
        value
      );
    }
    
    return value;
  };

  return { t, locale, isLoading };
}

// Language switcher utility
export function getAlternateLocale(currentLocale: Locale): Locale {
  return currentLocale === 'fr' ? 'en' : 'fr';
}

// SEO utilities
export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

// Currency formatter for French locale
export function formatPrice(amount: number, locale: Locale = 'fr'): string {
  const currency = locale === 'fr' ? 'EUR' : 'USD';
  const symbol = locale === 'fr' ? '€' : '$';
  
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Date formatter for French locale
export function formatDate(date: Date, locale: Locale = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
  }).format(date);
}

// Phone number formatter for French numbers
export function formatPhone(phone: string, locale: Locale = 'fr'): string {
  if (locale === 'fr') {
    // Format: +33 1 23 45 67 89 or 01 23 45 67 89
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('33')) {
      return `+33 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
  }
  return phone;
}

// Get localized meta tags for SEO
export function getLocalizedSEO(pageKey: string, locale: Locale = 'fr') {
  // This would typically load from the seo.json file
  const seoDefaults = {
    fr: {
      title: 'BigSpring France - Plateforme Marketing Digital',
      description: 'Transformez votre PME avec la plateforme marketing digital française #1. Support 24/7, essai gratuit 30 jours.',
      keywords: 'marketing digital france, plateforme marketing, crm pme'
    },
    en: {
      title: 'BigSpring - Digital Marketing Platform',
      description: 'Transform your business with the ultimate digital marketing platform. 24/7 support, 30-day free trial.',
      keywords: 'digital marketing platform, business automation, crm software'
    }
  };
  
  return seoDefaults[locale];
}

export default useTranslation;