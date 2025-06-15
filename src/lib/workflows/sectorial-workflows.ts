// 🤖 Bibliothèque de workflows business sectoriels
// Agent Automation - Workflows de conversion par métier

export interface WorkflowStep {
  id: string;
  nom: string;
  canal: 'email' | 'sms' | 'notification' | 'whatsapp';
  delaiEnvoi: number; // en minutes
  conditions?: Record<string, any>;
  template: {
    sujet?: string;
    contenu: string;
    variables?: string[];
  };
}

export interface WorkflowConfig {
  id: string;
  nom: string;
  secteur: string;
  type: 'devis' | 'contact' | 'relance' | 'nurturing' | 'urgence' | 'suivi';
  description: string;
  declencheurs: {
    evenement: string;
    conditions: Record<string, any>;
  }[];
  etapes: WorkflowStep[];
  metriques: {
    objectifConversion: number;
    tauxConversionCible: number;
    delaiMoyenConversion: number; // en heures
  };
}

// =============================================================================
// 🔨 WORKFLOWS ARTISAN
// =============================================================================

export const workflowsArtisan: WorkflowConfig[] = [
  {
    id: 'artisan-devis-urgent',
    nom: 'Devis Urgent Artisan',
    secteur: 'artisan',
    type: 'devis',
    description: 'Workflow optimisé pour les demandes de devis urgents avec SMS immédiat',
    declencheurs: [
      {
        evenement: 'formulaire_devis_soumis',
        conditions: {
          urgence: true,
          montant_estime: { min: 500 }
        }
      }
    ],
    etapes: [
      {
        id: 'sms-accusé-reception',
        nom: 'SMS Accusé de réception immédiat',
        canal: 'sms',
        delaiEnvoi: 0,
        template: {
          contenu: `Bonjour {{prenom}}, votre demande de devis pour {{type_travaux}} est bien reçue ! Je vous rappelle sous 1h max. - {{nom_entreprise}} {{telephone}}`
        }
      },
      {
        id: 'email-details-projet',
        nom: 'Email détaillé du projet',
        canal: 'email',
        delaiEnvoi: 15,
        template: {
          sujet: 'Votre projet {{type_travaux}} - Détails et prochaines étapes',
          contenu: `
            <h2>Merci {{prenom}} pour votre confiance !</h2>
            <p>Votre demande de devis pour <strong>{{type_travaux}}</strong> est entre de bonnes mains.</p>
            
            <h3>📋 Récapitulatif de votre demande :</h3>
            <ul>
              <li><strong>Type de travaux :</strong> {{type_travaux}}</li>
              <li><strong>Budget indicatif :</strong> {{budget_estime}}€</li>
              <li><strong>Délai souhaité :</strong> {{delai_souhaite}}</li>
              <li><strong>Adresse :</strong> {{adresse}}</li>
            </ul>

            <h3>🏗️ Nos prochaines étapes :</h3>
            <ol>
              <li><strong>Appel sous 1h</strong> pour préciser vos besoins</li>
              <li><strong>Visite technique gratuite</strong> sous 24-48h</li>
              <li><strong>Devis détaillé</strong> sous 48h maximum</li>
            </ol>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎯 Pourquoi nous choisir ?</h3>
              <ul>
                <li>✅ 15 ans d'expérience dans {{secteur_specialite}}</li>
                <li>✅ Garantie décennale + Assurance pro</li>
                <li>✅ Devis gratuit et sans engagement</li>
                <li>✅ Travaux garantis 2 ans</li>
              </ul>
            </div>

            <p><strong>Questions urgentes ?</strong><br>
            📞 {{telephone}}<br>
            📧 {{email_pro}}</p>

            <p>À très bientôt !<br>
            {{signature_artisan}}</p>
          `,
          variables: ['prenom', 'type_travaux', 'budget_estime', 'delai_souhaite', 'adresse', 'secteur_specialite', 'nom_entreprise', 'telephone', 'email_pro', 'signature_artisan']
        }
      },
      {
        id: 'sms-rappel-24h',
        nom: 'SMS de rappel si pas de contact',
        canal: 'sms',
        delaiEnvoi: 1440, // 24h
        conditions: {
          contact_etabli: false
        },
        template: {
          contenu: `{{prenom}}, je n'ai pas réussi à vous joindre pour votre projet {{type_travaux}}. Pouvez-vous me rappeler au {{telephone}} ? Merci ! - {{nom_entreprise}}`
        }
      }
    ],
    metriques: {
      objectifConversion: 65,
      tauxConversionCible: 45,
      delaiMoyenConversion: 72
    }
  },
  {
    id: 'artisan-suivi-chantier',
    nom: 'Suivi de Chantier',
    secteur: 'artisan',
    type: 'suivi',
    description: 'Workflow de suivi client pendant et après les travaux',
    declencheurs: [
      {
        evenement: 'chantier_demarre',
        conditions: {
          statut: 'en_cours'
        }
      }
    ],
    etapes: [
      {
        id: 'sms-debut-chantier',
        nom: 'SMS début de chantier',
        canal: 'sms',
        delaiEnvoi: 0,
        template: {
          contenu: `Bonjour {{prenom}}, nous commençons vos travaux aujourd'hui ! Suivez l'avancement sur : {{lien_suivi}} - {{nom_entreprise}}`
        }
      },
      {
        id: 'notification-etapes',
        nom: 'Notifications étapes importantes',
        canal: 'notification',
        delaiEnvoi: 0,
        template: {
          contenu: `Étape "{{nom_etape}}" terminée pour {{prenom}} - Progression : {{pourcentage}}%`
        }
      },
      {
        id: 'email-fin-travaux',
        nom: 'Email fin de travaux + satisfaction',
        canal: 'email',
        delaiEnvoi: 0,
        conditions: {
          chantier_termine: true
        },
        template: {
          sujet: 'Vos travaux {{type_travaux}} sont terminés ! 🎉',
          contenu: `
            <h2>Félicitations {{prenom}} !</h2>
            <p>Vos travaux de <strong>{{type_travaux}}</strong> sont maintenant terminés.</p>
            
            <h3>📋 Récapitulatif final :</h3>
            <ul>
              <li>Durée des travaux : {{duree_chantier}}</li>
              <li>Garantie : {{garantie_duree}}</li>
              <li>Numéro de dossier : {{numero_dossier}}</li>
            </ul>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>⭐ Votre avis compte !</h3>
              <p>Aidez-nous à améliorer nos services :</p>
              <a href="{{lien_avis}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Laisser un avis</a>
            </div>

            <p><strong>Support après-vente :</strong><br>
            📞 {{telephone}}<br>
            📧 {{email_pro}}</p>

            <p>Merci pour votre confiance !<br>
            {{signature_artisan}}</p>
          `
        }
      }
    ],
    metriques: {
      objectifConversion: 85,
      tauxConversionCible: 90,
      delaiMoyenConversion: 168
    }
  }
];

