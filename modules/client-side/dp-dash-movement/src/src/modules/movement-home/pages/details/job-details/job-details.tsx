import { Toolbar } from "../../../../../shell/components/collections/toolbar";
import { Contact } from "lucide-react";
import { useEffect, useState } from "react";
import { JobInformation } from "../job-information/job-information";
import { InfoCard } from "../../../../components/collections/user-card";
import { getPostData } from "../../../../../core/utils/helpers/fetch";
import { apiRoutes } from "../../../../../config/api-routes";

interface JobDetailsProps<T extends Record<string, any>> {
    job: T;
    jobUnselected: (job: T) => void;
}

export interface JobStatus {
    Aid: number,
    JobDescription: string,
    NewWorkStatus: string,
    OldWsid: number,
    NewWsid: number,
    Wsid: number;
    LastModdate: string;
    duration?: number;
    TimeTaken?: string; // 'HH:MM:SS' booked against this status (from the procedure)
}


export const JobDetails = <T extends Record<string, any>>({ job }: JobDetailsProps<T>) => {

    const [jobStatusLoading, setJobStatusLoading] = useState(true);
    const [jobStatusData, setJobStatusData] = useState<JobStatus[]>([]);
    const [budget, setBudget] = useState<{ budgetSeconds: number; timeTakenSeconds: number } | null>(null);

    useEffect(() => {
        getJobStatusData();
        getBudgetSummary();
        console.log('job details in job details', job);
    }, [job]);

    const getBudgetSummary = () => {
        setBudget(null);
        getPostData(apiRoutes.job.getBudgetSummary, { job_id: job.Aid }).then((res: any) => {
            if (res?.status && res.data) {
                setBudget({ budgetSeconds: res.data.budget_seconds, timeTakenSeconds: res.data.time_taken_seconds });
            }
        }).catch((err: any) => console.error("Error fetching job budget summary:", err));
    };

    const getJobStatusData = () => {
        setJobStatusLoading(true);
        try {
            getPostData(apiRoutes.job.getDetailsById, {
                job_id: job.Aid
            }).then((data) => {
                setJobStatusData(data.data);
                setJobStatusLoading(false);
            });
        } catch (err) {
            console.error("Error fetching job status count:", err);
        }
    };

    return (
        <div className="border border-secondary rounded-xl shadow-lg overflow-hidden bg-white h-full">
            <Toolbar layout="split" theme="white" className="rounded-t-lg sticky top-0 shadow items-stretch">
                <div className="px-2 flex items-stretch gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 w-full flex items-end justify-between">
                            <div className="font-medium">
                                <h1 className="text-lg font-semibold text-secondary">{job.Jobname}</h1>
                                <div className="text-xs font-semibold text-slate-600">
                                    {!jobStatusLoading ? <>
                                        {jobStatusData.at(-1)?.LastModdate ? 
                                            <>
                                                Last Modified {new Date(jobStatusData.at(-1)?.LastModdate!).toLocaleDateString("en-AU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </> :
                                            <div>Last modified date not available</div>
                                        }
                                    </> : "Getting last modified date..."}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.Accountant} label="Accountant" icon={<Contact strokeWidth={1.5} size={38} className="text-slate-700" />} />
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.Workstatus} label="Job Status" />
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.GroupJobName ?? '-'} label="Group Job Name" />
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.Naturejob ?? '-'} label="Nature of Job" />
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.ReceivedFrom ?? '-'} label="Received From" />
                    <div className="border-r border-slate-300">&nbsp;</div>
                    <InfoCard value={job?.ReceivedDate ?? '-'} label="Received Date" />

                </div>
            </Toolbar>

            <div>
                <JobInformation job={job} jobStatusData={jobStatusData} jobStatusLoading={jobStatusLoading} budget={budget}></JobInformation>
            </div>
        </div>
    );
};