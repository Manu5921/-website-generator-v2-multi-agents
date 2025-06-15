// =============================================================================
// 🔄 WORKFLOWS N8N SECTORIELS
// =============================================================================

export interface N8NWorkflow {
  id: string;
  name: string;
  secteur: string;
  description: string;
  active: boolean;
  nodes: N8NNode[];
  connections: N8NConnection[];
  settings: WorkflowSettings;
  triggers: WorkflowTrigger[];
  variables: Record<string, any>;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8NConnection {
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

export interface WorkflowSettings {
  timezone: string;
  saveExecutionProgress: boolean;
  saveManualExecutions: boolean;
  callerPolicy: string;
  errorWorkflow?: string;
}

export interface WorkflowTrigger {
  event: string;
  conditions: Record<string, any>;
  webhook?: string;
}

// =============================================================================
// 🍽️ WORKFLOW RESTAURANT
// =============================================================================

export const restaurantOrderWorkflow: N8NWorkflow = {
  id: "restaurant-order-workflow",
  name: "Gestion Commandes Restaurant",
  secteur: "restaurant",
  description: "Workflow complet: Commandes → Cuisine → Livraison → Feedback",
  active: true,
  settings: {
    timezone: "Europe/Paris",
    saveExecutionProgress: true,
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner"
  },
  triggers: [
    {
      event: "nouvelle_commande",
      conditions: { source: "site_web" },
      webhook: "/webhook/restaurant/nouvelle-commande"
    }
  ],
  variables: {
    restaurantEmail: "{{$env.RESTAURANT_EMAIL}}",
    twilioSid: "{{$env.TWILIO_SID}}",
    stripeKey: "{{$env.STRIPE_KEY}}"
  },
  nodes: [
    {
      id: "webhook-trigger",
      name: "Nouvelle Commande",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        path: "nouvelle-commande",
        httpMethod: "POST",
        responseMode: "responseNode"
      }
    },
    {
      id: "validate-order",
      name: "Valider Commande",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [450, 300],
      parameters: {
        functionCode: `
// Validation et structuration de la commande
const order = items[0].json;

// Vérifications de base
if (!order.items || order.items.length === 0) {
  throw new Error('Commande vide');
}

// Calcul du total
let total = 0;
order.items.forEach(item => {
  total += item.price * item.quantity;
});

// Structure de sortie
return {
  json: {
    orderId: order.id || Date.now().toString(),
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    items: order.items,
    total: total,
    deliveryAddress: order.delivery?.address,
    isDelivery: !!order.delivery,
    timestamp: new Date().toISOString(),
    status: 'received'
  }
};`
      }
    },
    {
      id: "send-confirmation",
      name: "SMS Confirmation Client",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [650, 200],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.customerPhone}}",
        message: "🍽️ Commande {{$json.orderId}} confirmée ! Temps de préparation estimé: 25min. Merci pour votre confiance !"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "notify-kitchen",
      name: "Notification Cuisine",
      type: "n8n-nodes-base.slack",
      typeVersion: 1,
      position: [650, 300],
      parameters: {
        channel: "#cuisine",
        text: "🔥 NOUVELLE COMMANDE #{{$json.orderId}}\n📞 {{$json.customerName}} - {{$json.customerPhone}}\n🍽️ {{$json.items.length}} plats\n💰 {{$json.total}}€\n{{$json.isDelivery ? '🚗 Livraison: ' + $json.deliveryAddress : '🏪 Sur place'}}"
      },
      credentials: {
        slackApi: "slack_credentials"
      }
    },
    {
      id: "add-to-queue",
      name: "Ajouter File Cuisine",
      type: "n8n-nodes-base.airtable",
      typeVersion: 1,
      position: [850, 300],
      parameters: {
        operation: "create",
        application: "appKitchenQueue",
        table: "Commandes",
        fields: {
          "ID Commande": "={{$json.orderId}}",
          "Client": "={{$json.customerName}}",
          "Téléphone": "={{$json.customerPhone}}",
          "Plats": "={{$json.items.map(i => i.name + ' x' + i.quantity).join(', ')}}",
          "Total": "={{$json.total}}",
          "Type": "={{$json.isDelivery ? 'Livraison' : 'Sur place'}}",
          "Statut": "En préparation",
          "Heure": "={{$json.timestamp}}"
        }
      },
      credentials: {
        airtableApi: "airtable_credentials"
      }
    },
    {
      id: "wait-preparation",
      name: "Attendre Préparation",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [1050, 300],
      parameters: {
        amount: 20,
        unit: "minutes"
      }
    },
    {
      id: "ready-notification",
      name: "SMS Commande Prête",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [1250, 300],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.customerPhone}}",
        message: "✅ {{$json.customerName}}, votre commande #{{$json.orderId}} est prête ! {{$json.isDelivery ? 'Livraison en cours...' : 'Vous pouvez venir la récupérer.'}}"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "delivery-branch",
      name: "Livraison ?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [1450, 300],
      parameters: {
        conditions: {
          boolean: [
            {
              value1: "={{$json.isDelivery}}",
              value2: true
            }
          ]
        }
      }
    },
    {
      id: "assign-delivery",
      name: "Assigner Livreur",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [1650, 200],
      parameters: {
        functionCode: `
// Simulation assignation livreur
const deliveryDrivers = ['Pierre', 'Marie', 'Ahmed'];
const assignedDriver = deliveryDrivers[Math.floor(Math.random() * deliveryDrivers.length)];

return {
  json: {
    ...items[0].json,
    assignedDriver: assignedDriver,
    estimatedDelivery: new Date(Date.now() + 15 * 60000).toISOString()
  }
};`
      }
    },
    {
      id: "delivery-notification",
      name: "SMS Livraison",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [1850, 200],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.customerPhone}}",
        message: "🚗 {{$json.assignedDriver}} livre votre commande ! Arrivée estimée dans 15min à {{$json.deliveryAddress}}"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "delivery-complete",
      name: "Livraison Terminée",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [2050, 200],
      parameters: {
        amount: 15,
        unit: "minutes"
      }
    },
    {
      id: "pickup-complete",
      name: "Retrait Terminé",
      type: "n8n-nodes-base.noOp",
      typeVersion: 1,
      position: [1650, 400],
      parameters: {}
    },
    {
      id: "feedback-request",
      name: "Demande Avis",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [2250, 300],
      parameters: {
        to: "={{$json.customerEmail}}",
        subject: "Comment s'est passée votre commande ? 🌟",
        message: `Bonjour {{$json.customerName}},

J'espère que vous avez apprécié votre repas !

Votre avis compte énormément pour nous. Pourriez-vous prendre 30 secondes pour nous dire comment s'est passée votre expérience ?

⭐⭐⭐⭐⭐ Laisser un avis : [LIEN_AVIS]

Merci et à très bientôt !

L'équipe du restaurant`,
        fromEmail: "{{$env.RESTAURANT_EMAIL}}"
      }
    },
    {
      id: "update-crm",
      name: "Mettre à jour CRM",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [2450, 300],
      parameters: {
        url: "{{$env.CRM_API_URL}}/customers/{{$json.customerEmail}}/orders",
        method: "POST",
        sendHeaders: true,
        headerParameters: {
          "Content-Type": "application/json",
          "Authorization": "Bearer {{$env.CRM_API_KEY}}"
        },
        sendBody: true,
        bodyParameters: {
          orderId: "={{$json.orderId}}",
          total: "={{$json.total}}",
          items: "={{$json.items}}",
          date: "={{$json.timestamp}}",
          status: "completed"
        }
      }
    }
  ],
  connections: [
    { source: "webhook-trigger", sourceOutput: "main", target: "validate-order", targetInput: "main" },
    { source: "validate-order", sourceOutput: "main", target: "send-confirmation", targetInput: "main" },
    { source: "validate-order", sourceOutput: "main", target: "notify-kitchen", targetInput: "main" },
    { source: "notify-kitchen", sourceOutput: "main", target: "add-to-queue", targetInput: "main" },
    { source: "add-to-queue", sourceOutput: "main", target: "wait-preparation", targetInput: "main" },
    { source: "wait-preparation", sourceOutput: "main", target: "ready-notification", targetInput: "main" },
    { source: "ready-notification", sourceOutput: "main", target: "delivery-branch", targetInput: "main" },
    { source: "delivery-branch", sourceOutput: "true", target: "assign-delivery", targetInput: "main" },
    { source: "delivery-branch", sourceOutput: "false", target: "pickup-complete", targetInput: "main" },
    { source: "assign-delivery", sourceOutput: "main", target: "delivery-notification", targetInput: "main" },
    { source: "delivery-notification", sourceOutput: "main", target: "delivery-complete", targetInput: "main" },
    { source: "delivery-complete", sourceOutput: "main", target: "feedback-request", targetInput: "main" },
    { source: "pickup-complete", sourceOutput: "main", target: "feedback-request", targetInput: "main" },
    { source: "feedback-request", sourceOutput: "main", target: "update-crm", targetInput: "main" }
  ]
};

