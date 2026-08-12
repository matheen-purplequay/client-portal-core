// Dev Base
// const REPORTS_API_BASE_URL = 'http://localhost:8001/api';
// const WM_API_BASE_URL = `http://172.16.11.9:5064/api`;

// Production Base
// const ACCOUNTS_API_BASE_URL = "https://www.deliveryportal-accountsapi.purplequay.com/api";
// const REPORTS_API_BASE_URL = "https://www.deliveryportal-reportsapi.purplequay.com/api";

const ACCOUNTS_API_BASE_URL = "https://pqaccountsapi.welingkaronline.org/api";
const REPORTS_API_BASE_URL = "https://pqreports.welingkaronline.org/api";
const WM_API_BASE_URL = `https://clientqueryapi.purplequay.com.au/api`;
//const WM_API_BASE_URL = `https://localhost:44389/api`;

const QUERIES_API_URL = `${WM_API_BASE_URL}/Query`;
const CLIENT_ADMIN_QUERIES_URL = `${ACCOUNTS_API_BASE_URL}/admin/client-admin/queries`;
const QUERY_REVIEW_URL = `${CLIENT_ADMIN_QUERIES_URL}/query-review`;
const REPORTS_QUERIES_API_URL = `${REPORTS_API_BASE_URL}/admin/queries`;

export const apiRoutes = {
  queries: {
    get: {
      get: `${QUERIES_API_URL}/RetrieveQueries`,
      // getQueryStatistics: `${QUERIES_API_URL}/GetQueryCounts`,
      getQueryStatistics: `${REPORTS_QUERIES_API_URL}/get-query-statistics`,
      getJobQueries: `${QUERIES_API_URL}/RetrieveAdminJobDetails`,
      getQueries: `${QUERIES_API_URL}/RetrieveQueriesAdmin`,
      getSubQueries: `${QUERIES_API_URL}/RetrieveAllSubQueries`,
      getDraftQueries: `${QUERIES_API_URL}/GetDraftQueries`,
      getRejectedQueries: `${REPORTS_API_BASE_URL}/admin/queries/get-rejected-queries`,
      getDraftSubQueries: `${REPORTS_QUERIES_API_URL}/get-draft-sub-queries`,
    },
    insert: {
      sendQuery: `${QUERIES_API_URL}/InsertQueryDocLinkData`,
      sendSubQuery: `${QUERIES_API_URL}/InsertSubQueryDocLinkData`,
    },
    update: {
      updateQuery: `${QUERIES_API_URL}/UpdateQueryStatus`,
      approveDraftQuery: `${QUERIES_API_URL}/ApproveDraftQuery`,
      rejectDraftQuery: `${QUERIES_API_URL}/RejectDraftQuery`,
    },
    review: {
      getQueryReviewers: `${QUERY_REVIEW_URL}/get-query-reviewers`,
    },
  },
  client: {
    get: {
      getVerticals: `${REPORTS_API_BASE_URL}/client/get-verticals`,
      getClientUsers: `${ACCOUNTS_API_BASE_URL}/wm-api/get-cp-users`,
      getClientsFromPortal: `${REPORTS_API_BASE_URL}/admin/get/clients-from-portal`,
    },
  },
  templates: {
    get: {
      getQueryTemplates: `${QUERIES_API_URL}/GetQueryTemplates`,
      getQueryTemplate: `${QUERIES_API_URL}/GetQueryTemplate/{id}`,
      getQueryTemplatesById: `${REPORTS_API_BASE_URL}/query-templates/get-query-templates`,
    },
    insert: {
      insertQueryTemplate: `${REPORTS_API_BASE_URL}/query-templates/save-query-template`,
      insertQueryTemplatesExcel: `${REPORTS_API_BASE_URL}/query-templates/save-query-templates-excel`,
    },
    update: {
      updateQueryTemplate: `${QUERIES_API_URL}/UpdateQueryTemplate`,
    },
  },
  master: {
    getAllMasters: `${QUERIES_API_URL}/RetrieveAllMasters`,
    getMasterById: `${QUERIES_API_URL}/RetrieveMastersById`,
    getMastersByGroup: `${REPORTS_API_BASE_URL}/admin/queries/master/get-master-data`,
    checkExcelMasters: `${REPORTS_API_BASE_URL}/query-templates/check-excel-masters`,
    addMasterData: `${REPORTS_API_BASE_URL}/query-templates/add-master-data`,
  },
  permission: {
    isApprover: `${REPORTS_QUERIES_API_URL}/check-if-user-is-approver`,
  },
};
