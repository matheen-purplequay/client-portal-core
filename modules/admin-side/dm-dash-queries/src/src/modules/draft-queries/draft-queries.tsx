import { useAppContext } from "../../core/utils/stores/AppContext";
import { postDataWithParams } from "../../core/utils/helpers/fetch";
import { apiRoutes } from "../../config/api-routes";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import type { JobQuery } from "../inbox/job-queries/jobs";
import Jobs from "../inbox/job-queries/jobs";

export default function DraftQueries() {
    const context = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [jobQueries, setJobQueries] = useState<JobQuery[]>([]);
    const [selectedJobQuery, setSelectedJobQuery] = useState<JobQuery | null>(null);

    useEffect(() => {
        fetchJobQueries();
    }, []);

    const fetchJobQueries = async () => {
        setIsLoading(true);
        try {
            const data = await postDataWithParams(apiRoutes.queries.get.getDraftQueries, [
                `userId=${context?.userData?.staff_id}`,
                `clientId=0`,

            ]);
            if (data.queries?.length > 0) {
                setJobQueries(data.queries);
                setSelectedJobQuery(null);
            } else {
                setJobQueries([]); // clear old queries if none come back
            }
        } catch (error) {
            console.error("Failed to fetch job queries", error);
        } finally {
            setIsLoading(false);
        }
    };

    // const normalizeDate = (date: any): string => {
    //     if (!date) return "";
    //     if (typeof date === "string") return new Date(date).toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    //     if (typeof date === "object") {
    //         // If it's something like { date: "2025-09-15T00:00:00Z" }
    //         return "-";
    //     }
    //     return String(date);
    // };

    // const handleJobSelected = (jobQuery: JobQuery | null) => {
    //     if (!jobQuery) return;
    //     setSelectedJobQuery(jobQuery);
    // };


    return (
        <div>
            <div>
                {isLoading &&
                    <div className="flex flex-col gap-2 items-center justify-center p-5">
                        <LoaderCircle size={32} className="text-primary animate-spin" />
                        <p>Loading queries...</p>
                    </div>
                }
                {!isLoading && jobQueries && jobQueries.length > 0 && !selectedJobQuery &&
                    <Jobs jobQueries={jobQueries} onRefresh={fetchJobQueries} isRefreshing={false} />
                }

            </div>
        </div>
    );
}