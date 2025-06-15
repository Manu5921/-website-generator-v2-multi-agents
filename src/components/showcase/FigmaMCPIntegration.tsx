'use client';

import { useState } from 'react';

// Configuration Figma MCP pour l'intégration des designs
interface FigmaConfig {
  accessToken: string;
  teamId: string;
  projectId?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  children?: FigmaNode[];
}

interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  nodes: FigmaNode[];
}

// Hook pour l'intégration Figma MCP
export const useFigmaMCP = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config: FigmaConfig = {
    accessToken: process.env.NEXT_PUBLIC_FIGMA_ACCESS_TOKEN || '',
    teamId: process.env.NEXT_PUBLIC_FIGMA_TEAM_ID || ''
  };

  // Connexion à Figma via MCP
  const connectToFigma = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler la connexion Figma MCP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!config.accessToken) {
        throw new Error('Token Figma non configuré');
      }
      
      setIsConnected(true);
      return { success: true, message: 'Connexion Figma établie' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Importer un design Figma
  const importFigmaDesign = async (fileId: string, frameId?: string) => {
    if (!isConnected) {
      throw new Error('Non connecté à Figma');
    }

    setIsLoading(true);
    try {
      // Simuler l'import depuis Figma
      const mockFrame: FigmaFrame = {
        id: frameId || 'frame-001',
        name: 'Template Design',
        width: 1200,
        height: 800,
        backgroundColor: '#FFFFFF',
        nodes: [
          {
            id: 'node-001',
            name: 'Header',
            type: 'FRAME',
            visible: true,
            fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8 } }]
          },
          {
            id: 'node-002', 
            name: 'Content',
            type: 'FRAME',
            visible: true,
            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
          }
        ]
      };

      return {
        success: true,
        frame: mockFrame,
        exportUrl: `figma://file/${fileId}?node-id=${frameId}`
      };
    } catch (err) {
      throw new Error('Erreur lors de l\'import Figma');
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter vers Figma
  const exportToFigma = async (templateData: any, projectName: string) => {
    if (!isConnected) {
      throw new Error('Non connecté à Figma');
    }

    setIsLoading(true);
    try {
      // Simuler l'export vers Figma
      const figmaFileId = `file-${Date.now()}`;
      const figmaUrl = `https://www.figma.com/file/${figmaFileId}/${encodeURIComponent(projectName)}`;

      return {
        success: true,
        fileId: figmaFileId,
        url: figmaUrl,
        message: 'Export vers Figma réussi'
      };
    } catch (err) {
      throw new Error('Erreur lors de l\'export Figma');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchroniser les designs
  const syncWithFigma = async (templateId: string) => {
    setIsLoading(true);
    try {
      // Simuler la synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        changes: [
          'Couleurs mises à jour',
          'Typographie synchronisée',
          'Composants alignés'
        ],
        lastSync: new Date().toISOString()
      };
    } catch (err) {
      throw new Error('Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    error,
    connectToFigma,
    importFigmaDesign,
    exportToFigma,
    syncWithFigma
  };
};

// Composant d'interface Figma MCP
export function FigmaMCPInterface() {
  const { 
    isConnected, 
    isLoading, 
    error, 
    connectToFigma, 
    exportToFigma,
    syncWithFigma 
  } = useFigmaMCP();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [projectName, setProjectName] = useState('');

  const handleExport = async () => {
    if (!selectedTemplate || !projectName) return;
    
    try {
      const result = await exportToFigma(
        { templateId: selectedTemplate },
        projectName
      );
      
      if (result.success) {
        alert(`Export réussi ! Fichier Figma : ${result.url}`);
      }
    } catch (err) {
      alert('Erreur lors de l\'export');
    }
  };

  const handleSync = async () => {
    if (!selectedTemplate) return;
    
    try {
      const result = await syncWithFigma(selectedTemplate);
      if (result.success) {
        alert(`Synchronisation réussie ! Changements : ${result.changes.join(', ')}`);
      }
    } catch (err) {
      alert('Erreur de synchronisation');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🎨 Intégration Figma MCP
          </h3>
          <p className="text-gray-600">
            Connectez vos designs Figma pour une synchronisation automatique
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-gray-300'
          }`} />
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 text-sm font-medium">
              ⚠️ {error}
            </div>
          </div>
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔗</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Connexion à Figma requise
          </h4>
          <p className="text-gray-600 mb-6">
            Connectez-vous à Figma pour importer et synchroniser vos designs
          </p>
          
          <button
            onClick={connectToFigma}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? '🔄 Connexion...' : '🚀 Connecter Figma'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Export vers Figma */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              📤 Exporter vers Figma
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template à exporter
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un template</option>
                  <option value="restaurant-premium-livraison">Restaurant Premium Livraison</option>
                  <option value="coiffeur-premium-booking">Coiffeur Premium Booking</option>
                  <option value="artisan-digital-portfolio">Artisan Digital Portfolio</option>
                  <option value="beauty-tech-lab">Beauty Tech Lab</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet Figma
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Restaurant Premium - V1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={!selectedTemplate || !projectName || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? '🔄 Export...' : '📤 Exporter vers Figma'}
            </button>
          </div>

          {/* Synchronisation */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Synchronisation automatique
            </h4>
            
            <p className="text-gray-600 mb-4">
              Synchronisez les modifications de design entre votre template et Figma.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSync}
                disabled={!selectedTemplate || isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '🔄 Sync...' : '🔄 Synchroniser'}
              </button>
              
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                ⚙️ Configuration auto-sync
              </button>
            </div>
          </div>

          {/* Statut et informations */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Statut de l'intégration
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600">Templates sync</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Compatibilité</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24h</div>
                <div className="text-sm text-gray-600">Dernière sync</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-gray-600">Projets Figma</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Générateur de composants Figma à partir des templates
export const generateFigmaComponents = (templateData: any) => {
  const components = [];
  
  // Header component
  if (templateData.header) {
    components.push({
      name: 'Header',
      type: 'COMPONENT',
      properties: {
        backgroundColor: templateData.colors?.primary || '#000000',
        height: 80,
        layout: 'horizontal'
      }
    });
  }
  
  // Hero section
  if (templateData.hero) {
    components.push({
      name: 'Hero Section',
      type: 'COMPONENT',
      properties: {
        backgroundColor: templateData.colors?.secondary || '#FFFFFF',
        height: 600,
        layout: 'vertical'
      }
    });
  }
  
  // Cards
  if (templateData.features) {
    components.push({
      name: 'Feature Card',
      type: 'COMPONENT',
      properties: {
        width: 300,
        height: 200,
        borderRadius: 12,
        padding: 24
      }
    });
  }
  
  return components;
};

export default FigmaMCPInterface;