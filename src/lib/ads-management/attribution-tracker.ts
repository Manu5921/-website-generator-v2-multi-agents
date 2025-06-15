// =============================================================================
// 🎯 ATTRIBUTION TRACKER - SYSTÈME DE TRACKING MULTI-TOUCH
// =============================================================================

import { db } from '@/lib/db';
import { 
  customerJourney, 
  attributionsMultiTouch, 
  contacts, 
  campagnesPublicitaires,
  metriquesCampagnes,
  InsertCustomerJourney,
  InsertAttributionMultiTouch
} from '@/lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Interface pour les données d'événement de tracking
 */
export interface TrackingEventData {
  sessionId: string;
  siteId: string;
  contactId?: string;
  typeEvenement: 'page_view' | 'ad_click' | 'form_submit' | 'conversion' | 'email_open' | 'call' | 'download';
  source?: string;
  medium?: string;
  campagne?: string;
  contenu?: string;
  motCle?: string;
  urlPage?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  valeurEvenement?: number;
  metadonnees?: any;
}

/**
 * Interface pour les données de conversion
 */
export interface ConversionData {
  conversionId: string;
  sessionId: string;
  siteId: string;
  contactId?: string;
  typeConversion: 'purchase' | 'lead' | 'signup' | 'download' | 'call' | 'form_submit';
  valeurConversion: number;
  metadonnees?: any;
}

/**
 * Modèles d'attribution supportés
 */
export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';

class AttributionTracker {
  
  /**
   * Tracker un événement dans le customer journey
   */
  async trackEvent(eventData: TrackingEventData): Promise<string> {
    try {
      // Récupérer l'étape suivante pour cette session
      const lastEvent = await db.select()
        .from(customerJourney)
        .where(eq(customerJourney.sessionId, eventData.sessionId))
        .orderBy(desc(customerJourney.etape))
        .limit(1);

      const nextStep = lastEvent.length > 0 ? lastEvent[0].etape + 1 : 1;

      const journeyEntry: InsertCustomerJourney = {
        sessionId: eventData.sessionId,
        siteId: eventData.siteId,
        contactId: eventData.contactId,
        etape: nextStep,
        typeEvenement: eventData.typeEvenement,
        source: eventData.source,
        medium: eventData.medium,
        campagne: eventData.campagne,
        contenu: eventData.contenu,
        motCle: eventData.motCle,
        urlPage: eventData.urlPage,
        referrer: eventData.referrer,
        userAgent: eventData.userAgent,
        ipAddress: eventData.ipAddress,
        valeurEvenement: eventData.valeurEvenement ? eventData.valeurEvenement.toString() : undefined,
        metadonnees: eventData.metadonnees ? JSON.stringify(eventData.metadonnees) : undefined,
      };

      const [insertedEvent] = await db.insert(customerJourney)
        .values(journeyEntry)
        .returning({ id: customerJourney.id });

      console.log(`✅ Événement tracké: ${eventData.typeEvenement} pour session ${eventData.sessionId}`);
      
      return insertedEvent.id;
    } catch (error) {
      console.error('❌ Erreur tracking événement:', error);
      throw error;
    }
  }

  /**
   * Traiter une conversion et calculer l'attribution
   */
  async processConversion(conversionData: ConversionData, model: AttributionModel = 'linear'): Promise<void> {
    try {
      console.log(`🎯 Traitement conversion ${conversionData.conversionId} avec modèle ${model}`);

      // Récupérer le parcours client pour cette session
      const journey = await db.select()
        .from(customerJourney)
        .where(eq(customerJourney.sessionId, conversionData.sessionId))
        .orderBy(customerJourney.etape);

      if (journey.length === 0) {
        console.warn(`⚠️ Aucun parcours trouvé pour session ${conversionData.sessionId}`);
        return;
      }

      // Filtrer les événements liés aux campagnes publicitaires
      const campaignTouchpoints = journey.filter(event => 
        event.campagne && (event.source === 'google' || event.source === 'facebook' || event.source === 'instagram')
      );

      if (campaignTouchpoints.length === 0) {
        console.log(`📊 Conversion organique détectée pour session ${conversionData.sessionId}`);
        return;
      }

      // Calculer l'attribution selon le modèle choisi
      const attributions = this.calculateAttribution(campaignTouchpoints, conversionData.valeurConversion, model);

      // Sauvegarder les attributions
      for (const attribution of attributions) {
        await this.saveAttribution(attribution, conversionData);
      }

      // Mettre à jour les métriques des campagnes
      await this.updateCampaignMetrics(attributions);

      console.log(`✅ Attribution calculée: ${attributions.length} touchpoints pour conversion ${conversionData.conversionId}`);

    } catch (error) {
      console.error('❌ Erreur traitement conversion:', error);
      throw error;
    }
  }

