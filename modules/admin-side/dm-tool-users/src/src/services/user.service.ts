import { accountsApi, reportsApi, withUser } from './api';
import type { GenerateInternalAccessPayload } from '@/types';

const ROUTES = {
  get_users:               '/admin/get-users',
  get_wm_internal_users:   '/admin/get-internal-wm-users',
  generate_internal_access: '/admin/generate-internal-access',
  get_user_wise_clients:   '/admin/client-map/get-user-wise-client',
};

export const userService = {
  getUsers(body: { works_manager_client_id: number }) {
    return accountsApi.post(ROUTES.get_users, withUser(body));
  },

  getWMInternalUsers() {
    return accountsApi.get(ROUTES.get_wm_internal_users);
  },

  generateInternalAccess(body: GenerateInternalAccessPayload) {
    return accountsApi.post(ROUTES.generate_internal_access, withUser(body as unknown as Record<string, unknown>));
  },

  getUserWiseClient(body: { user_id: number }) {
    return reportsApi.post(ROUTES.get_user_wise_clients, withUser(body));
  },
};
