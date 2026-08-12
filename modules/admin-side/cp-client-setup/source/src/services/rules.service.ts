import { reportsApi, withUser } from './api';

const ROUTES = {
  get_rule_master:         '/admin/rules/client-portal-rules/get-rule-master',
  get_rules:               '/admin/rules/client-portal-rules/get-rules',
  set_rules_by_client:     '/admin/rules/client-portal-rules/set-rules',
  save_rules_by_client:    '/admin/rules/save-rules-by-client',
  reset_rules_for_client:  '/admin/rules/reset-rules-for-client',
};

export const rulesService = {
  getRuleMaster() {
    return reportsApi.get(ROUTES.get_rule_master);
  },

  getRules(body: { client_id: number; vertical_id: number; dashboard_id: number }) {
    return reportsApi.post(ROUTES.get_rules, withUser(body));
  },

  setRulesByClient(body: Record<string, unknown>) {
    return reportsApi.post(ROUTES.set_rules_by_client, withUser(body));
  },

  saveRulesByClient(body: Record<string, unknown>) {
    return reportsApi.post(ROUTES.save_rules_by_client, withUser(body));
  },

  resetRulesForClient(body: { client_id: number }) {
    return reportsApi.post(ROUTES.reset_rules_for_client, withUser(body));
  },
};
