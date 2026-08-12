import { accountsApi, reportsApi, withUser } from './api';
import type { TeamsPayload } from '@/types';

const ROUTES = {
  get_verticals:          '/admin/get-verticals',
  get_roles:              '/admin/get-roles',
  get_teams:              '/admin/get-team',
  get_self_users:         '/admin/get-self-users',
  get_team_users:         '/admin/get-team-users',
  add_team:               '/admin/add-team',
  toggle_status_team:     '/admin/team-member-toggle-status',
  delete_team:            '/admin/team-member-delete',
};

export const teamsService = {
  getVerticals() {
    return reportsApi.get(ROUTES.get_verticals);
  },

  getRoles(body: { type: string[]; category: string[] }) {
    return reportsApi.post(ROUTES.get_roles, withUser(body));
  },

  getTeams(body: { client_id: number }) {
    return reportsApi.post(ROUTES.get_teams, withUser(body));
  },

  getSelfUsers(body: Record<string, unknown> = {}) {
    return accountsApi.post(ROUTES.get_self_users, withUser(body));
  },

  getTeamUsers(body: Record<string, unknown> = {}) {
    return accountsApi.post(ROUTES.get_team_users, withUser(body));
  },

  addToTeam(body: TeamsPayload) {
    return reportsApi.post(ROUTES.add_team, withUser(body as unknown as Record<string, unknown>));
  },

  toggleStatusTeamMember(body: { team_id: number }) {
    return reportsApi.post(ROUTES.toggle_status_team, withUser(body));
  },

  deleteTeamMember(body: { team_id: number }) {
    return reportsApi.post(ROUTES.delete_team, withUser(body));
  },
};
