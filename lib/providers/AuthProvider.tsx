'use client';

import { useAuthSync } from '@/lib/hooks/useAuthSync';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}