// =============================================================================
// ⚖️ WORKFLOWS AVOCAT
// =============================================================================

export const workflowsAvocat: WorkflowConfig[] = [
  {
    id: 'avocat-consultation-urgente',
    nom: 'Consultation Juridique Urgente',
    secteur: 'avocat',
    type: 'contact',
    description: 'Workflow pour les demandes de consultation juridique urgente',
    declencheurs: [
      {
        evenement: 'demande_consultation_urgente',
        conditions: {
          urgence: 'high',
          domaine_droit: { in: ['penal', 'commercial', 'famille'] }
        }
      }
    ],
    etapes: [
      {
        id: 'email-accuse-reception',
        nom: 'Email accusé de réception professionnel',
        canal: 'email',
        delaiEnvoi: 0,
        template: {
          sujet: 'Votre demande de consultation juridique - Me {{nom_avocat}}',
          contenu: `
            <div style="font-family: Georgia, serif; line-height: 1.6; color: #333;">
              <header style="border-bottom: 2px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #1a365d; margin: 0;">Me {{nom_avocat}}</h1>
                <p style="margin: 5px 0 0 0; color: #666;">{{titre_avocat}} - Barreau de {{barreau}}</p>
              </header>

              <p>Madame, Monsieur {{nom_client}},</p>

              <p>J'accuse réception de votre demande de consultation en droit <strong>{{domaine_droit}}</strong> datée du {{date_demande}}.</p>

              <div style="background: #f7fafc; border-left: 4px solid #1a365d; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1a365d;">📋 Récapitulatif de votre demande</h3>
                <ul style="margin-bottom: 0;">
                  <li><strong>Domaine juridique :</strong> {{domaine_droit}}</li>
                  <li><strong>Nature de l'affaire :</strong> {{nature_affaire}}</li>
                  <li><strong>Urgence :</strong> {{niveau_urgence}}</li>
                  <li><strong>Consultation souhaitée :</strong> {{type_consultation}}</li>
                </ul>
              </div>

              <h3 style="color: #1a365d;">⚖️ Prochaines étapes</h3>
              <ol>
                <li><strong>Analyse préliminaire</strong> de votre dossier (sous 2h)</li>
                <li><strong>Contact téléphonique</strong> pour préciser vos besoins</li>
                <li><strong>Rendez-vous de consultation</strong> sous 24-48h</li>
              </ol>

              <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #742a2a;"><strong>⚠️ Confidentialité :</strong> Cette communication et tout échange ultérieur sont couverts par le secret professionnel de l'avocat.</p>
              </div>

              <p><strong>Contact cabinet :</strong><br>
              📞 {{telephone_cabinet}}<br>
              📧 {{email_cabinet}}<br>
              📍 {{adresse_cabinet}}</p>

              <p>Dans l'attente de vous rencontrer,</p>
              
              <p style="margin-top: 30px;">
                Me {{nom_avocat}}<br>
                <em>{{titre_avocat}}</em>
              </p>
            </div>
          `,
          variables: ['nom_avocat', 'titre_avocat', 'barreau', 'nom_client', 'domaine_droit', 'date_demande', 'nature_affaire', 'niveau_urgence', 'type_consultation', 'telephone_cabinet', 'email_cabinet', 'adresse_cabinet']
        }
      },
      {
        id: 'sms-rdv-confirme',
        nom: 'SMS confirmation RDV',
        canal: 'sms',
        delaiEnvoi: 120, // 2h
        conditions: {
          rdv_planifie: true
        },
        template: {
          contenu: `RDV confirmé le {{date_rdv}} à {{heure_rdv}} avec Me {{nom_avocat}} - {{adresse_cabinet}}. Apportez vos documents. Cabinet : {{telephone_cabinet}}`
        }
      },
      {
        id: 'email-preparation-rdv',
        nom: 'Email préparation consultation',
        canal: 'email',
        delaiEnvoi: 180, // 3h
        conditions: {
          rdv_planifie: true
        },
        template: {
          sujet: 'Préparation de votre consultation - Me {{nom_avocat}}',
          contenu: `
            <div style="font-family: Georgia, serif; line-height: 1.6; color: #333;">
              <h2 style="color: #1a365d;">Préparation de votre consultation</h2>
              
              <p>Madame, Monsieur {{nom_client}},</p>

              <p>Afin d'optimiser notre entrevue du <strong>{{date_rdv}} à {{heure_rdv}}</strong>, je vous prie de bien vouloir rassembler les documents suivants :</p>

              <h3 style="color: #1a365d;">📄 Documents à apporter</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 5px;">
                {{liste_documents_requis}}
              </div>

              <h3 style="color: #1a365d;">💰 Honoraires de consultation</h3>
              <ul>
                <li>Première consultation : {{tarif_consultation}}€ TTC</li>
                <li>Durée : {{duree_consultation}} minutes</li>
                <li>Modes de paiement : CB, chèque, espèces</li>
              </ul>

              <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Conseil :</strong> Préparez une liste de questions précises pour maximiser l'efficacité de notre entretien.</p>
              </div>

              <p><strong>Accès au cabinet :</strong><br>
              📍 {{adresse_cabinet}}<br>
              🅿️ {{info_parking}}<br>
              🚇 {{info_transport}}</p>

              <p>À très bientôt,</p>
              
              <p>Me {{nom_avocat}}</p>
            </div>
          `
        }
      }
    ],
    metriques: {
      objectifConversion: 75,
      tauxConversionCible: 80,
      delaiMoyenConversion: 48
    }
  },
  {
    id: 'avocat-suivi-dossier',
    nom: 'Suivi de Dossier Juridique',
    secteur: 'avocat',
    type: 'suivi',
    description: 'Workflow de suivi pour les clients avec dossier en cours',
    declencheurs: [
      {
        evenement: 'dossier_ouvert',
        conditions: {
          statut: 'en_cours'
        }
      }
    ],
    etapes: [
      {
        id: 'email-ouverture-dossier',
        nom: 'Email ouverture officielle du dossier',
        canal: 'email',
        delaiEnvoi: 0,
        template: {
          sujet: 'Ouverture de votre dossier n°{{numero_dossier}} - Me {{nom_avocat}}',
          contenu: `
            <div style="font-family: Georgia, serif; line-height: 1.6; color: #333;">
              <h2 style="color: #1a365d;">Ouverture de votre dossier juridique</h2>
              
              <p>Madame, Monsieur {{nom_client}},</p>

              <p>Suite à notre entretien, j'ai le plaisir de vous confirmer l'ouverture de votre dossier :</p>

              <div style="background: #f7fafc; border: 1px solid #cbd5e0; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a365d;">📋 Informations du dossier</h3>
                <ul style="margin-bottom: 0;">
                  <li><strong>Numéro de dossier :</strong> {{numero_dossier}}</li>
                  <li><strong>Objet :</strong> {{objet_dossier}}</li>
                  <li><strong>Date d'ouverture :</strong> {{date_ouverture}}</li>
                  <li><strong>Avocat référent :</strong> Me {{nom_avocat}}</li>
                </ul>
              </div>

              <h3 style="color: #1a365d;">🎯 Plan d'action</h3>
              <ol>
                {{plan_action_detaille}}
              </ol>

              <h3 style="color: #1a365d;">💰 Modalités financières</h3>
              <ul>
                <li>Honoraires convenus : {{honoraires_convenus}}</li>
                <li>Modalités de paiement : {{modalites_paiement}}</li>
                <li>Provision versée : {{provision_versee}}</li>
              </ul>

              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>📞 Votre contact privilégié :</strong><br>
                Pour toute question sur votre dossier :<br>
                {{telephone_direct}} - {{email_direct}}</p>
              </div>

              <p>Je reste à votre disposition pour tout complément d'information.</p>
              
              <p>Me {{nom_avocat}}</p>
            </div>
          `
        }
      }
    ],
    metriques: {
      objectifConversion: 95,
      tauxConversionCible: 98,
      delaiMoyenConversion: 24
    }
  }
];

