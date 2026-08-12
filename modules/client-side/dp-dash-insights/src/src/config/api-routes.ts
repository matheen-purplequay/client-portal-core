// Dev base
const REPORTS_API_BASE_URL = 'http://localhost:8001/api'

// Production base
// const REPORTS_API_BASE_URL = 'https://pqreports.welingkaronline.org/api'

const INSIGHTS_API_BASE_URL = `${REPORTS_API_BASE_URL}/client/dashboard/insights`
// const CLIENT_API_BASE_URL = `${REPORTS_API_BASE_URL}/client`;

export const apiRoutes = {
  insights: {
    keyUpdates: `${INSIGHTS_API_BASE_URL}/key-updates`,
    utilization: `${INSIGHTS_API_BASE_URL}/utilization`,
    feedback: `${INSIGHTS_API_BASE_URL}/feedback`,
    feedbackSummary: `${INSIGHTS_API_BASE_URL}/feedback-summary`,
    appreciation: `${INSIGHTS_API_BASE_URL}/appreciation`,
    getVerticals: `${INSIGHTS_API_BASE_URL}/get-verticals`,
  },
}
