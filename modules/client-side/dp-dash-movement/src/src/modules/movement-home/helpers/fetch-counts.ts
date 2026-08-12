import type { StatusCount } from "../../../core/models/movement";
import type { JobTitle } from "../../../core/models/movement";
import { getPostData } from "../../../core/utils/helpers/fetch";
import { decryptData } from "../../../core/utils/helpers/localStorage";
import type { AppContextType } from "../../../core/utils/stores/AppContext";
import { transformStatusCounts } from "./transform-status-counts";

interface FetchCountsProps {
    setStatusCount: React.Dispatch<React.SetStateAction<StatusCount[]>>;
    context: AppContextType | null;
    vertical_id: number;
    jobTitles: JobTitle[];
    apiRoutes: any;
}

export async function fetchCounts({
    setStatusCount,
    context,
    vertical_id,
    jobTitles,
    apiRoutes,
}: FetchCountsProps) {
    try {
        setStatusCount([]);
        const data = await getPostData(apiRoutes.dashboard.totalJobStatusCount, {
            id: context?.userData?.project_id,
            service_id: vertical_id,
            user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
        });

        if (data?.status && Array.isArray(data.data)) {
            setStatusCount(transformStatusCounts(data.data, jobTitles));
        }
    } catch (err) {
        console.error("Error fetching job status count:", err);
    }
}