// =============================================================================
// 💇 WORKFLOW COIFFEUR
// =============================================================================

export const coiffeurBookingWorkflow: N8NWorkflow = {
  id: "coiffeur-booking-workflow",
  name: "Gestion Rendez-vous Coiffeur",
  secteur: "coiffeur",
  description: "Workflow: Booking → Rappels → Satisfaction → Relance",
  active: true,
  settings: {
    timezone: "Europe/Paris",
    saveExecutionProgress: true,
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner"
  },
  triggers: [
    {
      event: "nouveau_rdv",
      conditions: { source: "calendly" },
      webhook: "/webhook/coiffeur/nouveau-rdv"
    }
  ],
  variables: {
    salonEmail: "{{$env.SALON_EMAIL}}",
    calendlyToken: "{{$env.CALENDLY_TOKEN}}"
  },
  nodes: [
    {
      id: "calendly-webhook",
      name: "Nouveau RDV Calendly",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        path: "nouveau-rdv",
        httpMethod: "POST"
      }
    },
    {
      id: "extract-appointment",
      name: "Extraire Info RDV",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [450, 300],
      parameters: {
        functionCode: `
const event = items[0].json.payload;

return {
  json: {
    appointmentId: event.uuid,
    clientName: event.invitee.name,
    clientEmail: event.invitee.email,
    clientPhone: event.invitee.text_reminder_number || '',
    service: event.event_type.name,
    datetime: event.start_time,
    duration: event.event_type.duration,
    status: 'confirmed',
    notes: event.invitee.responses ? event.invitee.responses.find(r => r.question.includes('Note'))?.answer : ''
  }
};`
      }
    },
    {
      id: "send-confirmation-email",
      name: "Email Confirmation",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [650, 200],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "✨ Rendez-vous confirmé - {{$json.service}}",
        message: `Bonjour {{$json.clientName}},

Votre rendez-vous est confirmé ! ✨

📅 Date : {{DateTime.fromISO($json.datetime).toFormat('dd/MM/yyyy')}}
🕐 Heure : {{DateTime.fromISO($json.datetime).toFormat('HH:mm')}}
💇 Service : {{$json.service}}
⏱️ Durée : {{$json.duration}} minutes

📍 Adresse du salon : [ADRESSE_SALON]
📞 Téléphone : [TELEPHONE_SALON]

Quelques rappels :
• Merci d'arriver 5 minutes en avance
• En cas d'empêchement, prévenez-nous 24h à l'avance
• N'hésitez pas à nous faire part de vos souhaits !

À très bientôt,
L'équipe du salon`,
        fromEmail: "{{$env.SALON_EMAIL}}"
      }
    },
    {
      id: "add-to-calendar",
      name: "Ajouter au Planning",
      type: "n8n-nodes-base.googleCalendar",
      typeVersion: 1,
      position: [650, 300],
      parameters: {
        operation: "create",
        calendarId: "primary",
        summary: "{{$json.service}} - {{$json.clientName}}",
        start: {
          dateTime: "={{$json.datetime}}"
        },
        description: "Client: {{$json.clientName}}\nTéléphone: {{$json.clientPhone}}\nNotes: {{$json.notes}}"
      },
      credentials: {
        googleCalendarOAuth2: "google_calendar_credentials"
      }
    },
    {
      id: "schedule-reminder-24h",
      name: "Programmer Rappel 24h",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [850, 300],
      parameters: {
        functionCode: `
const appointmentTime = new Date(items[0].json.datetime);
const reminderTime = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);

return {
  json: {
    ...items[0].json,
    reminderTime24h: reminderTime.toISOString(),
    triggerReminder24h: true
  }
};`
      }
    },
    {
      id: "wait-for-24h-reminder",
      name: "Attendre 24h avant RDV",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [1050, 300],
      parameters: {
        amount: 1,
        unit: "days"
      }
    },
    {
      id: "send-24h-reminder",
      name: "SMS Rappel 24h",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [1250, 300],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.clientPhone}}",
        message: "💇 Bonjour {{$json.clientName}} ! Rappel : RDV {{$json.service}} demain à {{DateTime.fromISO($json.datetime).toFormat('HH:mm')}}. Hâte de vous voir ! ✨"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "wait-for-2h-reminder",
      name: "Attendre 2h avant RDV",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [1450, 300],
      parameters: {
        amount: 22,
        unit: "hours"
      }
    },
    {
      id: "send-2h-reminder",
      name: "SMS Rappel 2h",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [1650, 300],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.clientPhone}}",
        message: "⏰ {{$json.clientName}}, votre RDV {{$json.service}} est dans 2h ! À tout à l'heure au salon 💇✨"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "wait-appointment-completion",
      name: "Attendre Fin RDV",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [1850, 300],
      parameters: {
        amount: 2,
        unit: "hours"
      }
    },
    {
      id: "satisfaction-survey",
      name: "Enquête Satisfaction",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [2050, 300],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "Comment s'est passé votre rendez-vous ? 💇⭐",
        message: `Bonjour {{$json.clientName}},

J'espère que vous êtes ravi(e) de votre nouvelle coiffure ! ✨

Votre avis nous aide à nous améliorer chaque jour. Pourriez-vous prendre 1 minute pour répondre à ces questions ?

📝 Enquête satisfaction : [LIEN_ENQUETE]

Questions :
• Êtes-vous satisfait(e) du résultat ?
• Le service a-t-il répondu à vos attentes ?
• Recommanderiez-vous notre salon ?

🎁 En remerciement, recevez -15% sur votre prochain RDV !

Merci beaucoup et à bientôt !
L'équipe du salon`,
        fromEmail: "{{$env.SALON_EMAIL}}"
      }
    },
    {
      id: "wait-for-followup",
      name: "Attendre Relance",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [2250, 300],
      parameters: {
        amount: 6,
        unit: "weeks"
      }
    },
    {
      id: "followup-campaign",
      name: "Campagne Relance",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [2450, 300],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "Il est temps de prendre soin de vous ! 💇✨",
        message: `Bonjour {{$json.clientName}},

Cela fait maintenant 6 semaines depuis votre dernier passage au salon ! 
Il est temps de vous faire plaisir à nouveau 💇

🌟 Offre spéciale client fidèle :
• -20% sur tous nos services
• Shampoing professionnel offert
• Conseil personnalisé gratuit

📅 Réservez votre rendez-vous : [LIEN_CALENDLY]

Cette offre est valable jusqu'à la fin du mois.

À très bientôt pour un nouveau moment de beauté !
L'équipe du salon`,
        fromEmail: "{{$env.SALON_EMAIL}}"
      }
    }
  ],
  connections: [
    { source: "calendly-webhook", sourceOutput: "main", target: "extract-appointment", targetInput: "main" },
    { source: "extract-appointment", sourceOutput: "main", target: "send-confirmation-email", targetInput: "main" },
    { source: "extract-appointment", sourceOutput: "main", target: "add-to-calendar", targetInput: "main" },
    { source: "add-to-calendar", sourceOutput: "main", target: "schedule-reminder-24h", targetInput: "main" },
    { source: "schedule-reminder-24h", sourceOutput: "main", target: "wait-for-24h-reminder", targetInput: "main" },
    { source: "wait-for-24h-reminder", sourceOutput: "main", target: "send-24h-reminder", targetInput: "main" },
    { source: "send-24h-reminder", sourceOutput: "main", target: "wait-for-2h-reminder", targetInput: "main" },
    { source: "wait-for-2h-reminder", sourceOutput: "main", target: "send-2h-reminder", targetInput: "main" },
    { source: "send-2h-reminder", sourceOutput: "main", target: "wait-appointment-completion", targetInput: "main" },
    { source: "wait-appointment-completion", sourceOutput: "main", target: "satisfaction-survey", targetInput: "main" },
    { source: "satisfaction-survey", sourceOutput: "main", target: "wait-for-followup", targetInput: "main" },
    { source: "wait-for-followup", sourceOutput: "main", target: "followup-campaign", targetInput: "main" }
  ]
};

