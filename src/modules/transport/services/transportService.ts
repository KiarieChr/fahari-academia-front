import { api } from '../../../services/api';

export interface Route {
  id: number;
  route_code: string;
  route_name: string;
  direction: string;
  vehicle_registration: string;
  driver_name: string;
  driver_phone: string;
  capacity: number;
  fee_model: string;
  status: string;
  active_student_count?: number;
  capacity_percentage?: number;
}

export interface Stop {
  id: number;
  route: number;
  route_name?: string;
  stop_name: string;
  stop_order: number;
  pickup_time?: string;
  dropoff_time?: string;
  zone: string;
  landmark_description?: string;
}

export interface FeeStructure {
  id?: number;
  route: number;
  route_name?: string;
  fee_type: string;
  amount: number;
  billing_cycle: string;
  academic_year: number;
  term: number;
}

export interface StudentAssignment {
  id: number;
  student: string | number;
  student_detail?: any;
  route: number;
  route_detail?: any;
  stop: number;
  stop_detail?: any;
  transport_type: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export const transportService = {
  getRoutes: () => api.get('/api/transport/routes/'),
  createRoute: (data: Partial<Route>) => api.post('/api/transport/routes/', data),
  updateRoute: (id: number, data: Partial<Route>) => api.put(`/api/transport/routes/${id}/`, data),
  deleteRoute: (id: number) => api.delete(`/api/transport/routes/${id}/`),
  getRouteCapacity: (id: number) => api.get(`/api/transport/routes/${id}/capacity/`),
  getFleetVehicles: () => api.get('/api/fleet/vehicles/'),
  getFleetDrivers: () => api.get('/api/fleet/drivers/'),
  getRouteManifest: (id: number) => {
    // We use a direct fetch because api.js might not support downloading blobs cleanly
    const token = localStorage.getItem('academia-token') || localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'academia-token') || '';
    const baseUrl = import.meta.env.PROD ? '' : (window.location.port === '5173' || window.location.port === '3000' ? `${window.location.protocol}//${window.location.hostname}:8000` : import.meta.env.VITE_API_URL || '');
    return fetch(`${baseUrl}/api/transport/routes/${id}/manifest/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to download manifest');
      return res.blob();
    });
  },

  getStops: (routeId?: number) => {
    const url = routeId ? `/api/transport/stops/?route_id=${routeId}` : '/api/transport/stops/';
    return api.get(url);
  },
  createStop: (data: Partial<Stop>) => api.post('/api/transport/stops/', data),
  updateStop: (id: number, data: Partial<Stop>) => api.put(`/api/transport/stops/${id}/`, data),
  deleteStop: (id: number) => api.delete(`/api/transport/stops/${id}/`),

  getFeeStructures: (params?: { route_id?: number; academic_year_id?: number; term_id?: number }) => {
    let url = '/api/transport/fee-structures/';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.route_id) queryParams.append('route_id', params.route_id.toString());
      if (params.academic_year_id) queryParams.append('academic_year', params.academic_year_id.toString());
      if (params.term_id) queryParams.append('term', params.term_id.toString());
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return api.get(url);
  },
  createFeeStructure: (data: Partial<FeeStructure>) => api.post('/api/transport/fee-structures/', data),
  updateFeeStructure: (id: number, data: Partial<FeeStructure>) => api.put(`/api/transport/fee-structures/${id}/`, data),
  deleteFeeStructure: (id: number) => api.delete(`/api/transport/fee-structures/${id}/`),

  getAssignments: (params?: { route_id?: number; is_active?: boolean; search?: string }) => {
    let url = '/api/transport/assignments/';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.route_id) queryParams.append('route_id', params.route_id.toString());
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params.search) queryParams.append('search', params.search);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return api.get(url);
  },
  createAssignment: (data: Partial<StudentAssignment> & { override_capacity?: boolean }) => 
    api.post('/api/transport/assignments/', data),
  deactivateAssignment: (id: number) => 
    api.post(`/api/transport/assignments/${id}/deactivate/`, {}),
  getStudentAssignment: (studentId: string | number) => 
    api.get(`/api/transport/assignments/?student_id=${studentId}&is_active=true`),

  generateCharges: (data: { academic_year_id: number; term_id: number; route_ids?: number[]; due_date?: string; enable_prorating?: boolean }) => 
    api.post('/api/transport/charges/generate-term-charges/', data),
};

