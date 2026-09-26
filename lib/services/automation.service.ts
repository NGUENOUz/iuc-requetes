import { DatabaseSchema, getLocalDB, saveLocalDB, generateUUID } from '@/lib/db/json-db';

export interface ProcessedRequestResult {
  isAutoResolved: boolean;
  assignedAgent: any | null;
  statusId: string;
  statusName: string;
  metadata: Record<string, any>;
  systemComment?: string;
  userNotification: { title: string; message: string; type: 'info' | 'success' | 'warning' };
  agentNotification?: { agentId: string; title: string; message: string };
}

/**
 * MOTEUR D'AUTOMATISATION ET D'AUTO-ROUTAGE IUC
 * Élimine les goulots d'étranglement humains :
 * 1. Auto-résolution et délivrance instantanée de documents certifiés.
 * 2. Auto-routage et équilibrage de charge dynamique vers le meilleur agent.
 */
export function processRequestAutomation(
  newRequest: {
    id: string;
    reference: string;
    student_id: string;
    category_id: string;
    priority_id: string;
    service_id?: string | null;
    title: string;
    description: string;
  },
  db: DatabaseSchema
): ProcessedRequestResult {
  const category = db.request_categories.find((c) => c.id === newRequest.category_id);
  const requester = db.users.find((u) => u.id === newRequest.student_id);
  const serviceId = category?.service_id || newRequest.service_id;

  const statusResolved = db.request_statuses.find((s) => s.name === 'Résolue') || { id: 'd1a2c3d4-0006-4000-8000-000000000006', name: 'Résolue' };
  const statusAssigned = db.request_statuses.find((s) => s.name === 'Assignée') || { id: 'd1a2c3d4-0003-4000-8000-000000000003', name: 'Assignée' };
  const statusPending = db.request_statuses.find((s) => s.name === 'En attente') || { id: 'd1a2c3d4-0002-4000-8000-000000000002', name: 'En attente' };

  // ═══════════════════════════════════════════════════════════════
  // 1. AUTO-RÉSOLUTION INSTANTANÉE (Délivrance de document en 3s)
  // ═══════════════════════════════════════════════════════════════
  if (category?.is_auto_resolvable) {
    const documentCode = `${category.auto_document_type === 'attestation_travail' ? 'ATT-TRAV' : 'CERT-IUC'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrVerificationUrl = `/api/verify/${documentCode}`;

    const metadata = {
      auto_resolved: true,
      auto_resolved_at: new Date().toISOString(),
      document_type: category.auto_document_type || 'certificat',
      document_code: documentCode,
      qr_verification_url: qrVerificationUrl,
      requester_name: `${requester?.first_name || ''} ${requester?.last_name || ''}`,
      requester_matricule: requester?.matricule || '',
      filiere_or_fonction: requester?.filiere || requester?.fonction || '',
    };

    return {
      isAutoResolved: true,
      assignedAgent: null,
      statusId: statusResolved.id,
      statusName: statusResolved.name,
      metadata,
      systemComment: `🤖 [Délivrance Automatisée] Votre document officiel (${category.name}) a été généré avec succès par le système. Réf: ${documentCode}. Vous pouvez le visualiser et le télécharger immédiatement avec le QR Code de certification.`,
      userNotification: {
        title: 'Document certifié prêt !',
        message: `Votre demande d'${category.name.toLowerCase()} a été traitée et validée instantanément.`,
        type: 'success',
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. AUTO-ROUTAGE INTELLIGENT (Load Balancing dynamique des agents)
  // ═══════════════════════════════════════════════════════════════
  if (serviceId) {
    // Trouver tous les agents actifs du service
    const serviceAgents = db.users.filter((u) => {
      const isAgentRole = db.roles.find((r) => r.id === u.role_id)?.name === 'agent';
      return isAgentRole && u.service_id === serviceId && u.is_active;
    });

    if (serviceAgents.length > 0) {
      // Calculer le nombre de requêtes non résolues pour chaque agent
      const resolvedStatusIds = db.request_statuses.filter((s) => s.is_closed).map((s) => s.id);

      const agentWorkloads = serviceAgents.map((agent) => {
        const activeCount = db.requests.filter(
          (r) => r.assigned_to === agent.id && !resolvedStatusIds.includes(r.status_id)
        ).length;
        return { agent, activeCount };
      });

      // Trier par charge la plus faible
      agentWorkloads.sort((a, b) => a.activeCount - b.activeCount);
      const chosenAgent = agentWorkloads[0].agent;

      return {
        isAutoResolved: false,
        assignedAgent: chosenAgent,
        statusId: statusAssigned.id,
        statusName: statusAssigned.name,
        metadata: {
          auto_routed: true,
          routed_at: new Date().toISOString(),
          routing_algorithm: 'smart-load-balance',
          agent_load_at_assignment: agentWorkloads[0].activeCount,
        },
        systemComment: `⚡ [Auto-Routage Intelligent] Requête analysée et affectée automatiquement à ${chosenAgent.first_name} ${chosenAgent.last_name} (${category?.name || 'Service'}).`,
        userNotification: {
          title: 'Requête prise en charge',
          message: `Votre requête a été directement confiée à ${chosenAgent.first_name} ${chosenAgent.last_name}.`,
          type: 'info',
        },
        agentNotification: {
          agentId: chosenAgent.id,
          title: 'Nouvelle requête auto-assignée',
          message: `Une requête "${newRequest.title}" vous a été attribuée automatiquement.`,
        },
      };
    }
  }

  // Si aucun agent n'est immédiatement disponible pour ce service
  return {
    isAutoResolved: false,
    assignedAgent: null,
    statusId: statusPending.id,
    statusName: statusPending.name,
    metadata: {
      auto_routed: false,
      awaiting_dispatch: true,
    },
    userNotification: {
      title: 'Requête enregistrée',
      message: 'Votre requête a bien été enregistrée et est en attente d\'attribution.',
      type: 'info',
    },
  };
}
