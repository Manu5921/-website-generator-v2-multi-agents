/**
 * 🎨 Figma API Integration
 * Interface complète pour récupérer designs et assets depuis Figma
 */

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  backgroundColor?: FigmaColor;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  constraints?: FigmaConstraints;
  absoluteBoundingBox?: FigmaRect;
  characters?: string;
  style?: FigmaTextStyle;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: any[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaFill {
  type: string;
  color?: FigmaColor;
  gradientStops?: FigmaGradientStop[];
}

export interface FigmaGradientStop {
  color: FigmaColor;
  position: number;
}

export interface FigmaStroke {
  type: string;
  color: FigmaColor;
}

export interface FigmaEffect {
  type: string;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
}

export interface FigmaConstraints {
  vertical: string;
  horizontal: string;
}

export interface FigmaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: number;
  lineHeightPx: number;
  textAlignHorizontal: string;
  textAlignVertical: string;
}

export interface FigmaImageExport {
  id: string;
  url: string;
  format: 'jpg' | 'png' | 'svg' | 'pdf';
  scale: number;
}

export class FigmaAPI {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupère un fichier Figma complet avec tous ses composants
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    return this.request<FigmaFile>(`/files/${fileKey}`);
  }

  /**
   * Récupère les images/exports d'un fichier Figma
   */
  async getFileImages(
    fileKey: string,
    nodeIds: string[],
    options: {
      format?: 'jpg' | 'png' | 'svg' | 'pdf';
      scale?: number;
      use_absolute_bounds?: boolean;
    } = {}
  ): Promise<{ images: Record<string, string> }> {
    const params = new URLSearchParams({
      ids: nodeIds.join(','),
      format: options.format || 'png',
      scale: (options.scale || 1).toString(),
      use_absolute_bounds: (options.use_absolute_bounds || false).toString(),
    });

    return this.request(`/images/${fileKey}?${params}`);
  }

  /**
   * Récupère les composants d'un fichier
   */
  async getFileComponents(fileKey: string): Promise<{ meta: { components: FigmaComponent[] } }> {
    return this.request(`/files/${fileKey}/components`);
  }

  /**
   * Récupère les styles d'un fichier
   */
  async getFileStyles(fileKey: string): Promise<{ meta: { styles: FigmaStyle[] } }> {
    return this.request(`/files/${fileKey}/styles`);
  }

  /**
   * Recherche dans les fichiers d'une équipe
   */
  async getTeamProjects(teamId: string): Promise<{ projects: Array<{ id: string; name: string }> }> {
    return this.request(`/teams/${teamId}/projects`);
  }

  /**
   * Récupère les fichiers d'un projet
   */
  async getProjectFiles(projectId: string): Promise<{ files: Array<{ key: string; name: string; thumbnail_url: string }> }> {
    return this.request(`/projects/${projectId}/files`);
  }
}

/**
 * Utilitaires pour convertir les données Figma en CSS/Tailwind
 */
export class FigmaToCodeConverter {
  
  /**
   * Convertit une couleur Figma en format CSS
   */
  static colorToCss(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    if (color.a === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
  }

  /**
   * Convertit une couleur Figma en classe Tailwind
   */
  static colorToTailwind(color: FigmaColor, type: 'bg' | 'text' | 'border' = 'bg'): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    // Logique simplifiée - en production, il faudrait une correspondance plus précise
    if (r > 200 && g > 200 && b > 200) return `${type}-gray-100`;
    if (r > 150 && g > 150 && b > 150) return `${type}-gray-300`;
    if (r > 100 && g > 100 && b > 100) return `${type}-gray-500`;
    if (r < 50 && g < 50 && b < 50) return `${type}-gray-900`;
    
    // Couleurs principales
    if (r > g && r > b) return `${type}-red-500`;
    if (g > r && g > b) return `${type}-green-500`;
    if (b > r && b > g) return `${type}-blue-500`;
    
    return `${type}-gray-500`;
  }

