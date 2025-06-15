// Analytics and Tracking System
// Ads Management Agent - Marketing Intelligence

import { coreLogger } from '@/lib/monitoring';

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleAdsId?: string;
  linkedInId?: string;
  tiktokPixelId?: string;
}

export interface TrackingEvent {
  eventName: string;
  parameters: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface ConversionEvent {
  type: 'lead' | 'purchase' | 'signup' | 'demo_request' | 'call' | 'form_submit';
  value?: number;
  currency?: string;
  customParameters?: Record<string, any>;
}

class AnalyticsManager {
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Google Analytics 4
      if (this.config.googleAnalyticsId) {
        await this.initializeGA4();
      }

      // Initialize Facebook Pixel
      if (this.config.facebookPixelId) {
        await this.initializeFacebookPixel();
      }

      // Initialize Google Ads
      if (this.config.googleAdsId) {
        await this.initializeGoogleAds();
      }

      this.isInitialized = true;
      coreLogger.info('Analytics initialized successfully', { config: this.config });
    } catch (error) {
      coreLogger.error('Failed to initialize analytics', error as Error);
      throw error;
    }
  }

  private async initializeGA4(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    
    gtag('js', new Date());
    gtag('config', this.config.googleAnalyticsId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Make gtag globally available
    (window as any).gtag = gtag;
  }

  private async initializeFacebookPixel(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Facebook Pixel initialization
    const fbq = function(...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    };

    if (!(window as any).fbq) {
      (window as any).fbq = fbq;
    }

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    fbq('init', this.config.facebookPixelId);
    fbq('track', 'PageView');
  }

  private async initializeGoogleAds(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Google Ads conversion tracking
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAdsId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    
    gtag('js', new Date());
    gtag('config', this.config.googleAdsId);
  }

  trackEvent(event: TrackingEvent): void {
    if (!this.isInitialized) {
      coreLogger.warn('Analytics not initialized, queueing event', { event });
      return;
    }

    try {
      // Track with Google Analytics
      if (this.config.googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.eventName, {
          event_category: event.parameters.category || 'general',
          event_label: event.parameters.label,
          value: event.parameters.value,
          custom_parameters: event.parameters,
        });
      }

      // Track with Facebook Pixel
      if (this.config.facebookPixelId && typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', event.eventName, event.parameters);
      }

      coreLogger.info('Event tracked successfully', { event });
    } catch (error) {
      coreLogger.error('Failed to track event', error as Error, { event });
    }
  }

  trackConversion(conversion: ConversionEvent): void {
    const event: TrackingEvent = {
      eventName: 'conversion',
      parameters: {
        conversion_type: conversion.type,
        value: conversion.value,
        currency: conversion.currency || 'EUR',
        ...conversion.customParameters,
      },
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    };

    this.trackEvent(event);

    // Special handling for different conversion types
    this.trackSpecialConversion(conversion);
  }

  private trackSpecialConversion(conversion: ConversionEvent): void {
    try {
      // Google Ads conversion tracking
      if (this.config.googleAdsId && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: `${this.config.googleAdsId}/${conversion.type}`,
          value: conversion.value,
          currency: conversion.currency || 'EUR',
        });
      }

      // Facebook Pixel conversion tracking
      if (this.config.facebookPixelId && typeof window !== 'undefined' && (window as any).fbq) {
        const fbEventName = this.mapConversionToFBEvent(conversion.type);
        (window as any).fbq('track', fbEventName, {
          value: conversion.value,
          currency: conversion.currency || 'EUR',
          content_type: conversion.type,
        });
      }
    } catch (error) {
      coreLogger.error('Failed to track special conversion', error as Error, { conversion });
    }
  }

  private mapConversionToFBEvent(type: ConversionEvent['type']): string {
    const mapping: Record<ConversionEvent['type'], string> = {
      lead: 'Lead',
      purchase: 'Purchase',
      signup: 'CompleteRegistration',
      demo_request: 'ScheduleAppointment',
      call: 'Contact',
      form_submit: 'SubmitApplication',
    };
    return mapping[type] || 'CustomEvent';
  }

  trackPageView(page: string, title?: string): void {
    const event: TrackingEvent = {
      eventName: 'page_view',
      parameters: {
        page_path: page,
        page_title: title || document.title,
      },
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : page,
    };

    this.trackEvent(event);
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = window.sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        window.sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for common tracking scenarios
  trackFormSubmission(formName: string, formData: Record<string, any>): void {
    this.trackEvent({
      eventName: 'form_submit',
      parameters: {
        form_name: formName,
        form_data: formData,
      },
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  trackButtonClick(buttonName: string, location: string): void {
    this.trackEvent({
      eventName: 'button_click',
      parameters: {
        button_name: buttonName,
        click_location: location,
      },
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  trackUserEngagement(engagementType: string, duration?: number): void {
    this.trackEvent({
      eventName: 'user_engagement',
      parameters: {
        engagement_type: engagementType,
        duration_seconds: duration,
      },
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    });
  }
}

// Global analytics instance
let globalAnalytics: AnalyticsManager | null = null;

export function initializeAnalytics(config: AnalyticsConfig): AnalyticsManager {
  if (!globalAnalytics) {
    globalAnalytics = new AnalyticsManager(config);
  }
  return globalAnalytics;
}

export function getAnalytics(): AnalyticsManager | null {
  return globalAnalytics;
}

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent: (event: Omit<TrackingEvent, 'timestamp' | 'sessionId' | 'pageUrl'>) => {
      globalAnalytics?.trackEvent({
        ...event,
        timestamp: new Date(),
        sessionId: globalAnalytics['generateSessionId'](),
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      });
    },
    trackConversion: (conversion: ConversionEvent) => {
      globalAnalytics?.trackConversion(conversion);
    },
    trackPageView: (page: string, title?: string) => {
      globalAnalytics?.trackPageView(page, title);
    },
    trackFormSubmission: (formName: string, formData: Record<string, any>) => {
      globalAnalytics?.trackFormSubmission(formName, formData);
    },
    trackButtonClick: (buttonName: string, location: string) => {
      globalAnalytics?.trackButtonClick(buttonName, location);
    },
  };
}

// Export types
export type { TrackingEvent, ConversionEvent };
export { AnalyticsManager };