// =============================================================================
// 🔨 WORKFLOW ARTISAN
// =============================================================================

export const artisanQuoteWorkflow: N8NWorkflow = {
  id: "artisan-quote-workflow",
  name: "Gestion Devis Artisan",
  secteur: "artisan",
  description: "Workflow: Demande devis → Chiffrage auto → Suivi → Facturation",
  active: true,
  settings: {
    timezone: "Europe/Paris",
    saveExecutionProgress: true,
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner"
  },
  triggers: [
    {
      event: "demande_devis",
      conditions: { source: "formulaire_site" },
      webhook: "/webhook/artisan/demande-devis"
    }
  ],
  variables: {
    artisanEmail: "{{$env.ARTISAN_EMAIL}}",
    crmApiKey: "{{$env.CRM_API_KEY}}"
  },
  nodes: [
    {
      id: "quote-request-webhook",
      name: "Demande de Devis",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        path: "demande-devis",
        httpMethod: "POST"
      }
    },
    {
      id: "extract-project-info",
      name: "Analyser Demande",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [450, 300],
      parameters: {
        functionCode: `
const request = items[0].json;

// Analyser le type de projet et estimer la complexité
const projectTypes = {
  'renovation': { basePrice: 50, complexity: 1.2 },
  'construction': { basePrice: 80, complexity: 1.5 },
  'plomberie': { basePrice: 40, complexity: 1.0 },
  'electricite': { basePrice: 45, complexity: 1.1 },
  'peinture': { basePrice: 25, complexity: 0.8 }
};

const type = request.projectType || 'renovation';
const surface = parseFloat(request.surface) || 50;
const urgency = request.urgency === 'urgent' ? 1.3 : 1.0;

const estimatedPrice = projectTypes[type].basePrice * surface * projectTypes[type].complexity * urgency;

return {
  json: {
    quoteId: 'DEV-' + Date.now(),
    clientName: request.name,
    clientEmail: request.email,
    clientPhone: request.phone,
    clientAddress: request.address,
    projectType: type,
    description: request.description,
    surface: surface,
    urgency: request.urgency || 'normal',
    estimatedPrice: Math.round(estimatedPrice),
    status: 'received',
    createdAt: new Date().toISOString()
  }
};`
      }
    },
    {
      id: "immediate-response",
      name: "Accusé de Réception",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [650, 200],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "🔨 Demande de devis reçue - Ref: {{$json.quoteId}}",
        message: `Bonjour {{$json.clientName}},

Merci pour votre demande de devis ! 🔨

📋 Référence : {{$json.quoteId}}
🏠 Projet : {{$json.projectType}}
📐 Surface : {{$json.surface}} m²

Votre demande a bien été reçue et analysée.
{{$json.urgency === 'urgent' ? '⚡ Traitement prioritaire (demande urgente)' : ''}}

📞 Un premier retour dans les 2h
📋 Devis détaillé sous 24h
💰 Estimation indicative : {{$json.estimatedPrice}}€ HT

Des questions ? Répondez à cet email ou appelez-nous.

Cordialement,
{{$env.ARTISAN_NAME}}`,
        fromEmail: "{{$env.ARTISAN_EMAIL}}"
      }
    },
    {
      id: "urgent-sms",
      name: "SMS Urgence",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [650, 300],
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{$json.urgency}}",
              value2: "urgent"
            }
          ]
        }
      }
    },
    {
      id: "send-urgent-sms",
      name: "SMS Intervention",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [850, 200],
      parameters: {
        operation: "send",
        from: "{{$env.TWILIO_PHONE}}",
        to: "={{$json.clientPhone}}",
        message: "🚨 {{$json.clientName}}, intervention urgente notée ! Je vous rappelle dans 30min pour {{$json.projectType}}. Devis: {{$json.quoteId}}"
      },
      credentials: {
        twilioApi: "twilio_credentials"
      }
    },
    {
      id: "calculate-detailed-quote",
      name: "Calcul Devis Détaillé",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [850, 300],
      parameters: {
        functionCode: `
const data = items[0].json;

// Base de données des prix (simulation)
const materials = {
  'renovation': [
    { name: 'Matériaux base', price: 15, unit: 'm²' },
    { name: 'Finitions', price: 8, unit: 'm²' }
  ],
  'plomberie': [
    { name: 'Tuyauterie', price: 25, unit: 'm²' },
    { name: 'Raccordements', price: 120, unit: 'forfait' }
  ],
  'electricite': [
    { name: 'Câblage', price: 18, unit: 'm²' },
    { name: 'Tableau électrique', price: 350, unit: 'forfait' }
  ]
};

const labor = {
  'renovation': 35,
  'plomberie': 45,
  'electricite': 40,
  'construction': 50,
  'peinture': 20
};

const projectMaterials = materials[data.projectType] || materials.renovation;
let materialCost = 0;

projectMaterials.forEach(material => {
  if (material.unit === 'm²') {
    materialCost += material.price * data.surface;
  } else {
    materialCost += material.price;
  }
});

const laborCost = (labor[data.projectType] || 35) * data.surface;
const subtotal = materialCost + laborCost;
const markup = subtotal * 0.25; // 25% marge
const total = subtotal + markup;

return {
  json: {
    ...data,
    detailedQuote: {
      materials: projectMaterials,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      markup: Math.round(markup),
      subtotal: Math.round(subtotal),
      total: Math.round(total),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
};`
      }
    },
    {
      id: "generate-pdf-quote",
      name: "Générer PDF Devis",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [1050, 300],
      parameters: {
        url: "{{$env.PDF_GENERATOR_URL}}/generate-quote",
        method: "POST",
        sendHeaders: true,
        headerParameters: {
          "Content-Type": "application/json",
          "Authorization": "Bearer {{$env.PDF_API_KEY}}"
        },
        sendBody: true,
        bodyParameters: {
          template: "artisan-quote",
          data: "={{$json}}"
        }
      }
    },
    {
      id: "send-detailed-quote",
      name: "Envoi Devis Détaillé",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [1250, 300],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "📋 Votre devis détaillé - {{$json.quoteId}}",
        message: `Bonjour {{$json.clientName}},

Comme promis, voici votre devis détaillé ! 📋

🏠 Projet : {{$json.projectType}}
📐 Surface : {{$json.surface}} m²
📍 Adresse : {{$json.clientAddress}}

💰 Résumé du devis :
• Matériaux : {{$json.detailedQuote.materialCost}}€ HT
• Main d'œuvre : {{$json.detailedQuote.laborCost}}€ HT
• Total HT : {{$json.detailedQuote.subtotal}}€
• Total TTC : {{$json.detailedQuote.total}}€

📅 Devis valable jusqu'au {{DateTime.fromISO($json.detailedQuote.validUntil).toFormat('dd/MM/yyyy')}}

📎 Le devis complet est en pièce jointe.

❓ Questions ou modifications ? N'hésitez pas à me contacter !
📞 {{$env.ARTISAN_PHONE}}

Cordialement,
{{$env.ARTISAN_NAME}}`,
        fromEmail: "={{$env.ARTISAN_EMAIL}}",
        attachments: [
          {
            name: "Devis_{{$json.quoteId}}.pdf",
            data: "={{$json.pdfUrl}}"
          }
        ]
      }
    },
    {
      id: "follow-up-schedule",
      name: "Programmer Relance",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [1450, 300],
      parameters: {
        functionCode: `
return {
  json: {
    ...items[0].json,
    followUpDates: {
      firstFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours
      secondFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semaine
      finalFollowUp: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 2 semaines
    }
  }
};`
      }
    },
    {
      id: "wait-3-days",
      name: "Attendre 3 jours",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [1650, 300],
      parameters: {
        amount: 3,
        unit: "days"
      }
    },
    {
      id: "first-followup",
      name: "Première Relance",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [1850, 300],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "🔨 Votre projet {{$json.projectType}} - Avez-vous des questions ?",
        message: `Bonjour {{$json.clientName}},

J'espère que vous avez pu consulter le devis {{$json.quoteId}} pour votre projet {{$json.projectType}}.

Avez-vous des questions ou souhaitez-vous des modifications ?

💡 Je peux vous proposer :
• Des alternatives pour optimiser le budget
• Un échelonnement des travaux
• Des conseils techniques personnalisés

📞 Appelez-moi pour en discuter : {{$env.ARTISAN_PHONE}}

Le devis reste valable jusqu'au {{DateTime.fromISO($json.detailedQuote.validUntil).toFormat('dd/MM/yyyy')}}.

Cordialement,
{{$env.ARTISAN_NAME}}`,
        fromEmail: "={{$env.ARTISAN_EMAIL}}"
      }
    },
    {
      id: "wait-4-more-days",
      name: "Attendre 4 jours",
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [2050, 300],
      parameters: {
        amount: 4,
        unit: "days"
      }
    },
    {
      id: "final-followup",
      name: "Relance Finale",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [2250, 300],
      parameters: {
        to: "={{$json.clientEmail}}",
        subject: "🎯 Dernière chance - Projet {{$json.projectType}}",
        message: `Bonjour {{$json.clientName}},

Votre devis {{$json.quoteId}} expire bientôt ({{DateTime.fromISO($json.detailedQuote.validUntil).toFormat('dd/MM/yyyy')}}).

🎁 Offre spéciale dernière chance :
• -5% sur le montant total
• Garantie étendue à 3 ans
• Conseils d'entretien gratuits

Total avec remise : {{Math.round($json.detailedQuote.total * 0.95)}}€ TTC

Cette offre est valable 48h seulement.

📞 Appelez-moi maintenant : {{$env.ARTISAN_PHONE}}

Cordialement,
{{$env.ARTISAN_NAME}}`,
        fromEmail: "={{$env.ARTISAN_EMAIL}}"
      }
    }
  ],
  connections: [
    { source: "quote-request-webhook", sourceOutput: "main", target: "extract-project-info", targetInput: "main" },
    { source: "extract-project-info", sourceOutput: "main", target: "immediate-response", targetInput: "main" },
    { source: "extract-project-info", sourceOutput: "main", target: "urgent-sms", targetInput: "main" },
    { source: "urgent-sms", sourceOutput: "true", target: "send-urgent-sms", targetInput: "main" },
    { source: "urgent-sms", sourceOutput: "false", target: "calculate-detailed-quote", targetInput: "main" },
    { source: "send-urgent-sms", sourceOutput: "main", target: "calculate-detailed-quote", targetInput: "main" },
    { source: "calculate-detailed-quote", sourceOutput: "main", target: "generate-pdf-quote", targetInput: "main" },
    { source: "generate-pdf-quote", sourceOutput: "main", target: "send-detailed-quote", targetInput: "main" },
    { source: "send-detailed-quote", sourceOutput: "main", target: "follow-up-schedule", targetInput: "main" },
    { source: "follow-up-schedule", sourceOutput: "main", target: "wait-3-days", targetInput: "main" },
    { source: "wait-3-days", sourceOutput: "main", target: "first-followup", targetInput: "main" },
    { source: "first-followup", sourceOutput: "main", target: "wait-4-more-days", targetInput: "main" },
    { source: "wait-4-more-days", sourceOutput: "main", target: "final-followup", targetInput: "main" }
  ]
};

