import InternalJobStatus from "./tables/internal-job-status";
import ClientJobStatus from "./tables/client-job-status";
import InternalReviewJobs from "./tables/internal-review-jobs";
import JobNamesStatus from "./tables/job-names-status";
import { useEffect, useState } from "react";
import { getPostData } from "../../core/utils/helpers/fetch";
import { apiRoutes } from "../../config/api-routes";
import type { OBSJobRowData } from "../../core/models/movement";
import { Button } from "../../shell/components/atoms/buttons";
import { Contact, X } from "lucide-react";
import { DayWiseJobs } from "./tables/day-wise-jobs";
import { InfoCard } from "../components/collections/user-card";

interface DashboardType {
    id: number;
    label: string;
    description: string;
}

interface DashboardTypes {
    [key: string]: DashboardType;
}

export interface JobReference {
    jobId: number;
    jobName: string;
}

const dashboardTypes: DashboardTypes = {
    day_wise: { id: 0, label: 'Day Wise Status', description: 'Find day wise job status with comparision of last 7 days' },
    current_jobs: { id: 1, label: 'Current Jobs Status', description: 'Current jobs status as of today' },
    review_jobs: { id: 2, label: 'Review Jobs', description: 'Review jobs status' }
};

export default function DashboardHome() {
    const [modalOpen, setModalOpen] = useState(false);
    const [job, setJob] = useState<OBSJobRowData | null>(null);
    const [jobReference, setJobReference] = useState<JobReference | null>(null);
    const [dashboardType, setDashboardType] = useState<DashboardType>(dashboardTypes.day_wise);
    const [isLoading, setIsLoading] = useState(false);

    const handleJobSelected = (job: JobReference) => {
        setJobReference(job);
        setModalOpen(true);
    }

    useEffect(() => {
        if (jobReference) {
            setIsLoading(true);
            getPostData(apiRoutes.job.getJobInformation, {
                job_id: jobReference.jobId
            }).then((data) => {
                setJob(data.data);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [jobReference]);

    const handleJobUnSelected = () => {
        setModalOpen(false);
        setJob(null);
        setJobReference(null);
    };

    return (
        <div className="pb-5">
            <section className="px-3 relative -z-0">
                <div className="flex gap-2 items-center justify-start px-3">
                    {Object.values(dashboardTypes).map((tab) => (
                        <div key={tab.id} 
                            onClick={() => setDashboardType(tab)}
                            className={`
                                rounded-t-lg px-3 pt-2 pb-3 text-xs font-semibold cursor-pointer transition-all duration-200
                                ${dashboardType.id === tab.id ? "bg-primary text-white translate-y-0 shadow-xl border-primary" : "bg-slate-200 text-slate-700 translate-y-2 border-slate-300"}
                            `}
                        >
                            <div>{tab.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto overflow-hidden bg-white rounded-lg shadow-sm border border-primary relative z-10">
                <div className="space-y-12">
                    <div className={`${dashboardType.id === dashboardTypes.day_wise.id ? 'block mb-0' : 'hidden'}`}>
                        <DayWiseJobs />
                    </div>
                    <div className={`${dashboardType.id === dashboardTypes.current_jobs.id ? 'block mb-0' : 'hidden'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <InternalJobStatus />
                            <ClientJobStatus />
                            <div className="border-b border-slate-300 col-span-2">&nbsp;</div>
                            <JobNamesStatus selectedJob={handleJobSelected} />
                        </div>
                    </div>
                    <div className={`${dashboardType.id === dashboardTypes.review_jobs.id ? 'block mb-0' : 'hidden'}`}>
                        <InternalReviewJobs selectedJob={handleJobSelected} />
                    </div>
                </div>
            </section>

            {/* Modal that shows Job Information  */}
            <div
                className={`
                    fixed top-0 bottom-0 left-0 right-0 z-[9999] flex items-center justify-center bg-black/50 ${modalOpen ? 'block' : 'hidden'} 
                `}
                onClick={() => handleJobUnSelected}
            >
                <div className="w-6xl bg-white rounded-lg border border-slate-300 overflow-y-auto shadow-2xl flex flex-col">
                    <div className="flex gap-4 justify-start items-stretch pl-5 border-b border-slate-300 sticky top-0">
                        <div className="flex items-center py-2">
                            <Button onClick={handleJobUnSelected} className="p-1 group/backButton flex items-center justify-center" theme="secondary" shape="circle">
                                <X strokeWidth={1.5} />
                            </Button>
                        </div>
                        <>
                            <div className="border-r border-slate-300">&nbsp;</div>
                            <div className="flex gap-4 justify-start items-center py-2">
                                <div className="flex flex-col leading-none">
                                    <h1 className="text-lg font-semibold text-secondary">{jobReference?.jobName}</h1>
                                    <span className="text-xs font-medium">{job?.Workstatus ?? '-'}</span>
                                </div>
                            </div>
                            <div className="border-r border-slate-300">&nbsp;</div>
                            {!isLoading ? <InfoCard value={job?.Accountant!} label="Accountant" icon={<Contact strokeWidth={1.5} size={38} className="text-slate-700" />} /> : <div className="text-xs flex items-center"></div>}
                        </>
                    </div>
                    {/* <div className="h-full min-h-[500px] max-h-[600px] overflow-y-auto flex-1">
                        {job && !isLoading && <JobDetails job={job} jobUnselected={handleJobUnSelected} />}
                        {isLoading && <div className="flex items-center justify-center p-5"><SimpleLoader text="Loading Job Information" /></div>}
                    </div> */}
                </div>
            </div>
        </div>
    );
}