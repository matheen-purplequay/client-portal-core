import { accountsApi, reportsApi, withUser } from './api';

const ROUTES = {
  get_cp_clients:              '/admin/get/clients-from-portal',
  get_all_clients_from_wm:     '/admin/get-all-wm-clients',
  get_company_from_dashboard:  '/admin/client-admin/fetch-company-from-dashboard-by-pid',
  add_company_details:         '/admin/client-admin/new',
  update_company_details:      '/admin/client-admin/update',
  sync_basic_company_details:  '/admin/client-admin/sync-company-basic-details',
  get_all_from_dashboard_db:   '/admin/companies/get/all-from-portal',
};

export const clientsService = {
  getCPClients(body: { user_id: number }) {
    return reportsApi.post(ROUTES.get_cp_clients, withUser(body));
  },

  getAllClientsFromWM() {
    return accountsApi.get(ROUTES.get_all_clients_from_wm);
  },

  getCompanyFromDashboard(body: { project_id: number }) {
    return accountsApi.post(ROUTES.get_company_from_dashboard, withUser(body));
  },

  addCompanyDetails(body: Record<string, unknown>) {
    return accountsApi.post(ROUTES.add_company_details, withUser(body));
  },

  updateCompanyDetails(body: Record<string, unknown>) {
    return accountsApi.post(ROUTES.update_company_details, withUser(body));
  },

  syncBasicCompanyDetails(body: { client_id: number }) {
    return accountsApi.post(ROUTES.sync_basic_company_details, withUser(body));
  },

  getAllClientsFromDashboardDb() {
    return accountsApi.get(ROUTES.get_all_from_dashboard_db);
  },
};