// =============================================================================
// 🔧 GESTIONNAIRE DE WORKFLOWS
// =============================================================================

export class N8NWorkflowManager {
  private static instance: N8NWorkflowManager;
  private workflows: Map<string, N8NWorkflow> = new Map();

  private constructor() {
    this.initializeWorkflows();
  }

  public static getInstance(): N8NWorkflowManager {
    if (!N8NWorkflowManager.instance) {
      N8NWorkflowManager.instance = new N8NWorkflowManager();
    }
    return N8NWorkflowManager.instance;
  }

  private initializeWorkflows(): void {
    this.workflows.set('restaurant-order', restaurantOrderWorkflow);
    this.workflows.set('coiffeur-booking', coiffeurBookingWorkflow);
    this.workflows.set('artisan-quote', artisanQuoteWorkflow);
  }

  public getWorkflowBySector(secteur: string): N8NWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.secteur === secteur);
  }

  public getWorkflow(id: string): N8NWorkflow | undefined {
    return this.workflows.get(id);
  }

  public getAllWorkflows(): N8NWorkflow[] {
    return Array.from(this.workflows.values());
  }

  public exportWorkflow(id: string): string {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow ${id} non trouvé`);
    }
    return JSON.stringify(workflow, null, 2);
  }

  public exportWorkflowsForSector(secteur: string): Record<string, any> {
    const sectorWorkflows = this.getWorkflowBySector(secteur);
    const exported: Record<string, any> = {};
    
    sectorWorkflows.forEach(workflow => {
      exported[workflow.id] = workflow;
    });
    
    return exported;
  }
}

export const n8nWorkflowManager = N8NWorkflowManager.getInstance();