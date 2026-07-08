import { apiFetch } from '../apiClient';
import type { StoredTemplate, Customer } from '../../types';

export interface DashboardData {
  campaigns: StoredTemplate[];
  customers: Customer[];
  pendingRequestCount: number;
}

export async function fetchDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>('/api/v1/dashboard');
}
