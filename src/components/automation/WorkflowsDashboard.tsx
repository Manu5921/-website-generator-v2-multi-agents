'use client';

// 🤖 Dashboard Workflows Automation
// Interface de gestion des workflows business sectoriels

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowNom: string;
  secteur: string;
  contactNom: string;
  statutExecution: 'en_cours' | 'termine' | 'echoue' | 'suspendu';
  etapeActuelle: number;
  totalEtapes: number;
  dateDebut: string;
  dateFin?: string;
  erreurs?: any;
}

interface RealtimeMetrics {
  total: number;
  enCours: number;
  termines: number;
  echecs: number;
  tauxConversionGlobal: number;
  activite1h: {
    executions: number;
    conversions: number;
  };
  topWorkflows: Array<{
    nom: string;
    secteur: string;
    executions: number;
    tauxReussite: number;
  }>;
}

export default function WorkflowsDashboard() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSecteur, setSelectedSecteur] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const secteurs = ['all', 'artisan', 'avocat', 'coach', 'plombier', 'restaurant', 'beaute', 'medical'];

  useEffect(() => {
    loadData();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSecteur]);

  const loadData = async () => {
    try {
      // Charger les métriques temps réel
      const metricsResponse = await fetch('/api/analytics/conversions?format=realtime');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      // Charger les exécutions
      const executionsResponse = await fetch(`/api/workflows/execute${selectedSecteur !== 'all' ? `?secteur=${selectedSecteur}` : ''}`);
      if (executionsResponse.ok) {
        const executionsData = await executionsResponse.json();
        setExecutions(executionsData.data.executions.map((exec: any) => ({
          id: exec.execution.id,
          workflowId: exec.execution.workflowId,
          workflowNom: exec.workflow?.nom || 'Workflow inconnu',
          secteur: exec.workflow?.secteur || 'Unknown',
          contactNom: exec.contact?.nom || 'Contact inconnu',
          statutExecution: exec.execution.statutExecution,
          etapeActuelle: exec.execution.etapeActuelle,
          totalEtapes: 5, // À calculer dynamiquement
          dateDebut: exec.execution.dateDebut,
          dateFin: exec.execution.dateFin,
          erreurs: exec.execution.erreurs
        })));
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  const handleExecuteAction = async (executionId: string, action: string) => {
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          executionId
        })
      });

      if (response.ok) {
        await loadData(); // Recharger les données
      }
    } catch (error) {
      console.error(`Erreur ${action}:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return 'bg-blue-500';
      case 'termine': return 'bg-green-500';
      case 'echoue': return 'bg-red-500';
      case 'suspendu': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'echoue': return 'Échec';
      case 'suspendu': return 'Suspendu';
      default: return status;
    }
  };

  const getSecteurIcon = (secteur: string) => {
    switch (secteur) {
      case 'artisan': return '🔨';
      case 'avocat': return '⚖️';
      case 'coach': return '🎯';
      case 'plombier': return '🚰';
      case 'restaurant': return '🍽️';
      case 'beaute': return '💄';
      case 'medical': return '⚕️';
      default: return '🏢';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows Automation</h1>
          <p className="text-gray-600">Gestion des workflows business automatisés</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedSecteur}
            onChange={(e) => setSelectedSecteur(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {secteurs.map(secteur => (
              <option key={secteur} value={secteur}>
                {secteur === 'all' ? 'Tous les secteurs' : secteur}
              </option>
            ))}
          </select>
          <Button onClick={loadData} variant="outline">
            🔄 Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques temps réel */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exécutions</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-gray-600">
                +{metrics.activite1h.executions} dernière heure
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <span className="text-2xl">⚡</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.enCours}</div>
              <p className="text-xs text-gray-600">Workflows actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.tauxConversionGlobal}%</div>
              <p className="text-xs text-gray-600">Global tous secteurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Échecs</CardTitle>
              <span className="text-2xl">❌</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.echecs}</div>
              <p className="text-xs text-gray-600">Workflows échoués</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Workflows */}
      {metrics && metrics.topWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Workflows Actifs</CardTitle>
            <CardDescription>Les workflows les plus performants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topWorkflows.map((workflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSecteurIcon(workflow.secteur)}</span>
                    <div>
                      <div className="font-semibold">{workflow.nom}</div>
                      <div className="text-sm text-gray-600">Secteur: {workflow.secteur}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{workflow.tauxReussite}%</div>
                    <div className="text-sm text-gray-600">{workflow.executions} exécutions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des exécutions */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Exécutions en cours</CardTitle>
          <CardDescription>
            {executions.length} workflow{executions.length > 1 ? 's' : ''} 
            {selectedSecteur !== 'all' && ` (secteur: ${selectedSecteur})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune exécution en cours
              </div>
            ) : (
              executions.map((execution) => (
                <div key={execution.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getSecteurIcon(execution.secteur)}</span>
                      <div>
                        <div className="font-semibold">{execution.workflowNom}</div>
                        <div className="text-sm text-gray-600">
                          Contact: {execution.contactNom} • {execution.secteur}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(execution.statutExecution)}>
                      {getStatusLabel(execution.statutExecution)}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{execution.etapeActuelle}/{execution.totalEtapes}</span>
                    </div>
                    <Progress 
                      value={(execution.etapeActuelle / execution.totalEtapes) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Débuté: {new Date(execution.dateDebut).toLocaleString('fr-FR')}
                      {execution.dateFin && (
                        <span> • Terminé: {new Date(execution.dateFin).toLocaleString('fr-FR')}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {execution.statutExecution === 'en_cours' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteAction(execution.id, 'pause')}
                          >
                            ⏸️ Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteAction(execution.id, 'execute_next')}
                          >
                            ⏭️ Suivant
                          </Button>
                        </>
                      )}
                      
                      {execution.statutExecution === 'suspendu' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteAction(execution.id, 'resume')}
                        >
                          ▶️ Reprendre
                        </Button>
                      )}
                      
                      {execution.statutExecution === 'echoue' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteAction(execution.id, 'retry')}
                        >
                          🔄 Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleExecuteAction(execution.id, 'stop')}
                      >
                        ⏹️ Arrêter
                      </Button>
                    </div>
                  </div>

                  {execution.erreurs && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="text-sm text-red-800">
                        <strong>Erreur:</strong> {JSON.stringify(execution.erreurs)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}