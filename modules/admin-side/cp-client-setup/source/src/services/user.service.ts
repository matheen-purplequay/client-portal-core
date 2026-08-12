import { accountsApi, withUser } from './api';

const ROUTES = {
  get_client_users:              '/admin/client-admin/get-client-users',
  get_wm_client_users:           '/admin/client-admin/get-wm-client-users',
  generate_access:               '/admin/generate-access',
  update_client_user:            '/admin/client-admin/update-client-user',
  remove_client_user:            '/admin/client-admin/remove-client-user',
  check_client_if_exists:        '/admin/check-client-if-exists',
  save_contact_mapping:          '/admin/client-admin/save-wm-client-contact-mapping',
  get_contact_mapping:           '/admin/client-admin/get-wm-client-contact-mapping',
};

export const userService = {
  getClientUsers(body: { company_id: number }) {
    return accountsApi.post(ROUTES.get_client_users, withUser(body));
  },

  generateAccess(body: Record<string, unknown>) {
    return accountsApi.post(ROUTES.generate_access, withUser(body));
  },

  updateClientUser(body: Record<string, unknown>) {
    return accountsApi.post(ROUTES.update_client_user, withUser(body));
  },

  removeClientUser(body: { client_id: number }) {
    return accountsApi.post(ROUTES.remove_client_user, withUser(body));
  },

  checkClientIfExists(body: { email: string }) {
    return accountsApi.post(ROUTES.check_client_if_exists, withUser(body));
  },

  getWMClientUsers(company_id: number) {
    return accountsApi.post(ROUTES.get_wm_client_users, withUser({ company_id }));
  },

  saveContactMapping(body: { primary_cid: number; pid: number; secondary_cids: number[] }) {
    return accountsApi.post(ROUTES.save_contact_mapping, withUser(body));
  },

  getContactMapping(company_id: number, primary_cid: number) {
    return accountsApi.post(ROUTES.get_contact_mapping, withUser({ company_id, primary_cid }));
  },
};
