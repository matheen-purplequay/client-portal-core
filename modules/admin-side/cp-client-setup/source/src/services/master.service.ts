import { reportsApi, withUser } from './api';

const ROUTES = {
  get_dashboard_master:              '/admin/master/dashboard-master/get-dashboard-master',
  get_dashboard_master_by_id:        '/admin/master/dashboard-master/get-dashboard-master-by-id',
  get_primary_job_status:            '/admin/master/job-status/get-primary-job-status',
  get_secondary_job_status:          '/admin/master/job-status/secondary-job-status/get-secondary-job-status',
  map_primary_job_status:            '/admin/master/job-status/secondary-job-status/map-primary-job-status',
  get_mapped_status_list:            '/admin/master/job-status/secondary-job-status/get-mapped-status-list',
  remove_primary_job_status_mapping: '/admin/master/job-status/secondary-job-status/remove-primary-job-status-mapping',
};

export const masterService = {
  getDashboardMaster() {
    return reportsApi.get(ROUTES.get_dashboard_master);
  },

  getDashboardMasterById(body: { dashboard_ids: string }) {
    return reportsApi.post(ROUTES.get_dashboard_master_by_id, withUser(body));
  },

  getPrimaryJobStatus() {
    return reportsApi.get(ROUTES.get_primary_job_status);
  },

  getSecondaryJobStatus() {
    return reportsApi.get(ROUTES.get_secondary_job_status);
  },

  mapPrimaryToSecondaryStatus(body: Record<string, unknown>) {
    return reportsApi.post(ROUTES.map_primary_job_status, withUser(body));
  },

  getMappedStatusList(body: { project_id: number }) {
    return reportsApi.post(ROUTES.get_mapped_status_list, withUser(body));
  },

  removePrimaryStatusMapping(body: { code: number }) {
    return reportsApi.post(ROUTES.remove_primary_job_status_mapping, withUser(body));
  },
};
