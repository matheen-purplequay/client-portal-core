import { accountsApi, withUser } from './api';

const ROUTES = {
  get_query_approvers:    '/admin/client-admin/queries/query-review/get-query-reviewers',
  add_query_approver:     '/admin/client-admin/queries/query-review/add-query-reviewer',
  remove_query_approver:  '/admin/client-admin/queries/query-review/remove-query-reviewer',
};

export const queriesService = {
  getQueryApprovers(body: { client_id: number }) {
    return accountsApi.post(ROUTES.get_query_approvers, withUser(body));
  },

  addQueryApprovers(body: { client_id: number; user_id: number }) {
    return accountsApi.post(ROUTES.add_query_approver, withUser(body));
  },

  removeQueryApprovers(body: { approver_id: number }) {
    return accountsApi.post(ROUTES.remove_query_approver, withUser(body));
  },
};
