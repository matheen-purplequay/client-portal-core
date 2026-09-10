// Dev Base
// const REPORTS_API_BASE_URL = 'http://localhost:8001/api';
// const WM_API_BASE_URL = `http://172.16.11.9:5064/api`;

//import { report } from "process";

// Production Base
const WM_API_BASE_URL = `https://clientqueryapi.purplequay.com.au/api`;
// const REPORTS_API_BASE_URL = 'https://www.deliveryportal-reportsapi.purplequay.com/api';
const REPORTS_API_BASE_URL = 'https://cpreports.carisma-solutions.com.au/api';


const MOVEMENT_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/business-services`;
const DASHBOARD_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/business-services/dashboard`;
const DASHBOARD_REPORTS_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/business-services/reports`;

const INSTRUCTIONS_API_BASE_URL = `${REPORTS_API_BASE_URL}/client`;
const NOTES_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/notes`;
const CLIENT_API_BASE_URL = `${REPORTS_API_BASE_URL}/client`;
const QUERIES_API_BASE_URL = `${WM_API_BASE_URL}/Query`;

const JOB_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/business-services/job`;

export const apiRoutes = {
    rules: {
        getDashboardRules: `${REPORTS_API_BASE_URL}/client/rules/get-rules-by-project`
    },
    lodgement: {
        getLodgement: `${MOVEMENT_API_BASE_URL}/lodgement/get-lodgement-by-client`,
        getLodgementTable: `${MOVEMENT_API_BASE_URL}/lodgement/get-lodgement-table-by-client`,
    },
    movement: {
        get: `${MOVEMENT_API_BASE_URL}/get-movement`,
        download: `${MOVEMENT_API_BASE_URL}/export-movement`,
        getWithCounts: `${REPORTS_API_BASE_URL}/client/dashboard/get-movement-with-counts`,
        downloadWithCounts: `${REPORTS_API_BASE_URL}/client/dashboard/export-movement-with-counts`,
    },
    instructions: {
        get: `${INSTRUCTIONS_API_BASE_URL}/comments/get`,
        send: `${INSTRUCTIONS_API_BASE_URL}/send-comment`,
        insert: `${INSTRUCTIONS_API_BASE_URL}/comments/insert`,
        commentCodes: `${INSTRUCTIONS_API_BASE_URL}/get-comment-codes`,
    },
    notes: {
        get: `${NOTES_API_BASE_URL}/get-notes`,
        upsert: `${NOTES_API_BASE_URL}/save-note`,
        delete: `${NOTES_API_BASE_URL}/delete-note`,
    },
    queries: {
        get: `${QUERIES_API_BASE_URL}/RetrieveQueries`,
        getQueryTemplates: `${QUERIES_API_BASE_URL}/GetQueryTemplates`,
        getQueryTemplate: `${QUERIES_API_BASE_URL}/GetQueryTemplate/{id}`,
    },
    dashboard: {
        clientJobCount: `${DASHBOARD_API_BASE_URL}/client-current-job-status`,
        internalJobCount: `${DASHBOARD_API_BASE_URL}/internal-current-job-status`,
        jobNamesWithStatus: `${DASHBOARD_API_BASE_URL}/job-names-with-status`,
        internalReviewJobs: `${DASHBOARD_API_BASE_URL}/internal-review-jobs`,
        totalJobStatusCount: `${DASHBOARD_API_BASE_URL}/total-job-status-count`,
        dayWiseStatusCount: `${DASHBOARD_API_BASE_URL}/get-day-wise-job-comparision`,
    },
    reports: {
        tatReport: `${DASHBOARD_REPORTS_API_BASE_URL}/get-tat-reports`,
        exportTatReport: `${DASHBOARD_REPORTS_API_BASE_URL}/export-tat-report`,
    },
    client: {
        get: {
            getVerticals: `${CLIENT_API_BASE_URL}/get-verticals`,
        }
    },
    job: {
        getDetailsById: `${JOB_API_BASE_URL}/get-job-status-history`,
        getJobInformation: `${JOB_API_BASE_URL}/get-job-information`
    }
};