  /**
   * Convertit un style de texte Figma en classes Tailwind
   */
  static textStyleToTailwind(style: FigmaTextStyle): string[] {
    const classes: string[] = [];
    
    // Taille de police
    if (style.fontSize >= 48) classes.push('text-5xl');
    else if (style.fontSize >= 36) classes.push('text-4xl');
    else if (style.fontSize >= 30) classes.push('text-3xl');
    else if (style.fontSize >= 24) classes.push('text-2xl');
    else if (style.fontSize >= 20) classes.push('text-xl');
    else if (style.fontSize >= 18) classes.push('text-lg');
    else if (style.fontSize >= 16) classes.push('text-base');
    else classes.push('text-sm');
    
    // Poids de police
    if (style.fontWeight >= 800) classes.push('font-black');
    else if (style.fontWeight >= 700) classes.push('font-bold');
    else if (style.fontWeight >= 600) classes.push('font-semibold');
    else if (style.fontWeight >= 500) classes.push('font-medium');
    else classes.push('font-normal');
    
    // Alignement
    if (style.textAlignHorizontal === 'CENTER') classes.push('text-center');
    else if (style.textAlignHorizontal === 'RIGHT') classes.push('text-right');
    else classes.push('text-left');
    
    return classes;
  }

  /**
   * Convertit un effet Figma en classes Tailwind
   */
  static effectToTailwind(effect: FigmaEffect): string[] {
    const classes: string[] = [];
    
    switch (effect.type) {
      case 'DROP_SHADOW':
        if (effect.radius <= 4) classes.push('shadow-sm');
        else if (effect.radius <= 8) classes.push('shadow');
        else if (effect.radius <= 16) classes.push('shadow-lg');
        else if (effect.radius <= 24) classes.push('shadow-xl');
        else classes.push('shadow-2xl');
        break;
        
      case 'INNER_SHADOW':
        classes.push('shadow-inner');
        break;
        
      case 'LAYER_BLUR':
        if (effect.radius <= 4) classes.push('blur-sm');
        else if (effect.radius <= 8) classes.push('blur');
        else if (effect.radius <= 16) classes.push('blur-lg');
        else classes.push('blur-xl');
        break;
    }
    
    return classes;
  }

  /**
   * Génère du code React à partir d'un nœud Figma
   */
  static nodeToReactComponent(node: FigmaNode, depth = 0): string {
    const indent = '  '.repeat(depth);
    const classes: string[] = [];
    
    // Classes de base selon le type
    switch (node.type) {
      case 'FRAME':
      case 'GROUP':
        classes.push('relative');
        break;
      case 'TEXT':
        classes.push('text-element');
        break;
      case 'RECTANGLE':
        classes.push('block');
        break;
    }
    
    // Styles visuels
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.color) {
        classes.push(this.colorToTailwind(fill.color, 'bg'));
      }
    }
    
    if (node.style) {
      classes.push(...this.textStyleToTailwind(node.style));
    }
    
    if (node.effects) {
      node.effects.forEach(effect => {
        classes.push(...this.effectToTailwind(effect));
      });
    }
    
    const className = classes.join(' ');
    
    // Générer le JSX
    if (node.type === 'TEXT' && node.characters) {
      return `${indent}<div className="${className}">${node.characters}</div>`;
    }
    
    if (node.children && node.children.length > 0) {
      const childrenJsx = node.children
        .map(child => this.nodeToReactComponent(child, depth + 1))
        .join('\n');
      
      return `${indent}<div className="${className}">
${childrenJsx}
${indent}</div>`;
    }
    
    return `${indent}<div className="${className}"></div>`;
  }
}

/**
 * Instance API Figma configurée
 */
export const figmaApi = new FigmaAPI(
  process.env.FIGMA_ACCESS_TOKEN || ''
);

/**
 * Templates Figma prédéfinis par secteur
 */
export const FIGMA_TEMPLATES = {
  RESTAURANT: {
    fileKey: 'RESTAURANT_TEMPLATE_KEY',
    name: 'Template Restaurant',
    sector: 'restaurant',
    components: ['hero', 'menu', 'about', 'contact']
  },
  ARTISAN: {
    fileKey: 'ARTISAN_TEMPLATE_KEY', 
    name: 'Template Artisan',
    sector: 'artisan',
    components: ['hero', 'services', 'gallery', 'testimonials']
  },
  ECOMMERCE: {
    fileKey: 'ECOMMERCE_TEMPLATE_KEY',
    name: 'Template E-commerce',
    sector: 'ecommerce', 
    components: ['hero', 'products', 'features', 'cta']
  },
  SAAS: {
    fileKey: 'SAAS_TEMPLATE_KEY',
    name: 'Template SaaS',
    sector: 'saas',
    components: ['hero', 'features', 'pricing', 'testimonials']
  }
};