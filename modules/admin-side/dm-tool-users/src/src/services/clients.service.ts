import { reportsApi, withUser } from './api';

const ROUTES = {
  get_cp_clients: '/admin/get/clients-from-portal',
};

export const clientsService = {
  getCPClients(body: { user_id: number }) {
    return reportsApi.post(ROUTES.get_cp_clients, withUser(body));
  },
};
