import { reportsApi, withUser } from './api';

const ROUTES = {
  get_roles: '/admin/get-roles',
};

export const teamsService = {
  getRoles(body: { type: string[]; category: string[] }) {
    return reportsApi.post(ROUTES.get_roles, withUser(body));
  },
};
