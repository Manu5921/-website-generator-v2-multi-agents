'use client';

import { useState, useEffect } from 'react';

// =============================================================================
// 🎼 TYPES ET INTERFACES
// =============================================================================

interface WorkflowExecution {
  id: string;
  projetId: string;
  workflowId: string;
  statut: 'en_attente' | 'en_cours' | 'termine' | 'erreur' | 'timeout';
  etapeActuelle: string;
  etapesTerminees: string[];
  dateDebut: string;
  dateFin?: string;
  tempsEcoule: number;
  erreurs: string[];
}

interface WorkflowTemplate {
  id: string;
  nom: string;
  secteur: string;
  description: string;
  tempsEstime: number;
  nbEtapes: number;
}

interface MetriquesOrchestration {
  projets: {
    total: number;
    actifs: number;
    termines: number;
    erreurs: number;
    progressionMoyenne: number;
  };
  agents: {
    total: number;
    actifs: number;
    offline: number;
    tauxDisponibilite: number;
  };
  performance: {
    tempsMoyenProjet: number;
    tauxReussiteGlobal: number;
    tempsReponseMoyen: number;
  };
}

interface OrchestrationDashboardProps {
  onRefresh?: () => void;
}

// =============================================================================
// 🎼 COMPOSANT PRINCIPAL
// =============================================================================

