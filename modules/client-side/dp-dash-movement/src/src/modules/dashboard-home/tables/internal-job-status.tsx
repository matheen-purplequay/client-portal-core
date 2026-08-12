import { useEffect, useState } from "react";
import Card from "../../../shell/components/collections/card";
import { apiRoutes } from "../../../config/api-routes";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import { getPostData } from "../../../core/utils/helpers/fetch";

interface JobRow {
    jobId: number;
    name: string;
    jobIn: number;
    wipProcessing: number;
    queryResponses: number;
    wipClientQueryReviews: number;
    internalReview: number;
    total?: number;
}

export default function InternalJobStatus() {
    const context = useAppContext();
    const [jobs, setJobs] = useState<JobRow[]>([]);
    const [firstTimeLoad, setFirstTimeLoad] = useState(false);
    const [filteredRows, setFilteredRows] = useState<JobRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
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
            getPostData(apiRoutes.dashboard.internalJobCount, {
                id: context?.userData?.project_id,
            }).then((data) => {
                setJobs(data.data);
                setIsLoading(false);
            });
        };
        fetchCounts();
    }, [firstTimeLoad]);

    return (
        <Card title="Current Job Status in Team - Internal" 
            subtitle=""
            enableSearch={true} 
            searchPlaceholder="Search Accountant..." 
            searchValue={searchTerm} 
            onSearchChange={(value) => setSearchTerm(value)}
            isLoading={isLoading}
        >
            <div>
                <div className="space-y-4">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Accountant</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">Job In</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">WIP Processing</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">Query Responses</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">WIP Client Query Reviews</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800 font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((job, index) => (
                                <tr 
                                    key={index} 
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                                >
                                    <td className="text-sm py-1 px-3 text-left">{job.name}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.jobIn}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.wipProcessing}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.queryResponses}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.wipClientQueryReviews}</td>
                                    <td className="text-sm py-1 px-3 text-right font-bold">{Number(job.jobIn) + Number(job.wipProcessing) + Number(job.queryResponses) + Number(job.wipClientQueryReviews)}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-200 font-bold">
                                <td className="text-sm py-1 px-3 text-left">Total</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.jobIn), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.wipProcessing), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.queryResponses), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.wipClientQueryReviews), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.jobIn) + Number(count.wipProcessing) + Number(count.queryResponses) + Number(count.wipClientQueryReviews), 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}