  /**
   * Calculer l'attribution selon différents modèles
   */
  private calculateAttribution(touchpoints: any[], conversionValue: number, model: AttributionModel): any[] {
    const attributions: any[] = [];

    switch (model) {
      case 'first_touch':
        attributions.push({
          touchpoint: touchpoints[0],
          weight: 1.0,
          attributedValue: conversionValue
        });
        break;

      case 'last_touch':
        attributions.push({
          touchpoint: touchpoints[touchpoints.length - 1],
          weight: 1.0,
          attributedValue: conversionValue
        });
        break;

      case 'linear':
        const linearWeight = 1.0 / touchpoints.length;
        touchpoints.forEach(touchpoint => {
          attributions.push({
            touchpoint,
            weight: linearWeight,
            attributedValue: conversionValue * linearWeight
          });
        });
        break;

      case 'time_decay':
        // Plus récent = plus de poids (décroissance exponentielle)
        const totalTouchpoints = touchpoints.length;
        let totalWeight = 0;
        
        touchpoints.forEach((touchpoint, index) => {
          const weight = Math.pow(2, index); // Poids croissant
          totalWeight += weight;
        });

        touchpoints.forEach((touchpoint, index) => {
          const weight = Math.pow(2, index) / totalWeight;
          attributions.push({
            touchpoint,
            weight,
            attributedValue: conversionValue * weight
          });
        });
        break;

      case 'position_based':
        // 40% premier touchpoint, 40% dernier, 20% réparti sur le milieu
        if (touchpoints.length === 1) {
          attributions.push({
            touchpoint: touchpoints[0],
            weight: 1.0,
            attributedValue: conversionValue
          });
        } else if (touchpoints.length === 2) {
          attributions.push({
            touchpoint: touchpoints[0],
            weight: 0.5,
            attributedValue: conversionValue * 0.5
          });
          attributions.push({
            touchpoint: touchpoints[1],
            weight: 0.5,
            attributedValue: conversionValue * 0.5
          });
        } else {
          // Premier: 40%
          attributions.push({
            touchpoint: touchpoints[0],
            weight: 0.4,
            attributedValue: conversionValue * 0.4
          });

          // Dernier: 40%
          attributions.push({
            touchpoint: touchpoints[touchpoints.length - 1],
            weight: 0.4,
            attributedValue: conversionValue * 0.4
          });

          // Milieu: 20% réparti
          const middleWeight = 0.2 / (touchpoints.length - 2);
          for (let i = 1; i < touchpoints.length - 1; i++) {
            attributions.push({
              touchpoint: touchpoints[i],
              weight: middleWeight,
              attributedValue: conversionValue * middleWeight
            });
          }
        }
        break;

      default:
        // Par défaut: linear
        const defaultWeight = 1.0 / touchpoints.length;
        touchpoints.forEach(touchpoint => {
          attributions.push({
            touchpoint,
            weight: defaultWeight,
            attributedValue: conversionValue * defaultWeight
          });
        });
    }

    return attributions;
  }

