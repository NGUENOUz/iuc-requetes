'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { useRequests, useStatistics, useNotifications } from '@/lib/hooks/useData';

export function DashboardExample() {
  // Accéder à l'utilisateur depuis Zustand
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Récupérer les données avec React Query
  const { data: requests, isLoading: requestsLoading } = useRequests();
  const { data: stats, isLoading: statsLoading } = useStatistics();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <h1>Bienvenue {user?.first_name} {user?.last_name}</h1>
      <p>Email: {user?.email}</p>
      <p>Matricule: {user?.matricule}</p>
      <p>Rôle: {user?.role?.name}</p>

      <div>
        <h2>Statistiques</h2>
        {statsLoading ? (
          <p>Chargement...</p>
        ) : (
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        )}
      </div>

      <div>
        <h2>Mes requêtes</h2>
        {requestsLoading ? (
          <p>Chargement...</p>
        ) : (
          <ul>
            {requests?.map((req) => (
              <li key={req.id}>{req.title} - {req.status}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Notifications ({notifications?.filter(n => !n.is_read).length})</h2>
        {notificationsLoading ? (
          <p>Chargement...</p>
        ) : (
          <ul>
            {notifications?.slice(0, 5).map((notif) => (
              <li key={notif.id}>
                {notif.is_read ? '✓' : '•'} {notif.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
