import { useState, useEffect } from "react";
import { apiRoutes } from "../../../config/api-routes";
import { getPostData } from "../../../core/utils/helpers/fetch";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import Card from "../../../shell/components/collections/card";
import type { JobReference } from "../dashboard-home";

interface Job {
    jobId: number;
    jobName: string;
    remarks: string;
}


interface InternalReviewJobsProps {
    selectedJob: (job: JobReference) => void;
}

export default function InternalReviewJobs({ selectedJob }: InternalReviewJobsProps) {
    const context = useAppContext();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [firstTimeLoad, setFirstTimeLoad] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRows, setFilteredRows] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firstTimeLoad) {
            setFirstTimeLoad(true);
        }
    }, []);

    // 1. Filtering
    useEffect(() => {
        if (jobs.length > 0) {
            const result = jobs.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredRows(result);
        }
    }, [jobs, searchTerm]);

    useEffect(() => {
        const fetchCounts = async () => {
            // need post fetch
            setIsLoading(true);
            getPostData(apiRoutes.dashboard.internalReviewJobs, {
                id: context?.userData?.project_id,
            }).then((data) => {
                setJobs(data.data);
                setIsLoading(false);
            });
        };
        fetchCounts();
    }, [firstTimeLoad]);

    const handleJobClick = (job: JobReference) => {
        selectedJob(job);
    };

    return (
        <Card title="Internal Review Jobs" subtitle="Click on job name to view more details" enableSearch={true} searchPlaceholder="Search Jobs..." searchValue={searchTerm} onSearchChange={(value) => setSearchTerm(value)} isLoading={isLoading}>
            <div>
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Job Name</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((job, index) => (
                            <tr 
                                key={index} 
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-primary-50 cursor-pointer`}
                                onClick={() => handleJobClick(job)}
                            >
                                <td className="text-sm py-1 px-3 text-left font-medium">{job.jobName}</td>
                                <td className="text-sm py-1 px-3 text-left">{job.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}