  /**
   * Sauvegarder une attribution en base de données
   */
  private async saveAttribution(attribution: any, conversionData: ConversionData): Promise<void> {
    try {
      // Récupérer l'ID de la campagne si elle existe
      let campagneId: string | undefined;
      if (attribution.touchpoint.campagne) {
        const [campagne] = await db.select()
          .from(campagnesPublicitaires)
          .where(eq(campagnesPublicitaires.nom, attribution.touchpoint.campagne))
          .limit(1);
        
        campagneId = campagne?.id;
      }

      const attributionEntry: InsertAttributionMultiTouch = {
        conversionId: conversionData.conversionId,
        sessionId: conversionData.sessionId,
        siteId: conversionData.siteId,
        contactId: conversionData.contactId,
        campagneId,
        modeleAttribution: 'linear', // TODO: utiliser le modèle réel
        poidsAttribution: attribution.weight.toString(),
        valeurAttributee: attribution.attributedValue.toString(),
        ordreEtape: attribution.touchpoint.etape,
        typeConversion: conversionData.typeConversion,
        dateConversion: new Date(),
      };

      await db.insert(attributionsMultiTouch).values(attributionEntry);

    } catch (error) {
      console.error('❌ Erreur sauvegarde attribution:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les métriques des campagnes
   */
  private async updateCampaignMetrics(attributions: any[]): Promise<void> {
    try {
      for (const attribution of attributions) {
        if (attribution.touchpoint.campagne) {
          // Récupérer la campagne
          const [campagne] = await db.select()
            .from(campagnesPublicitaires)
            .where(eq(campagnesPublicitaires.nom, attribution.touchpoint.campagne))
            .limit(1);

          if (campagne) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Vérifier si une métrique existe déjà pour aujourd'hui
            const [existingMetric] = await db.select()
              .from(metriquesCampagnes)
              .where(
                and(
                  eq(metriquesCampagnes.campagneId, campagne.id),
                  gte(metriquesCampagnes.date, today)
                )
              )
              .limit(1);

            if (existingMetric) {
              // Mettre à jour la métrique existante
              await db.update(metriquesCampagnes)
                .set({
                  conversions: sql`${metriquesCampagnes.conversions} + 1`,
                  valeurConversions: sql`${metriquesCampagnes.valeurConversions} + ${attribution.attributedValue}`,
                })
                .where(eq(metriquesCampagnes.id, existingMetric.id));
            } else {
              // Créer une nouvelle métrique
              await db.insert(metriquesCampagnes).values({
                campagneId: campagne.id,
                date: today,
                conversions: 1,
                valeurConversions: attribution.attributedValue.toString(),
                horodatage: new Date(),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques campagne:', error);
      throw error;
    }
  }

  /**
   * Récupérer le rapport d'attribution pour une période
   */
  async getAttributionReport(siteId: string, dateDebut: Date, dateFin: Date): Promise<any> {
    try {
      const attributions = await db.select({
        campagne: campagnesPublicitaires.nom,
        plateforme: campagnesPublicitaires.plateforme,
        conversions: sql<number>`COUNT(*)`,
        valeurTotale: sql<number>`SUM(CAST(${attributionsMultiTouch.valeurAttributee} AS DECIMAL))`,
        modeleAttribution: attributionsMultiTouch.modeleAttribution,
      })
      .from(attributionsMultiTouch)
      .leftJoin(campagnesPublicitaires, eq(attributionsMultiTouch.campagneId, campagnesPublicitaires.id))
      .where(
        and(
          eq(attributionsMultiTouch.siteId, siteId),
          gte(attributionsMultiTouch.dateConversion, dateDebut),
          lte(attributionsMultiTouch.dateConversion, dateFin)
        )
      )
      .groupBy(
        campagnesPublicitaires.nom,
        campagnesPublicitaires.plateforme,
        attributionsMultiTouch.modeleAttribution
      );

      return {
        periode: { debut: dateDebut, fin: dateFin },
        attributions,
        totalConversions: attributions.reduce((sum, attr) => sum + attr.conversions, 0),
        valeurTotale: attributions.reduce((sum, attr) => sum + (attr.valeurTotale || 0), 0),
      };

    } catch (error) {
      console.error('❌ Erreur génération rapport attribution:', error);
      throw error;
    }
  }

  /**
   * Analyser l'efficacité des canaux d'acquisition
   */
  async analyzeChannelEffectiveness(siteId: string, periodeJours: number = 30): Promise<any> {
    try {
      const dateDebut = new Date();
      dateDebut.setDate(dateDebut.getDate() - periodeJours);

      const channelData = await db.select({
        source: customerJourney.source,
        medium: customerJourney.medium,
        touchpoints: sql<number>`COUNT(*)`,
        conversions: sql<number>`COUNT(DISTINCT ${customerJourney.sessionId})`,
        valeurMoyenne: sql<number>`AVG(CAST(${customerJourney.valeurEvenement} AS DECIMAL))`,
      })
      .from(customerJourney)
      .where(
        and(
          eq(customerJourney.siteId, siteId),
          gte(customerJourney.timestamp, dateDebut)
        )
      )
      .groupBy(customerJourney.source, customerJourney.medium);

      return {
        periode: { debut: dateDebut, jours: periodeJours },
        canaux: channelData.map(channel => ({
          ...channel,
          tauxConversion: channel.touchpoints > 0 ? (channel.conversions / channel.touchpoints) * 100 : 0,
          efficacite: channel.valeurMoyenne / Math.max(channel.touchpoints, 1), // ROI simplifié
        }))
      };

    } catch (error) {
      console.error('❌ Erreur analyse efficacité canaux:', error);
      throw error;
    }
  }
}

// Instance singleton
export const attributionTracker = new AttributionTracker();