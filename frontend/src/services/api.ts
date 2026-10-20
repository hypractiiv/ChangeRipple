import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  PagedResponse,
  Project,
  SoftwareComponent,
  GraphData,
  Dependency,
  TestCoverage,
  ChangeRequest,
  AnalysisDetail,
  AnalysisRunSummary,
  ImpactResult,
  SelectedTest,
  HistoryCompareResponse,
  PresetInfo,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('changeripple_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('changeripple_token');
      localStorage.removeItem('changeripple_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  auth: {
    login: async (credentials: { usernameOrEmail: string; password: string }) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return data.data;
    },
    register: async (payload: { username: string; email: string; password: string; fullName: string }) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
      return data.data;
    },
    me: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
      return data.data;
    },
  },

  // Projects
  projects: {
    list: async (search?: string, page = 0, size = 20) => {
      const params: Record<string, unknown> = { page, size };
      if (search) params.search = search;
      const { data } = await apiClient.get<ApiResponse<PagedResponse<Project>>>('/projects', { params });
      return data.data;
    },
    get: async (id: string) => {
      const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
      return data.data;
    },
    create: async (payload: { name: string; description?: string }) => {
      const { data } = await apiClient.post<ApiResponse<Project>>('/projects', payload);
      return data.data;
    },
    update: async (id: string, payload: { name: string; description?: string }) => {
      const { data } = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
      return data.data;
    },
    delete: async (id: string) => {
      await apiClient.delete(`/projects/${id}`);
    },
  },

  // Components
  components: {
    list: async (projectId: string, filters?: { type?: string; criticality?: string; search?: string; page?: number; size?: number }) => {
      const { data } = await apiClient.get<ApiResponse<PagedResponse<SoftwareComponent>>>(`/projects/${projectId}/components`, {
        params: filters,
      });
      return data.data;
    },
    get: async (id: string) => {
      const { data } = await apiClient.get<ApiResponse<SoftwareComponent>>(`/components/${id}`);
      return data.data;
    },
    create: async (projectId: string, payload: Partial<SoftwareComponent>) => {
      const { data } = await apiClient.post<ApiResponse<SoftwareComponent>>(`/projects/${projectId}/components`, payload);
      return data.data;
    },
    update: async (id: string, payload: Partial<SoftwareComponent>) => {
      const { data } = await apiClient.patch<ApiResponse<SoftwareComponent>>(`/components/${id}`, payload);
      return data.data;
    },
    delete: async (id: string) => {
      await apiClient.delete(`/components/${id}`);
    },
  },

  // Dependency Graph
  graph: {
    get: async (projectId: string) => {
      const { data } = await apiClient.get<ApiResponse<GraphData>>(`/projects/${projectId}/graph`);
      return data.data;
    },
    createDependency: async (projectId: string, payload: {
      sourceComponentId: string;
      targetComponentId: string;
      dependencyType: string;
      description?: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<Dependency>>(`/projects/${projectId}/dependencies`, payload);
      return data.data;
    },
    deleteDependency: async (id: string) => {
      await apiClient.delete(`/dependencies/${id}`);
    },
    getTestCoverages: async (projectId: string) => {
      const { data } = await apiClient.get<ApiResponse<TestCoverage[]>>(`/projects/${projectId}/test-coverages`);
      return data.data;
    },
    createTestCoverage: async (projectId: string, payload: {
      testComponentId: string;
      targetComponentId: string;
      coverageType?: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<TestCoverage>>(`/projects/${projectId}/test-coverages`, payload);
      return data.data;
    },
    deleteTestCoverage: async (id: string) => {
      await apiClient.delete(`/test-coverages/${id}`);
    },
  },

  // Change Requests
  changes: {
    list: async (projectId: string, page = 0, size = 20) => {
      const { data } = await apiClient.get<ApiResponse<PagedResponse<ChangeRequest>>>(`/projects/${projectId}/changes`, {
        params: { page, size },
      });
      return data.data;
    },
    get: async (id: string) => {
      const { data } = await apiClient.get<ApiResponse<ChangeRequest>>(`/changes/${id}`);
      return data.data;
    },
    create: async (projectId: string, payload: {
      changedComponentId: string;
      title: string;
      description?: string;
      category: string;
      severity: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<ChangeRequest>>(`/projects/${projectId}/changes`, payload);
      return data.data;
    },
  },

  // Impact Analysis & History
  analysis: {
    run: async (changeRequestId: string) => {
      const { data } = await apiClient.post<ApiResponse<AnalysisDetail>>(`/changes/${changeRequestId}/analyses`);
      return data.data;
    },
    get: async (id: string) => {
      const { data } = await apiClient.get<ApiResponse<AnalysisDetail>>(`/analyses/${id}`);
      return data.data;
    },
    getResults: async (id: string) => {
      const { data } = await apiClient.get<ApiResponse<ImpactResult[]>>(`/analyses/${id}/results`);
      return data.data;
    },
    getTests: async (id: string, strategy: 'BASIC' | 'GREEDY' = 'GREEDY') => {
      const { data } = await apiClient.get<ApiResponse<SelectedTest[]>>(`/analyses/${id}/tests`, {
        params: { strategy },
      });
      return data.data;
    },
    listProjectAnalyses: async (projectId: string, page = 0, size = 20) => {
      const { data } = await apiClient.get<ApiResponse<PagedResponse<AnalysisRunSummary>>>(`/projects/${projectId}/analyses`, {
        params: { page, size },
      });
      return data.data;
    },
    compare: async (runId1: string, runId2: string) => {
      const { data } = await apiClient.post<ApiResponse<HistoryCompareResponse>>('/analyses/compare', {
        runId1,
        runId2,
      });
      return data.data;
    },
  },

  // Presets
  presets: {
    list: async () => {
      const { data } = await apiClient.get<ApiResponse<PresetInfo[]>>('/presets');
      return data.data;
    },
    load: async (key: string) => {
      const { data } = await apiClient.post<ApiResponse<AnalysisDetail>>(`/presets/load/${key}`);
      return data.data;
    },
  },

  // Reports
  reports: {
    downloadMarkdownUrl: (analysisId: string) => `${API_BASE}/analyses/${analysisId}/report/markdown`,
    downloadCsvUrl: (analysisId: string) => `${API_BASE}/analyses/${analysisId}/report/csv`,
  },
};
