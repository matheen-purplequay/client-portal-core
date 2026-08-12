import axios from 'axios';
import { getUserData } from '@/stores/userStore';

// ── Environment ──────────────────────────────────────────────────

const ACCOUNTS_SERVER = import.meta.env.VITE_ACCOUNTS_SERVER ?? '';
const REPORTS_SERVER  = import.meta.env.VITE_REPORTS_SERVER  ?? '';
const WM_API_SERVER   = import.meta.env.VITE_WM_API_SERVER   ?? '';

// ── Axios instances ──────────────────────────────────────────────

function createInstance(baseURL: string) {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
}

export const accountsApi = createInstance(ACCOUNTS_SERVER);
export const reportsApi  = createInstance(REPORTS_SERVER);
export const wmApi       = createInstance(WM_API_SERVER);

// ── Helper: inject logged_in_user into POST body ─────────────────

export function withUser<T extends Record<string, unknown>>(body: T) {
  const user = getUserData();
  if (!user) return body;
  return { ...body, logged_in_user: user };
}
