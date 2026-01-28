/**
 * 경량 Analytics 트래킹 스크립트
 * 특징: ~2KB, 쿠키리스, 프라이버시 우선
 */

interface AnalyticsConfig {
  endpoint: string;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  trackExitIntent?: boolean;
  respectDNT?: boolean;
}

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private sessionId: string = '';
  private visitorId: string = '';
  private pageLoadTime: number = 0;
  private maxScrollDepth: number = 0;
  private lastActivityTime: number = 0;

  constructor(config: AnalyticsConfig) {
    this.config = {
      trackScrollDepth: true,
      trackTimeOnPage: true,
      trackExitIntent: true,
      respectDNT: true,
      ...config
    };

    // DNT 체크
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      console.log('[Analytics] DNT enabled, tracking disabled');
      return;
    }

    this.sessionId = this.getOrCreateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.pageLoadTime = Date.now();
    this.lastActivityTime = Date.now();

    this.init();
  }

  private init(): void {
    this.trackPageView();

    if (this.config.trackScrollDepth) this.setupScrollTracking();
    if (this.config.trackTimeOnPage) this.setupTimeTracking();
    if (this.config.trackExitIntent) this.setupExitIntentTracking();
    
    this.setupSPATracking();
  }

  private getOrCreateSessionId(): string {
    const KEY = '_as_sid';
    const TIMEOUT = 30 * 60 * 1000;
    
    try {
      const stored = sessionStorage.getItem(KEY);
      if (stored) {
        const { id, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < TIMEOUT) {
          sessionStorage.setItem(KEY, JSON.stringify({ id, timestamp: Date.now() }));
          return id;
        }
      }
    } catch {}

    const newId = this.generateId();
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ id: newId, timestamp: Date.now() }));
    } catch {}
    return newId;
  }

  private getOrCreateVisitorId(): string {
    const KEY = '_as_vid';
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) return stored;
      
      const newId = this.generateId();
      localStorage.setItem(KEY, newId);
      return newId;
    } catch {
      return this.generateId();
    }
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getUTMParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
      const value = params.get(key);
      if (value) utm[key.replace('utm_', '')] = value;
    });
    return utm;
  }

  trackPageView(): void {
    this.send({
      type: 'pageview',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      screen: { width: window.screen.width, height: window.screen.height },
      timestamp: Date.now(),
      utm: this.getUTMParams()
    });
    this.pageLoadTime = Date.now();
    this.maxScrollDepth = 0;
  }

  trackEvent(name: string, data?: Record<string, unknown>): void {
    this.send({
      type: 'event',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      name,
      data,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  private setupScrollTracking(): void {
    let lastMilestone = 0;
    const trackScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = scrollPercent;
        
        const milestones = [25, 50, 75, 100];
        for (const m of milestones) {
          if (scrollPercent >= m && lastMilestone < m) {
            this.trackEvent('scroll_depth', { depth: m });
            lastMilestone = m;
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', this.throttle(trackScroll, 500), { passive: true });
  }

  private setupTimeTracking(): void {
    const updateActivity = () => { this.lastActivityTime = Date.now(); };
    
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      window.addEventListener(event, this.throttle(updateActivity, 1000), { passive: true });
    });

    window.addEventListener('beforeunload', () => {
      const duration = Math.round((Date.now() - this.pageLoadTime) / 1000);
      const activeTime = Math.round((this.lastActivityTime - this.pageLoadTime) / 1000);
      
      this.sendBeacon({
        type: 'leave',
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        url: window.location.href,
        duration,
        activeTime,
        scrollDepth: this.maxScrollDepth,
        timestamp: Date.now()
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackEvent('tab_hidden', {
          duration: Math.round((Date.now() - this.pageLoadTime) / 1000)
        });
      }
    });
  }

  private setupExitIntentTracking(): void {
    let triggered = false;
    document.addEventListener('mouseout', (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY < 10 && e.relatedTarget === null) {
        triggered = true;
        this.trackEvent('exit_intent', {
          scrollDepth: this.maxScrollDepth,
          timeOnPage: Math.round((Date.now() - this.pageLoadTime) / 1000)
        });
      }
    });
  }

  private setupSPATracking(): void {
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };
    window.addEventListener('popstate', () => this.trackPageView());
  }

  private send(data: unknown): void {
    if (navigator.sendBeacon) {
      this.sendBeacon(data);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.config.endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
  }

  private sendBeacon(data: unknown): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(this.config.endpoint, blob);
  }

  private throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): T {
    let inThrottle = false;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  }
}

let tracker: AnalyticsTracker | null = null;

export function initAnalytics(config: AnalyticsConfig): AnalyticsTracker {
  tracker = new AnalyticsTracker(config);
  return tracker;
}

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  tracker?.trackEvent(name, data);
}

export default AnalyticsTracker;
