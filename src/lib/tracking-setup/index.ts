// Automatic Tracking Setup System
// Ads Management Agent - Conversion & Performance Tracking

import { coreLogger } from '@/lib/monitoring';
import { AnalyticsConfig } from '@/lib/analytics';

export interface TrackingSetupConfig {
  businessInfo: {
    name: string;
    industry: string;
    website: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  goals: {
    primary: 'leads' | 'sales' | 'traffic' | 'awareness' | 'engagement';
    secondary?: string[];
    customGoals?: CustomGoal[];
  };
  platforms: {
    googleAds: boolean;
    facebookAds: boolean;
    linkedInAds: boolean;
    tiktokAds: boolean;
    googleAnalytics: boolean;
  };
  conversionActions: ConversionAction[];
  autoSetup: boolean;
}

export interface CustomGoal {
  name: string;
  description: string;
  triggerConditions: {
    pageVisit?: string;
    eventName?: string;
    formSubmission?: string;
    timeOnSite?: number;
    scrollDepth?: number;
  };
  value?: number;
  category: 'macro' | 'micro';
}

export interface ConversionAction {
  name: string;
  category: 'purchase' | 'lead' | 'signup' | 'download' | 'call' | 'form' | 'custom';
  value?: number;
  currency?: string;
  triggerElement?: string; // CSS selector or element ID
  url?: string; // Thank you page URL
  eventName?: string; // Custom event name
  lookbackWindow?: number; // Days
  attribution?: 'first_click' | 'last_click' | 'linear' | 'time_decay' | 'position_based';
}

export interface TrackingCode {
  platform: string;
  type: 'script' | 'pixel' | 'tag';
  code: string;
  placement: 'head' | 'body' | 'footer';
  dependencies?: string[];
  isActive: boolean;
}

export interface TrackingImplementation {
  setupId: string;
  config: TrackingSetupConfig;
  generatedCodes: TrackingCode[];
  implementationGuide: ImplementationStep[];
  testingChecklist: TestingItem[];
  status: 'pending' | 'implemented' | 'tested' | 'active';
  createdAt: Date;
  lastUpdated: Date;
}

export interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  platform: string;
  isCompleted: boolean;
  code?: string;
  screenshot?: string;
  notes?: string;
}

export interface TestingItem {
  item: string;
  description: string;
  platform: string;
  isCompleted: boolean;
  testMethod: string;
  expectedResult: string;
  actualResult?: string;
}

