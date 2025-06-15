export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  blur?: number;
  sharpen?: number;
  removeMetadata?: boolean;
  background?: string;
}

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  quality: number;
}

export interface OptimizedImage {
  original: ImageVariant;
  variants: ImageVariant[];
  srcSet: string;
  sizes: string;
  placeholder: string;
  aspectRatio: number;
  dominantColor: string;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private baseUrl: string;
  private cdnUrl?: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3334';
    this.cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  }

  public static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Generate optimized image variants
   */
  public async optimizeImage(
    imageUrl: string,
    config: ImageOptimizationConfig = {}
  ): Promise<OptimizedImage> {
    const {
      quality = 85,
      format = 'auto',
      removeMetadata = true,
      progressive = true
    } = config;

    // Common responsive breakpoints
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    
    try {
      // Get original image metadata
      const originalMeta = await this.getImageMetadata(imageUrl);
      
      // Generate variants for different sizes and formats
      const variants: ImageVariant[] = [];
      
      for (const width of breakpoints) {
        if (width <= originalMeta.width) {
          // WebP variant
          variants.push(await this.generateVariant(imageUrl, {
            ...config,
            width,
            format: 'webp',
            quality
          }));

          // AVIF variant (better compression)
          variants.push(await this.generateVariant(imageUrl, {
            ...config,
            width,
            format: 'avif',
            quality: quality - 10 // AVIF can use lower quality for same visual quality
          }));

          // Fallback JPEG variant
          variants.push(await this.generateVariant(imageUrl, {
            ...config,
            width,
            format: 'jpeg',
            quality,
            progressive
          }));
        }
      }

      // Generate placeholder (low quality, small size)
      const placeholder = await this.generatePlaceholder(imageUrl);
      
      // Extract dominant color
      const dominantColor = await this.extractDominantColor(imageUrl);
      
      // Calculate aspect ratio
      const aspectRatio = originalMeta.width / originalMeta.height;
      
      // Generate srcSet string
      const srcSet = this.generateSrcSet(variants);
      
      // Generate sizes attribute
      const sizes = this.generateSizes();

      return {
        original: {
          url: imageUrl,
          width: originalMeta.width,
          height: originalMeta.height,
          format: originalMeta.format,
          size: originalMeta.size,
          quality: 100
        },
        variants,
        srcSet,
        sizes,
        placeholder,
        aspectRatio,
        dominantColor
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      
      // Return fallback
      return {
        original: {
          url: imageUrl,
          width: 800,
          height: 600,
          format: 'jpeg',
          size: 0,
          quality: 100
        },
        variants: [],
        srcSet: imageUrl,
        sizes: '100vw',
        placeholder: this.generateColorPlaceholder('#cccccc'),
        aspectRatio: 4/3,
        dominantColor: '#cccccc'
      };
    }
  }

  /**
   * Generate a single image variant
   */
  private async generateVariant(
    imageUrl: string,
    config: ImageOptimizationConfig
  ): Promise<ImageVariant> {
    const optimizedUrl = this.buildOptimizedUrl(imageUrl, config);
    
    // In a real implementation, this would generate the actual optimized image
    // For now, we'll simulate the optimization
    const estimatedSize = this.estimateFileSize(config);
    
    return {
      url: optimizedUrl,
      width: config.width || 800,
      height: config.height || 600,
      format: config.format || 'jpeg',
      size: estimatedSize,
      quality: config.quality || 85
    };
  }

  /**
   * Build URL for optimized image
   */
  private buildOptimizedUrl(imageUrl: string, config: ImageOptimizationConfig): string {
    const baseUrl = this.cdnUrl || this.baseUrl;
    const params = new URLSearchParams();

    params.append('url', imageUrl);
    
    if (config.width) params.append('w', config.width.toString());
    if (config.height) params.append('h', config.height.toString());
    if (config.quality) params.append('q', config.quality.toString());
    if (config.format && config.format !== 'auto') params.append('f', config.format);
    if (config.fit) params.append('fit', config.fit);
    if (config.blur) params.append('blur', config.blur.toString());
    if (config.sharpen) params.append('sharpen', config.sharpen.toString());
    if (config.background) params.append('bg', config.background);

    return `${baseUrl}/api/image/optimize?${params.toString()}`;
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(imageUrl: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    // In a real implementation, this would analyze the actual image
    // For now, return mock data
    return {
      width: 1920,
      height: 1080,
      format: 'jpeg',
      size: 245760 // 240KB
    };
  }

  /**
   * Generate low-quality placeholder
   */
  private async generatePlaceholder(imageUrl: string): Promise<string> {
    // Generate a blurred, low-quality version
    const placeholderUrl = this.buildOptimizedUrl(imageUrl, {
      width: 20,
      height: 20,
      quality: 10,
      blur: 2,
      format: 'jpeg'
    });

    // Convert to base64 data URL
    try {
      const response = await fetch(placeholderUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      // Return a simple color placeholder
      return this.generateColorPlaceholder('#e5e7eb');
    }
  }

  /**
   * Generate color placeholder
   */
  private generateColorPlaceholder(color: string): string {
    // Generate a 1x1 pixel SVG with the dominant color
    const svg = `<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="${color}"/></svg>`;
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Extract dominant color from image
   */
  private async extractDominantColor(imageUrl: string): Promise<string> {
    // In a real implementation, this would analyze the image pixels
    // For now, return a default color
    return '#6366f1';
  }

  /**
   * Generate srcSet string
   */
  private generateSrcSet(variants: ImageVariant[]): string {
    // Group by format for modern format support
    const webpVariants = variants.filter(v => v.format === 'webp');
    const avifVariants = variants.filter(v => v.format === 'avif');
    const fallbackVariants = variants.filter(v => v.format === 'jpeg' || v.format === 'png');

    // Generate srcSet for the best supported format
    const primaryVariants = avifVariants.length > 0 ? avifVariants : 
                           webpVariants.length > 0 ? webpVariants : 
                           fallbackVariants;

    return primaryVariants
      .map(variant => `${variant.url} ${variant.width}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute
   */
  private generateSizes(): string {
    return [
      '(max-width: 640px) 100vw',
      '(max-width: 1024px) 50vw',
      '33vw'
    ].join(', ');
  }

  /**
   * Estimate file size based on optimization config
   */
  private estimateFileSize(config: ImageOptimizationConfig): number {
    const baseSize = (config.width || 800) * (config.height || 600);
    const qualityFactor = (config.quality || 85) / 100;
    
    let formatFactor = 1;
    switch (config.format) {
      case 'avif':
        formatFactor = 0.3; // AVIF is ~70% smaller
        break;
      case 'webp':
        formatFactor = 0.5; // WebP is ~50% smaller
        break;
      case 'png':
        formatFactor = 2; // PNG is usually larger
        break;
      default:
        formatFactor = 1;
    }

    return Math.round(baseSize * qualityFactor * formatFactor * 0.1);
  }

  /**
   * Preload critical images
   */
  public generatePreloadLink(imageUrl: string, config: ImageOptimizationConfig = {}): string {
    const optimizedUrl = this.buildOptimizedUrl(imageUrl, {
      ...config,
      format: 'webp', // Use modern format for preload
      quality: config.quality || 85
    });

    return `<link rel="preload" as="image" href="${optimizedUrl}" />`;
  }

  /**
   * Generate picture element HTML
   */
  public generatePictureElement(
    optimizedImage: OptimizedImage,
    alt: string,
    className?: string,
    loading: 'lazy' | 'eager' = 'lazy'
  ): string {
    const webpVariants = optimizedImage.variants.filter(v => v.format === 'webp');
    const avifVariants = optimizedImage.variants.filter(v => v.format === 'avif');
    const fallbackVariants = optimizedImage.variants.filter(v => v.format === 'jpeg' || v.format === 'png');

    const webpSrcSet = webpVariants.map(v => `${v.url} ${v.width}w`).join(', ');
    const avifSrcSet = avifVariants.map(v => `${v.url} ${v.width}w`).join(', ');
    const fallbackSrcSet = fallbackVariants.map(v => `${v.url} ${v.width}w`).join(', ');

    return `
      <picture>
        ${avifSrcSet ? `<source srcset="${avifSrcSet}" sizes="${optimizedImage.sizes}" type="image/avif">` : ''}
        ${webpSrcSet ? `<source srcset="${webpSrcSet}" sizes="${optimizedImage.sizes}" type="image/webp">` : ''}
        <img 
          src="${optimizedImage.original.url}"
          srcset="${fallbackSrcSet || optimizedImage.original.url}"
          sizes="${optimizedImage.sizes}"
          alt="${alt}"
          ${className ? `class="${className}"` : ''}
          loading="${loading}"
          style="aspect-ratio: ${optimizedImage.aspectRatio}; background-color: ${optimizedImage.dominantColor};"
          width="${optimizedImage.original.width}"
          height="${optimizedImage.original.height}"
        />
      </picture>
    `.trim();
  }

  /**
   * Progressive image loading with intersection observer
   */
  public generateProgressiveLoadingScript(): string {
    return `
      <script>
        if ('IntersectionObserver' in window) {
          const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                const srcset = img.dataset.srcset;
                
                if (src) {
                  img.src = src;
                  img.removeAttribute('data-src');
                }
                
                if (srcset) {
                  img.srcset = srcset;
                  img.removeAttribute('data-srcset');
                }
                
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
                observer.unobserve(img);
              }
            });
          });

          document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
          });
        }
      </script>
    `;
  }

  /**
   * Image optimization metrics
   */
  public async getOptimizationMetrics(originalUrl: string, optimizedImage: OptimizedImage): Promise<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    formatSavings: Record<string, number>;
  }> {
    const originalSize = optimizedImage.original.size;
    const optimizedSize = Math.min(...optimizedImage.variants.map(v => v.size));
    const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;

    const formatSavings: Record<string, number> = {};
    const formats = ['webp', 'avif', 'jpeg', 'png'];
    
    formats.forEach(format => {
      const formatVariants = optimizedImage.variants.filter(v => v.format === format);
      if (formatVariants.length > 0) {
        const avgSize = formatVariants.reduce((sum, v) => sum + v.size, 0) / formatVariants.length;
        formatSavings[format] = originalSize > 0 ? 1 - (avgSize / originalSize) : 0;
      }
    });

    return {
      originalSize,
      optimizedSize,
      compressionRatio,
      formatSavings
    };
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();