export default function OrchestrationDashboard({ onRefresh }: OrchestrationDashboardProps) {
  const [executionsActives, setExecutionsActives] = useState<WorkflowExecution[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [metriques, setMetriques] = useState<MetriquesOrchestration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  // =============================================================================
  // 🔄 CHARGEMENT DES DONNÉES
  // =============================================================================

  const chargerDonnees = async () => {
    try {
      setIsLoading(true);

      // Charger les exécutions actives et métriques
      const [responseActifs, responseTemplates] = await Promise.all([
        fetch('/api/orchestration/workflow?action=actifs'),
        fetch('/api/orchestration/workflow?action=templates')
      ]);

      if (responseActifs.ok) {
        const dataActifs = await responseActifs.json();
        if (dataActifs.success) {
          setExecutionsActives(dataActifs.data.executionsActives || []);
          setMetriques(dataActifs.data.metriquesGlobales || null);
        }
      }

      if (responseTemplates.ok) {
        const dataTemplates = await responseTemplates.json();
        if (dataTemplates.success) {
          setWorkflows(dataTemplates.data.workflows || []);
        }
      }

    } catch (error) {
      console.error('Erreur chargement données orchestration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
    
    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(chargerDonnees, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // =============================================================================
  // 🎨 FONCTIONS UTILITAIRES
  // =============================================================================

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'text-blue-400 bg-blue-500/20';
      case 'termine': return 'text-green-400 bg-green-500/20';
      case 'erreur': return 'text-red-400 bg-red-500/20';
      case 'en_attente': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'erreur': return 'Erreur';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  const formatDuree = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}h${mins > 0 ? mins + 'm' : ''}`;
  };

  const calculerProgression = (execution: WorkflowExecution) => {
    if (execution.statut === 'termine') return 100;
    if (execution.statut === 'erreur') return 0;
    
    const workflow = workflows.find(w => w.id === execution.workflowId);
    if (!workflow) return 0;
    
    return Math.round((execution.etapesTerminees.length / workflow.nbEtapes) * 100);
  };

  // =============================================================================
  // 🎯 GESTIONNAIRES D'ÉVÉNEMENTS
  // =============================================================================

  const gererRefresh = () => {
    chargerDonnees();
    if (onRefresh) onRefresh();
  };

  const gererActionWorkflow = async (action: string, projetId: string) => {
    try {
      const response = await fetch('/api/orchestration/workflow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, projetId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          chargerDonnees(); // Recharger les données
          console.log(`Action ${action} réussie:`, result.data.message);
        }
      }
    } catch (error) {
      console.error(`Erreur action ${action}:`, error);
    }
  };

  // =============================================================================
  // 🎨 RENDU DU COMPOSANT
  // =============================================================================

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"></div>
          <span className="ml-3 text-white/60">Chargement orchestration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎼</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Orchestration Multi-Agents</h2>
            <p className="text-sm text-gray-400">Workflow Engine & Coordination</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={gererRefresh}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Actualiser"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.001 8.001 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Métriques globales */}
      {metriques && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="text-2xl font-bold text-indigo-400">{metriques.projets.actifs}</div>
            <div className="text-sm text-gray-400">Projets Actifs</div>
            <div className="text-xs text-gray-500 mt-1">
              {metriques.projets.total} total
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="text-2xl font-bold text-green-400">{metriques.agents.actifs}/{metriques.agents.total}</div>
            <div className="text-sm text-gray-400">Agents Actifs</div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(metriques.agents.tauxDisponibilite)}% disponibilité
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="text-2xl font-bold text-purple-400">{formatDuree(metriques.performance.tempsMoyenProjet)}</div>
            <div className="text-sm text-gray-400">Temps Moyen</div>
            <div className="text-xs text-gray-500 mt-1">
              Par projet
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="text-2xl font-bold text-yellow-400">{Math.round(metriques.performance.tauxReussiteGlobal)}%</div>
            <div className="text-sm text-gray-400">Taux Réussite</div>
            <div className="text-xs text-gray-500 mt-1">
              Global
            </div>
          </div>
        </div>
      )}

      {/* Workflows Templates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Workflows Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {workflows.map(workflow => (
            <div key={workflow.id} className="bg-black/20 rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{workflow.nom}</div>
                  <div className="text-xs text-gray-400 capitalize">{workflow.secteur}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-indigo-400">{formatDuree(workflow.tempsEstime)}</div>
                  <div className="text-xs text-gray-500">{workflow.nbEtapes} étapes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exécutions Actives */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Exécutions en Cours</h3>
          <div className="text-sm text-gray-400">
            {executionsActives.length} workflow{executionsActives.length > 1 ? 's' : ''}
          </div>
        </div>

        {executionsActives.length === 0 ? (
          <div className="bg-black/20 rounded-lg p-6 border border-white/5 text-center">
            <div className="text-gray-400">Aucun workflow en cours</div>
            <div className="text-sm text-gray-500 mt-1">
              Les nouveaux projets apparaîtront ici automatiquement
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {executionsActives.map(execution => {
              const progression = calculerProgression(execution);
              const workflow = workflows.find(w => w.id === execution.workflowId);
              
              return (
                <div 
                  key={execution.id}
                  className="bg-black/20 rounded-lg p-4 border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedExecution(
                    selectedExecution === execution.id ? null : execution.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(execution.statut)}`}>
                        {getStatutText(execution.statut)}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {workflow?.nom || execution.workflowId}
                        </div>
                        <div className="text-sm text-gray-400">
                          Projet {execution.projetId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{progression}%</div>
                        <div className="text-xs text-gray-400">{formatDuree(execution.tempsEcoule)}</div>
                      </div>
                      
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            progression === 100 ? 'bg-green-500' :
                            execution.statut === 'erreur' ? 'bg-red-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${progression}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Détails expandus */}
                  {selectedExecution === execution.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-300">Étape Actuelle</div>
                          <div className="text-white">{execution.etapeActuelle}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-300">Étapes Terminées</div>
                          <div className="text-white">{execution.etapesTerminees.length}</div>
                        </div>
                      </div>
                      
                      {execution.erreurs.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-red-400 mb-2">Erreurs</div>
                          <div className="space-y-1">
                            {execution.erreurs.map((erreur, index) => (
                              <div key={index} className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                                {erreur}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {execution.statut === 'en_cours' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              gererActionWorkflow('pause_workflow', execution.projetId);
                            }}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        
                        {execution.statut === 'erreur' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              gererActionWorkflow('reprendre_workflow', execution.projetId);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            Relancer
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Ouvrir le détail du projet
                            window.open(`/dashboard-v2?project=${execution.projetId}`, '_blank');
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
                        >
                          Voir Détails
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}