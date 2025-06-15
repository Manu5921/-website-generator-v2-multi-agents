// =============================================================================
// 🎯 TRACKING CROSS-PLATFORM - GA4 + FACEBOOK PIXEL + LINKEDIN
// =============================================================================

import { crossPlatformAttribution } from '@/lib/ads-management/cross-platform-attribution';

/**
 * Interface pour la configuration de tracking
 */
export interface TrackingConfig {
  ga4: {
    measurementId: string;
    enabled: boolean;
  };
  facebookPixel: {
    pixelId: string;
    enabled: boolean;
    accessToken?: string;
  };
  linkedinInsight: {
    partnerId: string;
    enabled: boolean;
  };
  utmTracking: {
    enabled: boolean;
    sources: string[];
  };
}

/**
 * Interface pour les événements de conversion
 */
export interface ConversionEvent {
  eventName: string;
  value?: number;
  currency?: string;
  transactionId?: string;
  items?: Array<{
    itemId: string;
    itemName: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  customParameters?: Record<string, any>;
}

class CrossPlatformTracking {
  private config: TrackingConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      ga4: {
        measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
        enabled: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      },
      facebookPixel: {
        pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
        enabled: !!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      },
      linkedinInsight: {
        partnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',
        enabled: !!process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
      },
      utmTracking: {
        enabled: true,
        sources: ['google', 'facebook', 'linkedin', 'email', 'direct'],
      },
    };
  }

  /**
   * Initialiser tous les pixels de tracking
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initialisation tracking cross-platform...');

      // Vérifier si on est côté client
      if (typeof window === 'undefined') {
        console.warn('⚠️ Tracking disponible côté client uniquement');
        return;
      }

      // Initialiser Google Analytics 4
      if (this.config.ga4.enabled) {
        await this.initializeGA4();
      }

      // Initialiser Facebook Pixel
      if (this.config.facebookPixel.enabled) {
        await this.initializeFacebookPixel();
      }

      // Initialiser LinkedIn Insight Tag
      if (this.config.linkedinInsight.enabled) {
        await this.initializeLinkedInInsight();
      }

      // Initialiser le tracking UTM
      this.initializeUTMTracking();

      this.isInitialized = true;
      console.log('✅ Tracking cross-platform initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation tracking:', error);
      throw error;
    }
  }

  /**
   * Initialiser Google Analytics 4
   */
  private async initializeGA4(): Promise<void> {
    try {
      const { measurementId } = this.config.ga4;

      // Charger gtag
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      // Initialiser gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', measurementId, {
        // Configuration améliorée pour les conversions
        enhanced_conversions: true,
        allow_enhanced_conversions: true,
        send_page_view: true,
        // Configuration e-commerce
        currency: 'EUR',
        // Configuration des événements personnalisés
        custom_map: {
          custom_parameter_1: 'campaign_source',
          custom_parameter_2: 'ad_platform',
        },
      });

      // Tracker les paramètres UTM automatiquement
      this.trackUTMParameters('ga4');

      console.log('✅ Google Analytics 4 initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation GA4:', error);
      throw error;
    }
  }

  /**
   * Initialiser Facebook Pixel
   */
  private async initializeFacebookPixel(): Promise<void> {
    try {
      const { pixelId } = this.config.facebookPixel;

      // Charger Facebook Pixel
      !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // Initialiser le pixel
      window.fbq('init', pixelId, {
        em: 'auto', // Enhanced matching automatique
        external_id: 'auto',
      });

      // Tracker la page vue
      window.fbq('track', 'PageView');

      // Configuration des événements de conversion standard
      this.setupFacebookConversions();

      // Tracker les paramètres UTM
      this.trackUTMParameters('facebook');

      console.log('✅ Facebook Pixel initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation Facebook Pixel:', error);
      throw error;
    }
  }

  /**
   * Initialiser LinkedIn Insight Tag
   */
  private async initializeLinkedInInsight(): Promise<void> {
    try {
      const { partnerId } = this.config.linkedinInsight;

      // Charger LinkedIn Insight Tag
      window._linkedin_partner_id = partnerId;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(partnerId);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(l) {
          if (!l){
            window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[];
          }
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";
          b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `;
      document.head.appendChild(script);

      // Configuration des conversions LinkedIn
      this.setupLinkedInConversions();

      // Tracker les paramètres UTM
      this.trackUTMParameters('linkedin');

      console.log('✅ LinkedIn Insight Tag initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation LinkedIn:', error);
      throw error;
    }
  }

  /**
   * Initialiser le tracking UTM
   */
  private initializeUTMTracking(): void {
    try {
      // Récupérer les paramètres UTM de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const utmData = {
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        content: urlParams.get('utm_content'),
        term: urlParams.get('utm_term'),
      };

      // Sauvegarder dans sessionStorage pour persistance
      if (Object.values(utmData).some(value => value !== null)) {
        sessionStorage.setItem('utm_data', JSON.stringify(utmData));
        
        // Tracker dans notre système d'attribution
        crossPlatformAttribution.trackEvent({
          sessionId: this.getSessionId(),
          eventType: 'impression',
          platform: this.mapSourceToPlatform(utmData.source || 'direct'),
          source: utmData.source || 'direct',
          medium: utmData.medium || 'organic',
          campaign: utmData.campaign,
          content: utmData.content,
          term: utmData.term,
        });
      }

      console.log('✅ Tracking UTM initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation UTM:', error);
    }
  }

  /**
   * Tracker un événement de conversion sur toutes les plateformes
   */
  async trackConversion(event: ConversionEvent): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Tracking non initialisé');
        return;
      }

      console.log(`🎯 Tracking conversion: ${event.eventName}`);

      // Google Analytics 4
      if (this.config.ga4.enabled && window.gtag) {
        this.trackGA4Conversion(event);
      }

      // Facebook Pixel
      if (this.config.facebookPixel.enabled && window.fbq) {
        this.trackFacebookConversion(event);
      }

      // LinkedIn Insight Tag
      if (this.config.linkedinInsight.enabled && window.lintrk) {
        this.trackLinkedInConversion(event);
      }

      // Système d'attribution interne
      await crossPlatformAttribution.trackEvent({
        sessionId: this.getSessionId(),
        eventType: 'conversion',
        platform: this.getCurrentPlatform(),
        source: 'conversion',
        medium: 'web',
        value: event.value,
        currency: event.currency,
        metadata: {
          eventName: event.eventName,
          transactionId: event.transactionId,
          items: event.items,
          customParameters: event.customParameters,
        },
      });

      console.log('✅ Conversion trackée sur toutes les plateformes');

    } catch (error) {
      console.error('❌ Erreur tracking conversion:', error);
      throw error;
    }
  }

  /**
   * Tracker un événement personnalisé
   */
  async trackCustomEvent(
    eventName: string,
    parameters?: Record<string, any>,
    value?: number
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Tracking non initialisé');
        return;
      }

      // Google Analytics 4
      if (this.config.ga4.enabled && window.gtag) {
        window.gtag('event', eventName, {
          ...parameters,
          value,
          currency: 'EUR',
        });
      }

      // Facebook Pixel
      if (this.config.facebookPixel.enabled && window.fbq) {
        window.fbq('trackCustom', eventName, {
          ...parameters,
          value,
          currency: 'EUR',
        });
      }

      // LinkedIn (événements personnalisés)
      if (this.config.linkedinInsight.enabled && window.lintrk) {
        window.lintrk('track', { conversion_id: eventName });
      }

      console.log(`✅ Événement personnalisé tracké: ${eventName}`);

    } catch (error) {
      console.error('❌ Erreur tracking événement personnalisé:', error);
    }
  }

  /**
   * Obtenir les métriques de performance en temps réel
   */
  async getRealTimeMetrics(): Promise<{
    ga4: any;
    facebook: any;
    linkedin: any;
    attribution: any;
  }> {
    try {
      const [ga4Metrics, facebookMetrics, linkedinMetrics, attributionInsights] = await Promise.all([
        this.getGA4Metrics(),
        this.getFacebookMetrics(),
        this.getLinkedInMetrics(),
        crossPlatformAttribution.generateMLInsights(),
      ]);

      return {
        ga4: ga4Metrics,
        facebook: facebookMetrics,
        linkedin: linkedinMetrics,
        attribution: attributionInsights,
      };

    } catch (error) {
      console.error('❌ Erreur récupération métriques:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private trackGA4Conversion(event: ConversionEvent): void {
    const eventData: any = {
      currency: event.currency || 'EUR',
      value: event.value,
      transaction_id: event.transactionId,
    };

    // Ajouter les items pour l'e-commerce
    if (event.items && event.items.length > 0) {
      eventData.items = event.items.map(item => ({
        item_id: item.itemId,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
      }));
    }

    // Ajouter les paramètres personnalisés
    if (event.customParameters) {
      Object.assign(eventData, event.customParameters);
    }

    window.gtag('event', event.eventName, eventData);
  }

  private trackFacebookConversion(event: ConversionEvent): void {
    const eventData: any = {
      currency: event.currency || 'EUR',
      value: event.value,
    };

    // Ajouter les contenus pour l'e-commerce
    if (event.items && event.items.length > 0) {
      eventData.contents = event.items.map(item => ({
        id: item.itemId,
        quantity: item.quantity,
        item_price: item.price,
      }));
      eventData.content_type = 'product';
    }

    // Mapper les événements standards Facebook
    const facebookEventName = this.mapToFacebookEvent(event.eventName);
    window.fbq('track', facebookEventName, eventData);
  }

  private trackLinkedInConversion(event: ConversionEvent): void {
    // LinkedIn utilise des conversion IDs prédéfinis
    const conversionData: any = {
      conversion_id: this.mapToLinkedInConversion(event.eventName),
    };

    if (event.value) {
      conversionData.conversion_value = event.value;
    }

    window.lintrk('track', conversionData);
  }

  private setupFacebookConversions(): void {
    // Configuration des événements de conversion Facebook standard
    const standardEvents = [
      'Purchase',
      'Lead',
      'CompleteRegistration',
      'AddToCart',
      'InitiateCheckout',
      'ViewContent',
    ];

    // Pré-configurer les événements
    standardEvents.forEach(eventName => {
      window.fbq('track', eventName);
    });
  }

  private setupLinkedInConversions(): void {
    // Configuration des conversions LinkedIn
    // Les conversion IDs doivent être configurés dans LinkedIn Campaign Manager
  }

  private trackUTMParameters(platform: string): void {
    const utmData = sessionStorage.getItem('utm_data');
    if (utmData) {
      const parsedUTM = JSON.parse(utmData);
      
      // Envoyer les données UTM à chaque plateforme
      switch (platform) {
        case 'ga4':
          if (window.gtag) {
            window.gtag('event', 'utm_tracking', {
              utm_source: parsedUTM.source,
              utm_medium: parsedUTM.medium,
              utm_campaign: parsedUTM.campaign,
              utm_content: parsedUTM.content,
              utm_term: parsedUTM.term,
            });
          }
          break;
          
        case 'facebook':
          if (window.fbq) {
            window.fbq('trackCustom', 'UTM_Tracking', parsedUTM);
          }
          break;
          
        case 'linkedin':
          // LinkedIn n'a pas de tracking UTM direct
          break;
      }
    }
  }

  private mapSourceToPlatform(source: string): 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'organic' | 'direct' {
    const mapping: Record<string, any> = {
      google: 'google_ads',
      facebook: 'facebook_ads',
      linkedin: 'linkedin_ads',
      organic: 'organic',
      direct: 'direct',
    };
    return mapping[source.toLowerCase()] || 'direct';
  }

  private mapToFacebookEvent(eventName: string): string {
    const mapping: Record<string, string> = {
      purchase: 'Purchase',
      lead: 'Lead',
      signup: 'CompleteRegistration',
      add_to_cart: 'AddToCart',
      checkout: 'InitiateCheckout',
      view_item: 'ViewContent',
    };
    return mapping[eventName.toLowerCase()] || eventName;
  }

  private mapToLinkedInConversion(eventName: string): string {
    // Mapper vers les conversion IDs LinkedIn configurés
    const mapping: Record<string, string> = {
      purchase: 'purchase_conversion_id',
      lead: 'lead_conversion_id',
      signup: 'signup_conversion_id',
    };
    return mapping[eventName.toLowerCase()] || 'default_conversion_id';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  private getCurrentPlatform(): 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'organic' | 'direct' {
    const utmData = sessionStorage.getItem('utm_data');
    if (utmData) {
      const parsed = JSON.parse(utmData);
      return this.mapSourceToPlatform(parsed.source || 'direct');
    }
    return 'direct';
  }

  private async getGA4Metrics(): Promise<any> {
    // Intégration avec GA4 Reporting API
    return { placeholder: 'GA4 metrics' };
  }

  private async getFacebookMetrics(): Promise<any> {
    // Intégration avec Facebook Marketing API
    return { placeholder: 'Facebook metrics' };
  }

  private async getLinkedInMetrics(): Promise<any> {
    // Intégration avec LinkedIn Marketing API
    return { placeholder: 'LinkedIn metrics' };
  }
}

// Instance singleton
export const crossPlatformTracking = new CrossPlatformTracking();

// Types pour window
declare global {
  interface Window {
    gtag: any;
    dataLayer: any[];
    fbq: any;
    lintrk: any;
    _linkedin_partner_id: string;
    _linkedin_data_partner_ids: string[];
  }
}