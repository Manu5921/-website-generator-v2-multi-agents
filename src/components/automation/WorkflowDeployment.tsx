'use client';

// 🚀 Composant de déploiement automatique des workflows
// Interface pour déployer des workflows business par secteur

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getWorkflowsBySector } from '@/lib/workflows/sectorial-workflows';

interface DeploymentResult {
  success: boolean;
  data?: {
    secteur: string;
    siteId: string;
    total: number;
    successes: number;
    failures: number;
    details: Array<{
      workflowId: string;
      nom: string;
      success: boolean;
      error?: string;
    }>;
  };
  error?: string;
}

interface WorkflowDeploymentProps {
  siteId: string;
  secteur: string;
  onDeploymentComplete?: (result: DeploymentResult) => void;
}

export default function WorkflowDeployment({ siteId, secteur, onDeploymentComplete }: WorkflowDeploymentProps) {
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  
  // Récupérer les workflows disponibles pour le secteur
  const availableWorkflows = getWorkflowsBySector(secteur);

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === availableWorkflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(availableWorkflows.map(w => w.id));
    }
  };

  const handleDeploySelected = async () => {
    if (selectedWorkflows.length === 0) {
      alert('Veuillez sélectionner au moins un workflow');
      return;
    }

    setDeploying(true);
    setDeploymentResult(null);

    try {
      const results = [];
      
      for (const workflowId of selectedWorkflows) {
        try {
          const response = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'deploy',
              workflowId,
              siteId,
              configuration: {
                autoTriggers: true,
                channels: ['email', 'sms'],
                urgency: 'medium'
              }
            })
          });

          const result = await response.json();
          const workflow = availableWorkflows.find(w => w.id === workflowId);
          
          results.push({
            workflowId,
            nom: workflow?.nom || 'Workflow inconnu',
            success: result.success,
            error: result.error
          });
        } catch (error) {
          const workflow = availableWorkflows.find(w => w.id === workflowId);
          results.push({
            workflowId,
            nom: workflow?.nom || 'Workflow inconnu',
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }

      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;

      const deploymentResult: DeploymentResult = {
        success: successes > 0,
        data: {
          secteur,
          siteId,
          total: results.length,
          successes,
          failures,
          details: results
        }
      };

      setDeploymentResult(deploymentResult);
      onDeploymentComplete?.(deploymentResult);

    } catch (error) {
      const errorResult: DeploymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setDeploymentResult(errorResult);
      onDeploymentComplete?.(errorResult);
    } finally {
      setDeploying(false);
    }
  };

  const handleDeployAll = async () => {
    setDeploying(true);
    setDeploymentResult(null);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto_deploy_sector',
          secteur,
          siteId
        })
      });

      const result = await response.json();
      setDeploymentResult(result);
      onDeploymentComplete?.(result);

    } catch (error) {
      const errorResult: DeploymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setDeploymentResult(errorResult);
      onDeploymentComplete?.(errorResult);
    } finally {
      setDeploying(false);
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

  const getWorkflowTypeColor = (type: string) => {
    switch (type) {
      case 'devis': return 'bg-blue-100 text-blue-800';
      case 'contact': return 'bg-green-100 text-green-800';
      case 'relance': return 'bg-yellow-100 text-yellow-800';
      case 'nurturing': return 'bg-purple-100 text-purple-800';
      case 'urgence': return 'bg-red-100 text-red-800';
      case 'suivi': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSecteurIcon(secteur)}</span>
            Déploiement Workflows - {secteur}
          </CardTitle>
          <CardDescription>
            Site ID: {siteId} • {availableWorkflows.length} workflow{availableWorkflows.length > 1 ? 's' : ''} disponible{availableWorkflows.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Actions de déploiement */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedWorkflows.length === availableWorkflows.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </Button>
                <span className="text-sm text-gray-600 self-center">
                  {selectedWorkflows.length}/{availableWorkflows.length} sélectionné{selectedWorkflows.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleDeploySelected}
                  disabled={deploying || selectedWorkflows.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {deploying ? '🔄 Déploiement...' : '🚀 Déployer sélection'}
                </Button>
                <Button
                  onClick={handleDeployAll}
                  disabled={deploying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {deploying ? '🔄 Déploiement...' : '⚡ Déployer tout'}
                </Button>
              </div>
            </div>

            {/* Liste des workflows disponibles */}
            <div className="space-y-3">
              {availableWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedWorkflows.includes(workflow.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectWorkflow(workflow.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedWorkflows.includes(workflow.id)}
                        onChange={() => handleSelectWorkflow(workflow.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-semibold">{workflow.nom}</div>
                        <div className="text-sm text-gray-600">{workflow.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getWorkflowTypeColor(workflow.type)}>
                        {workflow.type}
                      </Badge>
                      <div className="text-right text-sm">
                        <div className="text-green-600 font-semibold">
                          {workflow.metriques.tauxConversionCible}% conversion
                        </div>
                        <div className="text-gray-500">
                          {workflow.etapes.length} étapes
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Détails du workflow */}
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-2">
                      <span>📧 Email</span>
                      {workflow.etapes.some(e => e.canal === 'sms') && <span>📱 SMS</span>}
                      {workflow.etapes.some(e => e.canal === 'notification') && <span>🔔 Notifications</span>}
                      {workflow.etapes.some(e => e.canal === 'whatsapp') && <span>📲 WhatsApp</span>}
                    </div>
                    <div className="mt-1">
                      Délai moyen: {workflow.metriques.delaiMoyenConversion}h • 
                      Objectif: {workflow.metriques.objectifConversion}% conversion
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {availableWorkflows.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun workflow prédéfini disponible pour le secteur {secteur}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats du déploiement */}
      {deploymentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {deploymentResult.success ? '✅' : '❌'}
              Résultats du déploiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deploymentResult.success && deploymentResult.data ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Déploiement réussi !</strong> {deploymentResult.data.successes} workflow{deploymentResult.data.successes > 1 ? 's' : ''} déployé{deploymentResult.data.successes > 1 ? 's' : ''} 
                    sur {deploymentResult.data.total} au total.
                    {deploymentResult.data.failures > 0 && (
                      <span className="text-red-600"> ({deploymentResult.data.failures} échec{deploymentResult.data.failures > 1 ? 's' : ''})</span>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold">Détails par workflow :</h4>
                  {deploymentResult.data.details.map((detail, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        detail.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{detail.success ? '✅' : '❌'}</span>
                        <span className="font-medium">{detail.nom}</span>
                      </div>
                      {detail.error && (
                        <span className="text-sm text-red-600">{detail.error}</span>
                      )}
                    </div>
                  ))}
                </div>

                {deploymentResult.data.successes > 0 && (
                  <Alert>
                    <AlertDescription>
                      🎯 <strong>Prochaines étapes :</strong>
                      <ul className="mt-2 list-disc list-inside text-sm">
                        <li>Les workflows sont maintenant actifs et prêts à recevoir des déclencheurs</li>
                        <li>Les formulaires de contact déclencheront automatiquement les workflows appropriés</li>
                        <li>Surveillez les métriques de conversion dans le dashboard analytics</li>
                        <li>Ajustez les templates si nécessaire selon les performances</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  <strong>Erreur de déploiement :</strong> {deploymentResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}