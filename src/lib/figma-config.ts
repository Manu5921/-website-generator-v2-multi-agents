/**
 * 🔑 Configuration Figma API
 * Variables d'environnement et configuration centralisée
 */

export const FIGMA_CONFIG = {
  ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN || '',
  TEAM_ID: process.env.FIGMA_TEAM_ID || '',
  WEBHOOK_SECRET: process.env.FIGMA_WEBHOOK_SECRET || '',
  
  // URLs de base
  API_BASE_URL: 'https://api.figma.com/v1',
  WEB_BASE_URL: 'https://www.figma.com',
  
  // Limites et timeouts
  RATE_LIMIT_PER_MINUTE: 1000, // Limite API Figma
  REQUEST_TIMEOUT: 30000, // 30 secondes
  
  // Formats d'export supportés
  EXPORT_FORMATS: ['png', 'jpg', 'svg', 'pdf'] as const,
  
  // Configurations par défaut
  DEFAULT_EXPORT_SCALE: 2,
  DEFAULT_EXPORT_FORMAT: 'png' as const,
  
  // Templates prédéfinis - À remplacer par vos vrais IDs Figma
  TEMPLATE_FILES: {
    RESTAURANT: {
      fileId: process.env.FIGMA_RESTAURANT_TEMPLATE_ID || 'RESTAURANT_FILE_ID',
      name: 'Template Restaurant Premium',
      preview: '/images/templates/restaurant-preview.png'
    },
    ARTISAN: {
      fileId: process.env.FIGMA_ARTISAN_TEMPLATE_ID || 'ARTISAN_FILE_ID',
      name: 'Template Artisan Authentique',
      preview: '/images/templates/artisan-preview.png'
    },
    ECOMMERCE: {
      fileId: process.env.FIGMA_ECOMMERCE_TEMPLATE_ID || 'ECOMMERCE_FILE_ID',
      name: 'Template E-commerce Moderne',
      preview: '/images/templates/ecommerce-preview.png'
    },
    SAAS: {
      fileId: process.env.FIGMA_SAAS_TEMPLATE_ID || 'SAAS_FILE_ID',
      name: 'Template SaaS Innovation',
      preview: '/images/templates/saas-preview.png'
    }
  }
};

/**
 * Validation de la configuration Figma
 */
export function validateFigmaConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!FIGMA_CONFIG.ACCESS_TOKEN) {
    errors.push('FIGMA_ACCESS_TOKEN manquant dans les variables d\'environnement');
  }
  
  if (!FIGMA_CONFIG.TEAM_ID) {
    errors.push('FIGMA_TEAM_ID manquant dans les variables d\'environnement');
  }
  
  // Vérifier que tous les templates ont des IDs valides
  Object.entries(FIGMA_CONFIG.TEMPLATE_FILES).forEach(([key, template]) => {
    if (!template.fileId || template.fileId.includes('_FILE_ID')) {
      errors.push(`Template ${key}: ID Figma manquant ou invalide`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Utilitaires pour les URLs Figma
 */
export const figmaUtils = {
  /**
   * Construit l'URL d'un fichier Figma
   */
  getFileUrl(fileId: string): string {
    return `${FIGMA_CONFIG.WEB_BASE_URL}/file/${fileId}`;
  },
  
  /**
   * Extrait l'ID d'un fichier depuis une URL Figma
   */
  extractFileId(url: string): string | null {
    const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Vérifie si un token d'accès est valide (format)
   */
  isValidAccessToken(token: string): boolean {
    return token.startsWith('figd_') && token.length > 20;
  },
  
  /**
   * Formate un nom de composant Figma en nom de classe React
   */
  toComponentName(figmaName: string): string {
    return figmaName
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '_$&')
      .replace(/^[a-z]/, char => char.toUpperCase());
  }
};

/**
 * Configuration des headers par défaut pour les requêtes Figma
 */
export function getFigmaHeaders(): Record<string, string> {
  return {
    'X-Figma-Token': FIGMA_CONFIG.ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'User-Agent': 'Website-Generator-v2-Multi-Agents/1.0',
  };
}

/**
 * Messages d'erreur localisés
 */
export const FIGMA_ERROR_MESSAGES = {
  INVALID_TOKEN: 'Token d\'accès Figma invalide',
  FILE_NOT_FOUND: 'Fichier Figma introuvable',
  RATE_LIMIT_EXCEEDED: 'Limite de taux API Figma dépassée',
  NETWORK_ERROR: 'Erreur réseau lors de l\'accès à Figma',
  INVALID_FILE_ID: 'ID de fichier Figma invalide',
  NO_PERMISSIONS: 'Permissions insuffisantes pour accéder au fichier',
  EXPORT_FAILED: 'Échec de l\'export des assets Figma',
} as const;