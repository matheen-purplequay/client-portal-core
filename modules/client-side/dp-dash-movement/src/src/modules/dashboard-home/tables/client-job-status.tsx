import { useState, useEffect } from "react";
import { apiRoutes } from "../../../config/api-routes";
import { getPostData } from "../../../core/utils/helpers/fetch";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import Card from "../../../shell/components/collections/card";

interface Status {
    name: string;
    clientQueries: number;
    onHold: number;
    review: number;
    wipQueryPartlyResponded: number;
    total?: number;
}

export default function ClientJobStatus() {
    const context = useAppContext();
    const [jobs, setJobs] = useState<Status[]>([]);
    const [firstTimeLoad, setFirstTimeLoad] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRows, setFilteredRows] = useState<Status[]>([]);
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
            getPostData(apiRoutes.dashboard.clientJobCount, {
                id: context?.userData?.project_id,
            }).then((data) => {
                setJobs(data.data);
                setIsLoading(false);
            });
        };
        fetchCounts();
    }, [firstTimeLoad]);

    return (
        <Card title="Current Job Status in Team - Client" enableSearch={true} searchPlaceholder="Search Users..." searchValue={searchTerm} onSearchChange={(value) => setSearchTerm(value)} isLoading={isLoading}>
            <div>
                <div className="space-y-4">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Name</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">Client Queries</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">On Hold</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">Review</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800">WIP-Query Partly Responded</th>
                                <th className="text-xs py-1 px-3 text-right bg-slate-200 text-slate-800 font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((job, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                    <td className="text-sm py-1 px-3 text-left">{job.name}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.clientQueries}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.onHold}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.review}</td>
                                    <td className="text-sm py-1 px-3 text-right">{job.wipQueryPartlyResponded}</td>
                                    <td className="text-sm py-1 px-3 text-right font-bold">{Number(job.clientQueries) + Number(job.onHold) + Number(job.review) + Number(job.wipQueryPartlyResponded)}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-200 font-bold">
                                <td className="text-sm py-1 px-3 text-left">Total</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.clientQueries), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.onHold), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.review), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.wipQueryPartlyResponded), 0)}</td>
                                <td className="text-sm py-1 px-3 text-right">{jobs.reduce((total, count) => Number(total) + Number(count.clientQueries) + Number(count.onHold) + Number(count.review) + Number(count.wipQueryPartlyResponded), 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}