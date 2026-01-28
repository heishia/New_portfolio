import { useEffect } from 'react';
import { initAnalytics } from '@/app/lib/analytics/tracker';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Analytics 초기화
    initAnalytics({
      endpoint: `${API_BASE}/api/analytics/collect`,
      trackScrollDepth: true,
      trackTimeOnPage: true,
      trackExitIntent: true,
      respectDNT: true
    });
  }, []);

  return <>{children}</>;
}