class TrackingSetupAutomation {
  async createTrackingSetup(config: TrackingSetupConfig): Promise<TrackingImplementation> {
    try {
      const setupId = this.generateSetupId();
      
      const generatedCodes = await this.generateTrackingCodes(config);
      const implementationGuide = this.createImplementationGuide(config, generatedCodes);
      const testingChecklist = this.createTestingChecklist(config);

      const implementation: TrackingImplementation = {
        setupId,
        config,
        generatedCodes,
        implementationGuide,
        testingChecklist,
        status: 'pending',
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      coreLogger.info('Tracking setup created', { setupId, platforms: Object.keys(config.platforms).filter(p => config.platforms[p as keyof typeof config.platforms]) });
      
      return implementation;
    } catch (error) {
      coreLogger.error('Failed to create tracking setup', error as Error, { config });
      throw error;
    }
  }

  private async generateTrackingCodes(config: TrackingSetupConfig): Promise<TrackingCode[]> {
    const codes: TrackingCode[] = [];

    // Google Analytics 4
    if (config.platforms.googleAnalytics) {
      codes.push(...this.generateGA4Codes(config));
    }

    // Google Ads
    if (config.platforms.googleAds) {
      codes.push(...this.generateGoogleAdsCodes(config));
    }

    // Facebook Pixel
    if (config.platforms.facebookAds) {
      codes.push(...this.generateFacebookPixelCodes(config));
    }

    // LinkedIn Ads
    if (config.platforms.linkedInAds) {
      codes.push(...this.generateLinkedInCodes(config));
    }

    // TikTok Pixel
    if (config.platforms.tiktokAds) {
      codes.push(...this.generateTikTokCodes(config));
    }

    return codes;
  }

  private generateGA4Codes(config: TrackingSetupConfig): TrackingCode[] {
    const codes: TrackingCode[] = [];

    // Main GA4 tracking code
    codes.push({
      platform: 'Google Analytics 4',
      type: 'script',
      placement: 'head',
      isActive: true,
      code: `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    page_title: document.title,
    page_location: window.location.href,
    // Enhanced ecommerce settings
    send_page_view: true,
    // Custom dimensions for business tracking
    custom_map: {
      'custom_parameter_1': 'business_type',
      'custom_parameter_2': 'user_segment'
    }
  });
</script>`,
    });

    // Conversion tracking for each action
    config.conversionActions.forEach((action, index) => {
      codes.push({
        platform: 'Google Analytics 4',
        type: 'script',
        placement: 'body',
        isActive: true,
        code: this.generateGA4ConversionCode(action),
      });
    });

    return codes;
  }

  private generateGoogleAdsCodes(config: TrackingSetupConfig): TrackingCode[] {
    const codes: TrackingCode[] = [];

    // Base Google Ads tracking
    codes.push({
      platform: 'Google Ads',
      type: 'script',
      placement: 'head',
      isActive: true,
      code: `<!-- Google Ads Conversion Tracking -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-CONVERSION_ID');
</script>`,
    });

    // Conversion actions
    config.conversionActions.forEach(action => {
      codes.push({
        platform: 'Google Ads',
        type: 'script',
        placement: 'body',
        isActive: true,
        code: this.generateGoogleAdsConversionCode(action),
      });
    });

    return codes;
  }

  private generateFacebookPixelCodes(config: TrackingSetupConfig): TrackingCode[] {
    const codes: TrackingCode[] = [];

    // Facebook Pixel base code
    codes.push({
      platform: 'Facebook Pixel',
      type: 'script',
      placement: 'head',
      isActive: true,
      code: `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'FACEBOOK_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=FACEBOOK_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`,
    });

    // Custom events for conversions
    config.conversionActions.forEach(action => {
      codes.push({
        platform: 'Facebook Pixel',
        type: 'script',
        placement: 'body',
        isActive: true,
        code: this.generateFacebookPixelEventCode(action),
      });
    });

    return codes;
  }

  private generateLinkedInCodes(config: TrackingSetupConfig): TrackingCode[] {
    return [{
      platform: 'LinkedIn Ads',
      type: 'script',
      placement: 'head',
      isActive: true,
      code: `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "LINKEDIN_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=LINKEDIN_PARTNER_ID&fmt=gif" />
</noscript>`,
    }];
  }

  private generateTikTokCodes(config: TrackingSetupConfig): TrackingCode[] {
    return [{
      platform: 'TikTok Pixel',
      type: 'script',
      placement: 'head',
      isActive: true,
      code: `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('TIKTOK_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`,
    }];
  }

  private generateGA4ConversionCode(action: ConversionAction): string {
    const eventName = this.mapActionToGA4Event(action.category);
    
    return `<!-- GA4 ${action.name} Conversion Tracking -->
<script>
  function track${action.name.replace(/\s+/g, '')}Conversion() {
    gtag('event', '${eventName}', {
      'event_category': '${action.category}',
      'event_label': '${action.name}',
      'value': ${action.value || 1},
      'currency': '${action.currency || 'EUR'}',
      'custom_parameters': {
        'conversion_name': '${action.name}',
        'attribution_model': '${action.attribution || 'last_click'}'
      }
    });
  }

  // Auto-trigger based on configuration
  ${this.generateTriggerCode(action, `track${action.name.replace(/\s+/g, '')}Conversion()`)}
</script>`;
  }

  private generateGoogleAdsConversionCode(action: ConversionAction): string {
    return `<!-- Google Ads ${action.name} Conversion -->
<script>
  function trackGoogleAds${action.name.replace(/\s+/g, '')}() {
    gtag('event', 'conversion', {
      'send_to': 'AW-CONVERSION_ID/${action.name.toLowerCase().replace(/\s+/g, '_')}',
      'value': ${action.value || 1},
      'currency': '${action.currency || 'EUR'}',
      'transaction_id': 'txn_' + Date.now()
    });
  }

  ${this.generateTriggerCode(action, `trackGoogleAds${action.name.replace(/\s+/g, '')}()`)}
</script>`;
  }

  private generateFacebookPixelEventCode(action: ConversionAction): string {
    const fbEventName = this.mapActionToFBEvent(action.category);
    
    return `<!-- Facebook Pixel ${action.name} Event -->
<script>
  function trackFB${action.name.replace(/\s+/g, '')}() {
    fbq('track', '${fbEventName}', {
      value: ${action.value || 1},
      currency: '${action.currency || 'EUR'}',
      content_name: '${action.name}',
      content_category: '${action.category}'
    });
  }

  ${this.generateTriggerCode(action, `trackFB${action.name.replace(/\s+/g, '')}()`)}
</script>`;
  }

  private generateTriggerCode(action: ConversionAction, functionCall: string): string {
    if (action.triggerElement) {
      return `
  // Trigger on element click
  document.addEventListener('DOMContentLoaded', function() {
    const element = document.querySelector('${action.triggerElement}');
    if (element) {
      element.addEventListener('click', function() {
        ${functionCall};
      });
    }
  });`;
    }

    if (action.url) {
      return `
  // Trigger on page load (thank you page)
  if (window.location.pathname === '${action.url}' || window.location.href.includes('${action.url}')) {
    ${functionCall};
  }`;
    }

    if (action.eventName) {
      return `
  // Trigger on custom event
  document.addEventListener('${action.eventName}', function(e) {
    ${functionCall};
  });`;
    }

    return `// Manual trigger - call ${functionCall} when needed`;
  }

  private mapActionToGA4Event(category: ConversionAction['category']): string {
    const mapping = {
      'purchase': 'purchase',
      'lead': 'generate_lead',
      'signup': 'sign_up',
      'download': 'download',
      'call': 'contact',
      'form': 'form_submit',
      'custom': 'custom_conversion',
    };
    return mapping[category] || 'conversion';
  }

  private mapActionToFBEvent(category: ConversionAction['category']): string {
    const mapping = {
      'purchase': 'Purchase',
      'lead': 'Lead',
      'signup': 'CompleteRegistration',
      'download': 'Download',
      'call': 'Contact',
      'form': 'SubmitApplication',
      'custom': 'CustomEvent',
    };
    return mapping[category] || 'Lead';
  }

  private createImplementationGuide(config: TrackingSetupConfig, codes: TrackingCode[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [];
    let stepNumber = 1;

    // Google Analytics setup
    if (config.platforms.googleAnalytics) {
      steps.push({
        step: stepNumber++,
        title: 'Configurer Google Analytics 4',
        description: 'Créer une propriété GA4 et obtenir l\'ID de mesure',
        platform: 'Google Analytics',
        isCompleted: false,
        code: 'Remplacer GA_MEASUREMENT_ID par votre ID réel',
      });
    }

    // Google Ads setup
    if (config.platforms.googleAds) {
      steps.push({
        step: stepNumber++,
        title: 'Configurer Google Ads',
        description: 'Créer des actions de conversion dans Google Ads',
        platform: 'Google Ads',
        isCompleted: false,
        code: 'Remplacer AW-CONVERSION_ID par votre ID de conversion',
      });
    }

    // Facebook Pixel setup
    if (config.platforms.facebookAds) {
      steps.push({
        step: stepNumber++,
        title: 'Configurer Facebook Pixel',
        description: 'Créer un pixel Facebook et obtenir l\'ID',
        platform: 'Facebook',
        isCompleted: false,
        code: 'Remplacer FACEBOOK_PIXEL_ID par votre ID de pixel',
      });
    }

    // Implementation steps
    codes.forEach(code => {
      steps.push({
        step: stepNumber++,
        title: `Implémenter ${code.platform}`,
        description: `Ajouter le code de suivi ${code.platform} dans la section ${code.placement}`,
        platform: code.platform,
        isCompleted: false,
        code: code.code,
      });
    });

    return steps;
  }

  private createTestingChecklist(config: TrackingSetupConfig): TestingItem[] {
    const items: TestingItem[] = [];

    // Basic tracking tests
    if (config.platforms.googleAnalytics) {
      items.push({
        item: 'Test Google Analytics',
        description: 'Vérifier que les pages vues sont enregistrées',
        platform: 'Google Analytics',
        isCompleted: false,
        testMethod: 'Real-time reports',
        expectedResult: 'Activité visible dans les rapports temps réel',
      });
    }

    if (config.platforms.facebookAds) {
      items.push({
        item: 'Test Facebook Pixel',
        description: 'Vérifier que le pixel est actif',
        platform: 'Facebook',
        isCompleted: false,
        testMethod: 'Facebook Pixel Helper Chrome extension',
        expectedResult: 'Pixel détecté et événements PageView enregistrés',
      });
    }

    // Conversion tests
    config.conversionActions.forEach(action => {
      items.push({
        item: `Test conversion ${action.name}`,
        description: `Vérifier le tracking de l'action ${action.name}`,
        platform: 'Toutes les plateformes',
        isCompleted: false,
        testMethod: 'Déclencher l\'action et vérifier les rapports',
        expectedResult: 'Conversion enregistrée dans tous les outils configurés',
      });
    });

    return items;
  }

  private generateSetupId(): string {
    return `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for setup validation
  async validateSetup(implementation: TrackingImplementation): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate required IDs are replaced
    implementation.generatedCodes.forEach(code => {
      if (code.code.includes('GA_MEASUREMENT_ID')) {
        errors.push('Google Analytics ID not configured');
      }
      if (code.code.includes('FACEBOOK_PIXEL_ID')) {
        errors.push('Facebook Pixel ID not configured');
      }
      if (code.code.includes('AW-CONVERSION_ID')) {
        errors.push('Google Ads Conversion ID not configured');
      }
    });

    // Validate conversion actions have proper triggers
    implementation.config.conversionActions.forEach(action => {
      if (!action.triggerElement && !action.url && !action.eventName) {
        errors.push(`Conversion action "${action.name}" has no trigger defined`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateAnalyticsConfig(implementation: TrackingImplementation): AnalyticsConfig {
    return {
      googleAnalyticsId: 'GA_MEASUREMENT_ID', // To be replaced
      facebookPixelId: 'FACEBOOK_PIXEL_ID', // To be replaced
      googleAdsId: 'AW-CONVERSION_ID', // To be replaced
      linkedInId: implementation.config.platforms.linkedInAds ? 'LINKEDIN_PARTNER_ID' : undefined,
      tiktokPixelId: implementation.config.platforms.tiktokAds ? 'TIKTOK_PIXEL_ID' : undefined,
    };
  }
}

// Global instance
export const trackingSetupAutomation = new TrackingSetupAutomation();

// Export types
export type {
  TrackingSetupConfig,
  CustomGoal,
  ConversionAction,
  TrackingCode,
  TrackingImplementation,
  ImplementationStep,
  TestingItem,
};

export { TrackingSetupAutomation };