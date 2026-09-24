import { useEffect, useState } from "react";
import { AlertCircle, ClipboardList, Heart, MessageCircleQuestion, SlidersHorizontal } from "lucide-react";
import { apiRoutes } from "../../../../../config/api-routes";
import { getPostData } from "../../../../../core/utils/helpers/fetch";
import type { Instruction } from "../../../../../core/models/instruction";
import SimpleLoader from "../../../../../shell/components/atoms/loaders";
import type { JobStatus } from "../job-details/job-details";
import { SimpleDialog } from "../../../../../shell/components/dialogs/dialog";

interface JobInformationProps<T extends Record<string, any>> {
    job: T;
    jobStatusData: JobStatus[];
    jobStatusLoading: boolean;
    budget: { budgetSeconds: number; timeTakenSeconds: number } | null;
}

const formatHM = (seconds: number) => {
    const sign = seconds < 0 ? '-' : '';
    const abs = Math.abs(Math.round(seconds));
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formatInstructionDate = (value: string) => {
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    const date = d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
};

// Read-only list of the job's existing instructions.
const InstructionsCard = ({ jobId }: { jobId: number }) => {
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getPostData(apiRoutes.instructions.get, { job_id: jobId })
            .then((res: any) => setInstructions(Array.isArray(res?.data) ? res.data : []))
            .catch(() => setInstructions([]))
            .finally(() => setIsLoading(false));
    }, [jobId]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-sm font-semibold text-primary">
                <ClipboardList size={16} strokeWidth={1.5} /> Instructions
            </div>
            <div className="max-h-[260px] min-h-[120px] space-y-2 overflow-y-auto p-3">
                {isLoading && <div className="text-sm text-slate-500">Loading instructions...</div>}
                {!isLoading && instructions.length === 0 && (
                    <div className="text-sm text-slate-500">No instructions found</div>
                )}
                {!isLoading && instructions.map((instruction) => (
                    <div key={instruction.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-primary">{instruction.username}</span>
                            <span className="text-slate-400">{formatInstructionDate(instruction.CreatedOn)}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-700">{instruction.Comments}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface JobQuery {
    code?: string;
    title?: string;
    query?: string;
    raised_by_name?: string;
    posted_date?: string;
    criticality_name?: string;
    category_name?: string;
    sub_category_name?: string;
    query_status_name?: string;
    elapsed_days?: number;
}

// Read-only list of the job's previous queries (same endpoint/body the
// Angular Queries page uses to load a job's queries).
const QueriesCard = ({ jobId }: { jobId: number }) => {
    const [queries, setQueries] = useState<JobQuery[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getPostData(apiRoutes.queries.get, {
            jobId,
            isAdmin: false,
            filters: [
                { code: 'category_id', value: 0 },
                { code: 'sub_category_id', value: 0 },
                { code: 'criticality_id', value: 0 },
                { code: 'status_id', value: 0 },
            ],
        })
            .then((res: any) => {
                const list = res?.queries ?? res?.data;
                setQueries(Array.isArray(list) ? list : []);
            })
            .catch(() => setQueries([]))
            .finally(() => setIsLoading(false));
    }, [jobId]);

    // Clicking opens the Angular Queries page landed directly on this job's
    // queries (dashboard-home reads ?jobId= and passes it to app-queries-home,
    // which auto-selects the matching job once its job list loads).
    //
    // This widget is mounted directly inside the Angular page (same window,
    // not an iframe), so `window.location.href` would trigger a full browser
    // navigation — reloading the whole Angular app (client name, user data,
    // etc.) from scratch. Instead, push the new URL via the History API and
    // fire a 'popstate' event: Angular's PathLocationStrategy listens for
    // popstate to pick up URL changes, so its Router performs a normal
    // client-side navigation instead of a full page reload.
    const openQueriesPage = () => {
        window.history.pushState({}, '', `/dashboard/home?tab=queries&jobId=${jobId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-sm font-semibold text-primary">
                <MessageCircleQuestion size={16} strokeWidth={1.5} /> Queries
            </div>
            <div className="flex min-h-[80px] items-center justify-center p-3">
                {isLoading && <div className="text-sm text-slate-500">Loading queries...</div>}
                {!isLoading && queries.length === 0 && (
                    <div className="text-sm text-slate-500">No queries found</div>
                )}
                {!isLoading && queries.length > 0 && (
                    <button
                        type="button"
                        onClick={openQueriesPage}
                        className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-1 hover:bg-primary/5"
                    >
                        <span className="text-2xl font-semibold text-primary">{queries.length}</span>
                        <span className="text-xs font-medium text-slate-500 underline">
                            {queries.length === 1 ? 'View Query' : 'View Queries'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

interface JobAppreciation {
    id: number;
    received_date: string;
    message: string;
    appreciation_for: string | null;
}

interface JobSurvey {
    overall_satisfaction: string;
    overall_insights: string;
    responsiveness: string;
    responsiveness_insights: string;
    improvements: string;
}

// The submitted feedback survey for this job (SP_clientportalGetJobSurvey),
// shown in a modal since this widget has no separate feedback page of its own.
const FeedbackDialog = ({ survey, onClose }: { survey: JobSurvey; onClose: () => void }) => (
    <SimpleDialog title="Feedback" onClose={onClose} dialogSize="sm" dialogStyle="rounded">
        <div className="space-y-3 text-sm">
            <div>
                <div className="font-semibold text-slate-600">Overall Satisfaction</div>
                <div className="text-slate-800">{survey.overall_satisfaction || '-'}</div>
                {survey.overall_insights && <div className="mt-0.5 text-slate-600">{survey.overall_insights}</div>}
            </div>
            <div>
                <div className="font-semibold text-slate-600">Responsiveness</div>
                <div className="text-slate-800">{survey.responsiveness || '-'}</div>
                {survey.responsiveness_insights && <div className="mt-0.5 text-slate-600">{survey.responsiveness_insights}</div>}
            </div>
            {survey.improvements && (
                <div>
                    <div className="font-semibold text-slate-600">Suggested Improvements</div>
                    <div className="text-slate-800">{survey.improvements}</div>
                </div>
            )}
        </div>
    </SimpleDialog>
);

// Read-only list of appreciation the client has recorded for this job, plus
// a link to the client's submitted feedback survey for this job, if any.
const AppreciationCard = ({ jobId }: { jobId: number }) => {
    const [items, setItems] = useState<JobAppreciation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [survey, setSurvey] = useState<JobSurvey | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getPostData(apiRoutes.job.getAppreciation, { job_id: jobId })
            .then((res: any) => setItems(Array.isArray(res?.data) ? res.data : []))
            .catch(() => setItems([]))
            .finally(() => setIsLoading(false));

        // Looked up by job_id alone (not tied to the current viewer's own
        // user_id) — this card just shows whether the job has feedback at
        // all, same as the Angular Closed Jobs Feedback list's
        // survey_submitted flag, regardless of which portal user submitted it.
        getPostData(apiRoutes.job.getFeedback, { job_id: jobId })
            .then((res: any) => setSurvey(res?.data ?? null))
            .catch(() => setSurvey(null));
    }, [jobId]);

    const formatDate = (value: string) => {
        const d = new Date(value);
        return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 text-sm font-semibold text-primary">
                <span className="flex items-center gap-2"><Heart size={16} strokeWidth={1.5} /> Appreciation and Feedback</span>
                {survey && (
                    <button type="button" onClick={() => setShowFeedback(true)} className="text-xs font-semibold text-primary underline">
                        View Feedback
                    </button>
                )}
            </div>
            <div className="max-h-[260px] min-h-[120px] space-y-2 overflow-y-auto p-3">
                {isLoading && <div className="text-sm text-slate-500">Loading appreciation...</div>}
                {!isLoading && items.length === 0 && (
                    <div className="text-sm text-slate-500">No appreciation received for this job yet</div>
                )}
                {!isLoading && items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center justify-end text-xs text-slate-400">{formatDate(item.received_date)}</div>
                        {item.message && <div className="text-sm text-slate-700">{item.message}</div>}
                        {item.appreciation_for && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                                {item.appreciation_for.split(', ').map((reason, idx) => (
                                    <span key={idx} className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">{reason}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {showFeedback && survey && <FeedbackDialog survey={survey} onClose={() => setShowFeedback(false)} />}
        </div>
    );
};

const BudgetCard = ({ budget }: { budget: { budgetSeconds: number; timeTakenSeconds: number } | null }) => {
    const variance = budget ? budget.timeTakenSeconds - budget.budgetSeconds : 0;
    const utilisation = budget && budget.budgetSeconds > 0 ? Math.round((budget.timeTakenSeconds / budget.budgetSeconds) * 100) : null;
    const isOver = variance > 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-sm font-semibold text-primary">
                <SlidersHorizontal size={16} strokeWidth={1.5} /> Under / Over Budget
            </div>
            {!budget ? (
                <div className="px-4 py-3 text-sm text-slate-500">Loading budget...</div>
            ) : (
                <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                        <span>Budget <strong className="text-slate-900">{formatHM(budget.budgetSeconds)}</strong></span>
                        <span>Time taken <strong className="text-slate-900">{formatHM(budget.timeTakenSeconds)}</strong></span>
                        <span>Variance <strong style={{ color: isOver ? '#dc2626' : '#15803d' }}>{formatHM(Math.abs(variance))}</strong></span>
                        <span>Utilisation {utilisation === null ? '-' : `${utilisation}%`}</span>
                    </div>
                    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${isOver ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700'}`}>
                        {isOver ? 'Over budget' : 'Under budget'}
                    </span>
                </div>
            )}
        </div>
    );
};

export const JobInformation = <T extends Record<string, any>>({ job, jobStatusData, jobStatusLoading, budget }: JobInformationProps<T>) => {

    return (
        <div>
            <div className="space-y-4">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 border-b border-slate-300 ${jobStatusData.length <= 0 ? 'bg-stone-50' : 'bg-slate-200'}`}>
                    <div>
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
                            <ol className="px-6 py-4">
                                {jobStatusData.map((status, index) => {
                                    const isLast = index === jobStatusData.length - 1;
                                    const days = status.duration ?? 0;
                                    let dayClass = 'bg-slate-100 text-slate-600 border-slate-300';
                                    if (days > 30) dayClass = 'bg-red-100 text-red-700 border-red-300';
                                    else if (days > 10) dayClass = 'bg-yellow-50 text-yellow-700 border-yellow-300';

                                    return (
                                        <li key={index} className="flex gap-4">
                                            {/* Date column */}
                                            <div className="w-24 shrink-0 pt-0.5 text-right text-xs font-semibold text-slate-500">
                                                {new Date(status.LastModdate).toLocaleDateString("en-AU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </div>

                                            {/* Track: station dot + line to the next station */}
                                            <div className="flex flex-col items-center">
                                                <span className={`relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${isLast ? 'border-primary bg-white' : 'border-primary bg-primary'}`}>
                                                    {isLast && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                                                </span>
                                                {!isLast && (
                                                    <div className="relative w-0.5 min-h-[56px] flex-1 bg-primary/70">
                                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${dayClass}`}>
                                                            {days} day{days !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Station details */}
                                            <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`text-sm font-semibold ${isLast ? 'text-primary' : 'text-slate-700'}`}>{status.NewWorkStatus}</span>
                                                    {isLast && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Current</span>}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500">
                                                    Time taken: <strong className="text-slate-700">{(status.TimeTaken || '').match(/^\d+:\d{2}/)?.[0] ?? '00:00'}</strong> hrs
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                    </div>
                    <div className="px-6 py-4 lg:pl-0">
                        <div className="space-y-4">
                            <BudgetCard budget={budget} />
                            <InstructionsCard jobId={job.Aid} />
                            <QueriesCard jobId={job.Aid} />
                            <AppreciationCard jobId={job.Aid} />
                        </div>
                    </div>
                </div>

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