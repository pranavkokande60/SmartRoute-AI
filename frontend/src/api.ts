/**
 * SmartRoute-AI API Client
 * Clean, lightweight HTTP client for interacting with the FastAPI backend.
 */

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('smartroute_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('smartroute_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('smartroute_token');
  localStorage.removeItem('smartroute_user');
}

export function getCurrentUser() {
  const u = localStorage.getItem('smartroute_user');
  return u ? JSON.parse(u) : null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem('smartroute_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// API Functions
export const api = {
  // Auth
  login: (creds: { email: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  getDemoAccounts: () =>
    request<any[]>('/auth/demo-accounts'),
  getMe: () =>
    request<any>('/auth/me'),

  // Dashboard
  getSummary: () =>
    request<any>('/dashboard/summary'),
  getCharts: () =>
    request<any>('/dashboard/charts'),
  getAiSummary: () =>
    request<any>('/dashboard/ai-summary'),

  // Shipments Data (All 10,194 records)
  getShipments: (params?: { search?: string; factory?: string; state?: string; ship_mode?: string; is_delayed?: boolean; is_anomaly?: boolean; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.factory) q.append('factory', params.factory);
    if (params?.state) q.append('state', params.state);
    if (params?.ship_mode) q.append('ship_mode', params.ship_mode);
    if (params?.is_delayed !== undefined) q.append('is_delayed', String(params.is_delayed));
    if (params?.is_anomaly !== undefined) q.append('is_anomaly', String(params.is_anomaly));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.offset) q.append('offset', String(params.offset));
    return request<{ total_count: number; limit: number; offset: number; shipments: any[] }>(`/shipments?${q.toString()}`);
  },

  // Routes
  getRoutes: (params?: { factory?: string; state?: string; tier?: string; bottlenecks_only?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.factory) q.append('factory', params.factory);
    if (params?.state) q.append('state', params.state);
    if (params?.tier) q.append('tier', params.tier);
    if (params?.bottlenecks_only) q.append('bottlenecks_only', 'true');
    return request<any[]>(`/routes?${q.toString()}`);
  },
  getTopBottomRoutes: () =>
    request<any>('/routes/top-bottom'),
  getBottlenecks: () =>
    request<any[]>('/routes/bottlenecks'),
  getRouteDetail: (routeId: string) =>
    request<any>(`/routes/${encodeURIComponent(routeId)}`),

  // Factories & States
  getFactories: () =>
    request<any[]>('/factories'),
  getFactoryDetail: (name: string) =>
    request<any>(`/factories/${encodeURIComponent(name)}`),
  getMapData: () =>
    request<any>('/states/map-data'),
  getStateAnalytics: (stateName: string) =>
    request<any>(`/states/${encodeURIComponent(stateName)}/analytics`),

  // Machine Learning
  predict: (data: any) =>
    request<any>('/ml/predict', { method: 'POST', body: JSON.stringify(data) }),
  getModelsSummary: () =>
    request<any>('/ml/models-summary'),

  // Anomalies & Forecasts
  getAnomalies: () =>
    request<any[]>('/anomalies'),
  getForecasts: () =>
    request<any>('/forecasts'),

  // What-If Simulation
  runSimulation: (data: any) =>
    request<any>('/simulation', { method: 'POST', body: JSON.stringify(data) }),

  // Alerts & Quality
  getAlerts: () =>
    request<any[]>('/alerts'),
  dismissAlert: (id: number) =>
    request<any>(`/alerts/${id}/dismiss`, { method: 'POST' }),
  getQualityReport: () =>
    request<any>('/datasets/quality-report'),

  // PDF Report URL
  getPdfReportUrl: () => `${API_BASE}/reports/generate`,

  // New Order Management
  getNewOrdersReferenceData: () =>
    request<any>('/new-orders/reference-data'),
  getNewOrdersSummary: () =>
    request<any>('/new-orders/summary'),
  getNewOrders: (params?: { search?: string; status?: string; delay_risk?: string; factory?: string; ship_mode?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status && params.status !== 'ALL') q.append('status', params.status);
    if (params?.delay_risk && params.delay_risk !== 'ALL') q.append('delay_risk', params.delay_risk);
    if (params?.factory && params.factory !== 'ALL') q.append('factory', params.factory);
    if (params?.ship_mode && params.ship_mode !== 'ALL') q.append('ship_mode', params.ship_mode);
    return request<any[]>(`/new-orders?${q.toString()}`);
  },
  getNewOrderDetail: (id: number) =>
    request<any>(`/new-orders/${id}`),
  createNewOrder: (data: any) =>
    request<any>('/new-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateNewOrder: (id: number, data: any) =>
    request<any>(`/new-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNewOrder: (id: number) =>
    request<any>(`/new-orders/${id}`, { method: 'DELETE' }),

  // Prediction Performance (Prediction vs Actual)
  getPredictionPerformance: () =>
    request<any>('/predictions/performance'),
  evaluatePrediction: (orderId: number, data: { actual_delivery_date?: string; actual_lead_time_days: number; notes?: string }) =>
    request<any>(`/predictions/${orderId}/evaluate`, { method: 'POST', body: JSON.stringify(data) }),

  // Model Monitoring
  getModelMonitoring: () =>
    request<any>('/models/monitoring'),

  // Prediction Playground
  runPlaygroundPrediction: (data: any) =>
    request<any>('/predictions/playground', { method: 'POST', body: JSON.stringify(data) }),

  // Route Comparison
  compareRoutes: (routeIds: string[]) =>
    request<any>('/routes/compare', { method: 'POST', body: JSON.stringify({ route_ids: routeIds }) }),

  // Notification Center
  getNotifications: (params?: { unread_only?: boolean; severity?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.unread_only) q.append('unread_only', 'true');
    if (params?.severity && params.severity !== 'ALL') q.append('severity', params.severity);
    if (params?.category && params.category !== 'ALL') q.append('category', params.category);
    return request<any>(`/notifications?${q.toString()}`);
  },
  markNotificationRead: (id: number) =>
    request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/read-all', { method: 'POST' }),
  deleteNotification: (id: number) =>
    request<any>(`/notifications/${id}`, { method: 'DELETE' }),
  clearAllNotifications: () =>
    request<any>('/notifications/clear-all', { method: 'DELETE' }),

  // Global Search & Command Palette
  searchGlobal: (query: string) =>
    request<any>(`/search?q=${encodeURIComponent(query)}`),

  // AI Logistics Assistant
  askAssistant: (query: string) =>
    request<any>('/assistant/query', { method: 'POST', body: JSON.stringify({ query }) })
};
