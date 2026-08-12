import { Toolbar } from "../../../../../shell/components/collections/toolbar";
import { Button } from "../../../../../shell/components/atoms/buttons";
import { AlertCircle, Contact, X } from "lucide-react";
import { Tabs, type Tab } from "../../../../../shell/components/collections/tabs";
import { useEffect, useState } from "react";
import { Instructions } from "../job-instructions/instructions";
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
}


export const JobDetails = <T extends Record<string, any>>({ job, jobUnselected }: JobDetailsProps<T>) => {

    const tabs: Tab[] = [
        { id: 0, label: <div className="flex flex-col items-center gap-1"><AlertCircle strokeWidth={1.5} /> Information</div> },
        // { id: 1, label: <div className="flex flex-col items-center gap-1"><MessageCircleQuestionMark strokeWidth={1.5} /> Queries</div> },
        // { id: 2, label: <div className="flex flex-col items-center gap-1"><MessageSquareMore strokeWidth={1.5} /> Instructions</div> },
    ];

    const [selectedTab, setSelectedTab] = useState<Tab>(tabs[0]);
    const [jobStatusLoading, setJobStatusLoading] = useState(true);
    const [jobStatusData, setJobStatusData] = useState<JobStatus[]>([]);

    useEffect(() => {
        getJobStatusData();
        console.log('job details in job details', job);
    }, [job]);

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
                    <div className="flex items-center pl-2">
                        <Button onClick={() => jobUnselected(job)} shape="pill" className="pl-2 group/backButton" theme="light_gray">
                            <div className="flex items-center gap-1">
                                <X strokeWidth={1.5} /> Close
                            </div>
                        </Button>
                    </div>
                    <div className="border-r border-slate-300">&nbsp;</div>
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

                </div>
                <div className="px-[2px] flex items-center gap-4">
                    <Tabs 
                        tabs={tabs} 
                        tabsSelected={(tab) => setSelectedTab(tab)} 
                        selectedTab={selectedTab} 
                        theme="primary" 
                        tabStyle="minimal"
                        className="text-sm"
                    />
                </div>
            </Toolbar>

            <div>
                {selectedTab.id === 0 && <JobInformation job={job} jobStatusData={jobStatusData} jobStatusLoading={jobStatusLoading}></JobInformation>}
                {/* {selectedTab.id === 1 && <QueriesHome job={job}></QueriesHome>} */}
                {selectedTab.id === 2 && <Instructions job={job}></Instructions>}
            </div>
        </div>
    );
};