// =============================================================================
// 🎯 WORKFLOWS COACH
// =============================================================================

export const workflowsCoach: WorkflowConfig[] = [
  {
    id: 'coach-nurturing-prospect',
    nom: 'Nurturing Prospect Coach',
    secteur: 'coach',
    type: 'nurturing',
    description: 'Séquence de maturation pour prospects intéressés par le coaching',
    declencheurs: [
      {
        evenement: 'telechargement_lead_magnet',
        conditions: {
          type_contenu: { in: ['ebook', 'webinar', 'assessment'] }
        }
      }
    ],
    etapes: [
      {
        id: 'email-bienvenue-valeur',
        nom: 'Email de bienvenue + valeur immédiate',
        canal: 'email',
        delaiEnvoi: 0,
        template: {
          sujet: '🎯 Votre transformation commence maintenant, {{prenom}} !',
          contenu: `
            <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Bienvenue {{prenom}} ! 🎉</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Votre parcours de transformation commence ici</p>
              </div>

              <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <p>Bonjour {{prenom}},</p>

                <p>Félicitations pour avoir franchi le premier pas vers <strong>{{objectif_principal}}</strong> !</p>

                <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="margin-top: 0; color: #667eea;">🎯 Votre cadeau de bienvenue :</h3>
                  <p style="margin-bottom: 15px;"><strong>{{titre_cadeau}}</strong></p>
                  <a href="{{lien_cadeau}}" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Accéder maintenant →</a>
                </div>

                <h3 style="color: #667eea;">🚀 Ce qui vous attend dans les prochains jours :</h3>
                <ul style="padding-left: 0; list-style: none;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <strong>Jour 2 :</strong> 📈 Les 3 leviers de transformation personnelle
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <strong>Jour 4 :</strong> 🎯 Votre plan d'action personnalisé
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <strong>Jour 7 :</strong> 💡 Invitation webinar exclusif
                  </li>
                  <li style="padding: 8px 0;">
                    <strong>Jour 10 :</strong> 🤝 Appel découverte offert (si éligible)
                  </li>
                </ul>

                <div style="background: #fff5f5; border: 1px solid #fecdc2; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                  <h4 style="margin-top: 0; color: #e53e3e;">⚡ Action rapide recommandée !</h4>
                  <p style="margin-bottom: 15px;">Prenez 10 minutes maintenant pour faire l'auto-diagnostic :</p>
                  <a href="{{lien_assessment}}" style="background: #e53e3e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Faire le diagnostic →</a>
                </div>

                <p>À très vite pour la suite de votre transformation !</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="margin: 0;"><strong>{{nom_coach}}</strong><br>
                  <em>{{titre_coach}}</em><br>
                  📧 {{email_coach}} | 📱 {{telephone_coach}}</p>
                </div>
              </div>
            </div>
          `,
          variables: ['prenom', 'objectif_principal', 'titre_cadeau', 'lien_cadeau', 'lien_assessment', 'nom_coach', 'titre_coach', 'email_coach', 'telephone_coach']
        }
      },
      {
        id: 'email-contenu-valeur-j2',
        nom: 'Email contenu valeur Jour 2',
        canal: 'email',
        delaiEnvoi: 2880, // 48h
        template: {
          sujet: '📈 {{prenom}}, les 3 leviers qui changent TOUT',
          contenu: `
            <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
              <h2 style="color: #667eea;">Jour 2 : Les 3 leviers de transformation 🚀</h2>
              
              <p>Bonjour {{prenom}},</p>

              <p>Hier, vous avez pris une décision importante. Aujourd'hui, je vais vous révéler <strong>les 3 leviers qui séparent ceux qui réussissent de ceux qui abandonnent</strong>.</p>

              <div style="background: #f8f9ff; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #667eea;">🎯 Levier #1 : La Clarté d'Intention</h3>
                <p>95% des gens échouent car ils n'ont pas défini précisément leur destination. Pas vous.</p>
                <p><strong>Action :</strong> Complétez cette phrase : "Dans 6 mois, je veux être capable de..."</p>
              </div>

              <div style="background: #f0fff4; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #38a169;">⚡ Levier #2 : L'Action Immédiate</h3>
                <p>La motivation sans action est juste de l'émotion. L'action sans motivation devient de la discipline.</p>
                <p><strong>Action :</strong> Identifiez UNE action que vous pouvez faire aujourd'hui.</p>
              </div>

              <div style="background: #fffaf0; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #d69e2e;">🤝 Levier #3 : L'Accompagnement Expert</h3>
                <p>Seul on va plus vite, ensemble on va plus loin. Avec un guide expert, on va plus vite ET plus loin.</p>
                <p><strong>Question :</strong> Quel serait votre niveau dans 6 mois avec le bon accompagnement ?</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; font-weight: bold; color: #667eea;">Prêt(e) pour l'étape suivante ?</p>
                <a href="{{lien_plan_action}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">Créer mon plan d'action →</a>
              </div>

              <p>À demain pour la suite,</p>
              <p><strong>{{nom_coach}}</strong></p>
            </div>
          `
        }
      },
      {
        id: 'email-invitation-appel',
        nom: 'Email invitation appel découverte',
        canal: 'email',
        delaiEnvoi: 14400, // 10 jours
        conditions: {
          engagement_score: { min: 70 }
        },
        template: {
          sujet: '🤝 {{prenom}}, votre appel stratégique offert',
          contenu: `
            <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 10px;">
                <h2 style="margin: 0;">Félicitations {{prenom}} ! 🎉</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Vous êtes éligible pour un appel stratégique offert</p>
              </div>

              <div style="padding: 30px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <p>Bonjour {{prenom}},</p>

                <p>Votre engagement ces derniers jours me montre que vous êtes <strong>vraiment sérieux(se)</strong> concernant {{objectif_principal}}.</p>

                <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #667eea;">🎯 Votre situation actuelle :</h3>
                  <ul>
                    <li>✅ Vous avez téléchargé {{ressource_telechargee}}</li>
                    <li>✅ Vous avez complété l'auto-diagnostic</li>
                    <li>✅ Vous suivez mes conseils quotidiens</li>
                    <li>✅ Votre score d'engagement : {{engagement_score}}/100</li>
                  </ul>
                </div>

                <h3 style="color: #667eea;">🚀 Ce que nous allons accomplir en 30 minutes :</h3>
                <ol>
                  <li><strong>Audit complet</strong> de votre situation actuelle</li>
                  <li><strong>Identification des blocages</strong> qui vous freinent</li>
                  <li><strong>Plan d'action personnalisé</strong> pour les 90 prochains jours</li>
                  <li><strong>Ressources spécifiques</strong> à votre profil</li>
                </ol>

                <div style="background: #e6fffa; border: 1px solid #81e6d9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                  <h4 style="margin-top: 0; color: #234e52;">⏰ Offre limitée</h4>
                  <p style="margin-bottom: 15px;">Cet appel stratégique est normalement facturé 150€.</p>
                  <p style="margin-bottom: 20px; font-weight: bold; color: #234e52;">Il vous est offert car vous faites partie de mes 10% de prospects les plus engagés.</p>
                  <a href="{{lien_reservation_appel}}" style="background: #38b2ac; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Réserver mon créneau →</a>
                </div>

                <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; color: #742a2a; font-size: 14px;"><strong>⚠️ Important :</strong> Seulement 3 créneaux disponibles cette semaine. Premier arrivé, premier servi.</p>
                </div>

                <p>À très bientôt pour cet échange,</p>
                
                <p><strong>{{nom_coach}}</strong><br>
                <em>{{titre_coach}}</em></p>
              </div>
            </div>
          `
        }
      }
    ],
    metriques: {
      objectifConversion: 25,
      tauxConversionCible: 15,
      delaiMoyenConversion: 240
    }
  }
];

