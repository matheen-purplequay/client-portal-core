import { AlertCircle, Briefcase, Calendar, CircleArrowRight, DollarSign, Folder, Landmark, MessageCircleMore, User } from "lucide-react";
import { cloneElement, type ReactElement } from "react";
import SimpleLoader from "../../../../../shell/components/atoms/loaders";
import { isStringNegativeValue } from "../../../../../core/utils/helpers/validations";
import { Instructions } from "../job-instructions/instructions";
import type { JobStatus } from "../job-details/job-details";

interface JobInformationProps<T extends Record<string, any>> {
    job: T;
    jobStatusData: JobStatus[];
    jobStatusLoading: boolean;
}

const jobStatusClasses = {
    jobInYetToStart: { className: 'border-b-2 border-gray-500', id: 1 },
    sentForReview: { className: 'border-b-2 border-yellow-800', id: 32 },
    jobCompleted: { className: 'border-b-2 border-green-800', id: 11 },
};

export const JobInformation = <T extends Record<string, any>>({ job, jobStatusData, jobStatusLoading }: JobInformationProps<T>) => {

    return (
        <div>
            <div className="space-y-4">
                <div className={`border-b border-slate-300 ${jobStatusData.length <= 0 ? 'bg-stone-50' : 'bg-slate-200'}`}>
                    <h1 className={`text-lg font-semibold text-slate-600 text-shadow px-6 ${jobStatusData.length <= 0 ? 'hidden' : 'pt-2'}`}>
                        {!jobStatusLoading ? "Job Timeline" : <div className="flex items-center justify-center gap-2 py-4"><SimpleLoader text="Loading job timeline..." /></div>}
                    </h1>
                    <div>
                        {jobStatusLoading && jobStatusData.length <= 0 && (
                            <div className="flex items-center justify-center gap-2 py-4"><SimpleLoader text="Loading job timeline..." /></div>
                        )}
                        {!jobStatusLoading && jobStatusData.length <= 0 && (
                            <div className="flex items-center justify-center gap-2 py-3 text-stone-500 font-semibold">
                                <AlertCircle/>
                                No job history found!
                            </div>
                        )}
                        {!jobStatusLoading && jobStatusData.length > 0 && (
                            <div className={`smooth-animation transition-all duration-300 ${jobStatusLoading ? 'h-0' : 'h-auto'}`}>
                                <div className={`flex items-stretch whitespace-nowrap text-nowrap gap-3 px-6 py-3 overflow-x-auto`}>
                                    {jobStatusData && jobStatusData.length > 0 && jobStatusData.map((status, index) => { 
                                        let durationBackgroundClass = '';
                                        if(status.duration && status.duration > 10 && status.duration < 30) durationBackgroundClass = 'bg-yellow-50 text-yellow-700';
                                        else if(status.duration && status.duration > 30) durationBackgroundClass = 'bg-red-100 text-red-700';
                                        else durationBackgroundClass = 'text-slate-100 bg-slate-400';

                                        return(
                                        <div className="flex items-center gap-4" key={index}>
                                            <JobStatusCard className={`
                                                text-sm
                                                ${ Object.values(jobStatusClasses).find((item) => item.id === status.NewWsid)?.className }
                                            `}>
                                                <div className="font-semibold pb-4 space-y-1 flex-1">
                                                    <div>{status.NewWorkStatus}</div>
                                                </div>
                                                <div className="text-sm text-slate-700 text-right flex justify-between items-center gap-2">
                                                    <div className="text-xs text-slate-500 font-semibold">
                                                        {(status.NewWorkStatus.toLocaleLowerCase().includes('wip - query replies') ||status.NewWorkStatus.toLocaleLowerCase().includes('job completed') ) && <span className="bg-primary text-white px-2 py-1 rounded-full">Carisma</span>}
                                                        {(status.NewWorkStatus.toLocaleLowerCase().includes('sent for queries') || status.NewWorkStatus.toLocaleLowerCase().includes('sent for final review') ) && <span className="bg-secondary text-white px-2 py-1 rounded-full">To Client</span>}
                                                    </div>
                                                    {new Date(status.LastModdate).toLocaleDateString("en-AU", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </JobStatusCard>

                                            {index !== jobStatusData.length - 1 && (
                                                <div className={`
                                                    bg-white rounded-full text-dark flex items-center gap-3 py-1 pr-1 shadow-sm
                                                `}>
                                                    <div className="pl-3 text-sm"><strong>{ status.duration }</strong> day{status.duration && status.duration > 1 ? 's' : ''}</div>
                                                    <CircleArrowRight strokeWidth={1.5} className={`${durationBackgroundClass} rounded-full`} />
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <section className="pt-4">
                <main className="bg-white gap-4 text-sm px-6 pb-4 border-b border-stone-300">
                    <h1 className="text-lg font-semibold text-stone-600">Basic Details</h1>
                    <div className="flex justify-between items-center gap-4 flex-1 w-full py-2">
                        <BasicDetailsCard label="Group Job Name" icon={<Briefcase />}>{job.GroupJobName ?? '-'}</BasicDetailsCard>
                        <BasicDetailsCard label="Nature of Job" icon={<Folder />}>{job.Naturejob ?? '-'}</BasicDetailsCard>
                        <BasicDetailsCard label="Received Date" icon={<Calendar />}>{job.ReceivedDate ?? '-'}</BasicDetailsCard>
                        <BasicDetailsCard label="Commenced Date" icon={<Calendar />}>{job.CommencedDate ?? '-'}</BasicDetailsCard>
                        <BasicDetailsCard label="Received From" icon={<User />}>{job.ReceivedFrom ?? '-'}</BasicDetailsCard>
                    </div>
                </main>
                <main className="py-6 px-3 space-y-8 grid grid-cols-2 gap-4">
                    <div className="space-y-8">
                        <JobSection title="Financial Information" icon={<Landmark />}>
                        {!job?.Location && !job?.Aid && !job?.Amount && !job?.Workstatus ? (
                            <div className="text-xs text-neutral-500 italic">No financial details available</div>
                        ) : (
                            <JobFieldGrid>
                                {job?.Location && <JobField label="Location" value={job.Location} />}
                                {job?.Aid && <JobField label="Job ID" value={job.Aid} />}
                                {job?.Amount && <JobField label="Amount" value={job.Amount} />}
                                {job?.Workstatus && <JobField label="Job Status" value={job.Workstatus} />}
                            </JobFieldGrid>
                        )}
                        </JobSection>

                        <JobSection title="Budget Details" icon={<DollarSign />}>
                        {!job?.UnderOverBudget && !job?.BudgetAlertDate && !job?.Hours ? (
                            <div className="text-xs text-neutral-500 italic">No budget details available</div>
                        ) : (
                            <JobFieldGrid>
                                {job?.UnderOverBudget && <JobField label="Under/Over Budget" value={job.UnderOverBudget} />}
                                {job?.BudgetAlertDate && <JobField label="Budget Alert Date" value={job.BudgetAlertDate} />}
                                {job?.Hours && <JobField label="Hours" value={job.Hours} />}
                            </JobFieldGrid>
                        )}
                        </JobSection>
                        
                        <JobSection title="Job Details" icon={<Briefcase />}>
                        {!job?.PriorityDate && !job?.Remarks && !job?.Partner ? (
                            <div className="text-xs text-neutral-500 italic">No job details available</div>
                        ) : (
                            <JobFieldGrid>
                                {job?.PriorityDate && <JobField label="Job Priority" value={job.PriorityDate} />}
                                {job?.Remarks && <JobField label="Remarks" value={job.Remarks} />}
                                {job?.Partner && <JobField label="Partner" value={job.Partner} />}
                            </JobFieldGrid>
                        )}
                        </JobSection>

                        <JobSection title="Query Details" icon={<MessageCircleMore />}>
                        {!job?.QueryRepliesReceivedDate && !job?.QuerySentDate ? (
                            <div className="text-xs text-neutral-500 italic">No query details available</div>
                        ) : 
                            <JobFieldGrid>
                                {job?.QueryRepliesReceivedDate && <JobField label="Query Replied Date" value={job.QueryRepliesReceivedDate} />}
                                {job?.QuerySentDate && <JobField label="Query Sent Date" value={job.QuerySentDate} />}
                            </JobFieldGrid>
                        }
                        </JobSection>
                    </div>
                    <div className="space-y-8">
                        {/* <RecentQueries /> */}
                        {/* <RecentInstructions /> */}
                        <div>
                            <JobSection title="Instructions" icon={<MessageCircleMore />} className="px-0">
                                <Instructions job={job} width="full" />
                            </JobSection>
                        </div>
                    </div>
                </main>

            </section>

        </div>
    );
};

const JobField = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="w-full flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <div className={`bg-slate-50 px-2 py-1 border-b border-slate-300 text-sm ${typeof value === 'string' && isStringNegativeValue(value) ? 'text-red-700' : 'text-slate-700'}`}>{value ?? '-'}</div>
        </div>
    );
};

const JobFieldGrid = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 space-y-2 space-x-2 gap-4">
            {children}
        </div>
    );
};

const JobSection = ({ children, title, icon, className }: { children: React.ReactNode; title: string; icon: ReactElement<any>; className?: string }) => {
    return (
        <section className={`${className} ${!className?.includes('px-') && 'px-4'}`}>
            <div className="flex items-start gap-2 pr-4">
                {cloneElement(icon, { className: "mt-[5px] text-slate-500 aspect-square", size: 18, strokeWidth: 1.5 })}
                <div className="space-y-2 w-full">
                    <h2 className="text-lg font-semibold text-slate-500">{title}</h2>
                    {children}
                </div>
            </div>
        </section>
    );
};

const JobStatusCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {

    return (
        <div className={`bg-white shadow-sm px-3 py-2 h-full flex-1 flex flex-col min-w-[200px] ${className}`}>
            {children}
        </div>
    );
};

const BasicDetailsCard = ({ children, label, icon }: { children: React.ReactNode, label: string, icon?: ReactElement<any> }) => {
    return (
        <div className="flex gap-2 items-center flex-1 w-full">
            {icon && cloneElement(icon, { className: "mt-[5px] text-stone-500 aspect-square", strokeWidth: 1.5 })}
            <div className="flex flex-col">
                <label className="text-xs font-medium text-stone-500">{label}</label>
                <div>{children}</div>
            </div>
        </div>
    );
};


// const RecentInstructions = () => {
//     return (
//         <div>
//             <div className="text-lg font-semibold text-slate-500">Recent Instructions</div>
//             <Table className="w-full bg-slate-50/50 border border-slate-300">
//                 <TableHead>
//                     <TableRow>
//                         <TableHeadCell>Raised By</TableHeadCell>
//                         <TableHeadCell>Instruction</TableHeadCell>
//                         <TableHeadCell>Date</TableHeadCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 1</TableRowData>
//                         <TableRowData>2023-01-01</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 2</TableRowData>
//                         <TableRowData>2023-01-02</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 3</TableRowData>
//                         <TableRowData>2023-01-01</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 4</TableRowData>
//                         <TableRowData>2023-01-02</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 5</TableRowData>
//                         <TableRowData>2023-01-01</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>John Doe</TableRowData>
//                         <TableRowData>Instruction 6</TableRowData>
//                         <TableRowData>2023-01-02</TableRowData>
//                     </TableRow>
//                 </TableBody>
//             </Table>
//         </div>
//     );
// };


// const RecentQueries = () => {
//     return (
//         <div>
//             <div className="text-lg font-semibold text-slate-500">Recent Queries</div>
//             <Table className="w-full bg-slate-50/50 border border-slate-300">
//                 <TableHead>
//                     <TableRow>
//                         <TableHeadCell>Query</TableHeadCell>
//                         <TableHeadCell>Date</TableHeadCell>
//                         <TableHeadCell>Time</TableHeadCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     <TableRow>
//                         <TableRowData>Query 1</TableRowData>
//                         <TableRowData>2023-01-01</TableRowData>
//                         <TableRowData>10:00 AM</TableRowData>
//                     </TableRow>
//                     <TableRow>
//                         <TableRowData>Query 2</TableRowData>
//                         <TableRowData>2023-01-02</TableRowData>
//                         <TableRowData>11:00 AM</TableRowData>
//                     </TableRow>
//                 </TableBody>
//             </Table>
//         </div>
//     );
// };