// =============================================================================
// 🚰 WORKFLOWS PLOMBIER (Urgence)
// =============================================================================

export const workflowsPlombier: WorkflowConfig[] = [
  {
    id: 'plombier-urgence-24h',
    nom: 'Intervention Urgence 24h/24',
    secteur: 'plombier',
    type: 'urgence',
    description: 'Workflow ultra-rapide pour les urgences plomberie',
    declencheurs: [
      {
        evenement: 'appel_urgence',
        conditions: {
          urgence: true,
          heure: { between: ['00:00', '23:59'] }
        }
      }
    ],
    etapes: [
      {
        id: 'sms-accuse-reception-immediat',
        nom: 'SMS accusé réception immédiat',
        canal: 'sms',
        delaiEnvoi: 0,
        template: {
          contenu: `🚨 URGENCE PLOMBERIE - {{prenom}}, j'ai bien reçu votre appel. J'arrive dans {{delai_intervention}} minutes. En cas d'urgence: coupez l'eau au compteur. {{nom_plombier}} - {{telephone}}`
        }
      },
      {
        id: 'notification-admin-urgence',
        nom: 'Notification admin urgence',
        canal: 'notification',
        delaiEnvoi: 0,
        template: {
          contenu: `🚨 URGENCE: {{type_intervention}} chez {{prenom}} {{nom}} - {{adresse}} - Départ: {{heure_depart}} - Tel: {{telephone_client}}`
        }
      },
      {
        id: 'sms-en-route',
        nom: 'SMS en route vers intervention',
        canal: 'sms',
        delaiEnvoi: 15,
        template: {
          contenu: `{{prenom}}, je suis en route ! Arrivée prévue: {{heure_arrivee}}. Ma camionnette: {{description_vehicule}}. Localisation temps réel: {{lien_geoloc}} - {{nom_plombier}}`
        }
      },
      {
        id: 'sms-intervention-terminee',
        nom: 'SMS intervention terminée',
        canal: 'sms',
        delaiEnvoi: 0,
        conditions: {
          intervention_terminee: true
        },
        template: {
          contenu: `{{prenom}}, votre problème de {{type_intervention}} est résolu ✅ Garantie: {{duree_garantie}}. Facture: {{montant}}€. Merci pour votre confiance ! - {{nom_plombier}}`
        }
      }
    ],
    metriques: {
      objectifConversion: 98,
      tauxConversionCible: 95,
      delaiMoyenConversion: 2
    }
  }
];

// =============================================================================
// 📊 EXPORT ET CONFIGURATION
// =============================================================================

export const workflowsBySector = {
  artisan: workflowsArtisan,
  avocat: workflowsAvocat,
  coach: workflowsCoach,
  plombier: workflowsPlombier
};

export const getAllWorkflows = (): WorkflowConfig[] => {
  return [
    ...workflowsArtisan,
    ...workflowsAvocat,
    ...workflowsCoach,
    ...workflowsPlombier
  ];
};

export const getWorkflowsBySector = (secteur: string): WorkflowConfig[] => {
  return workflowsBySector[secteur as keyof typeof workflowsBySector] || [];
};

export const getWorkflowById = (id: string): WorkflowConfig | undefined => {
  return getAllWorkflows().find(workflow => workflow.id === id);
};