import { useEffect, useState } from "react";
import Card from "../../../shell/components/collections/card";
import { getPostData } from "../../../core/utils/helpers/fetch";
import { apiRoutes } from "../../../config/api-routes";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import { Table, TableBody, TableHead, TableHeadCell, TableHeadRow, TableRow } from "../../../shell/components/collections/table";

interface Job {
    StatusDate: string;
    jobInYetToStart: string;
    wipProcessing: string;
    sentForQueries: string;
    sentForFinalReview: string;
    jobCompleted: string;
    wipQueryReplies: string;
    wipReviewReplies: string;
    internalReview: string;
    queryRepliesReceivedYetToAttend: string;
    wipInternalReviewReplies: string;
    sentForReview: string;
    reviewRepliesReceivedYetToAttend: string;
    onHold: string;
    cancelled: string;
}

export const DayWiseJobs = () => {
    const context = useAppContext();
    const [filteredRows, setFilteredRows] = useState<Job[]>([]);
    const fetchCounts = () => {
            getPostData(apiRoutes.dashboard.dayWiseStatusCount, {
                id: context?.userData?.project_id,
            }).then((data) => {
                if(data.status && data.data && data.data.length > 0) {
                    setFilteredRows(data.data);
                }
            });
        }

        useEffect(() => {
            fetchCounts();
        }, []);

        return (
        <Card title="Day Wise Jobs" subtitle="Comparision of jobs with previous 7 days">
            <div>
                <Table className="min-w-full">
                    <TableHead>
                        <TableHeadRow>
                            <TableHeadCell>Status Date</TableHeadCell>
                            <TableHeadCell className="text-right">Job In Yet To Start</TableHeadCell>
                            <TableHeadCell className="text-right">WIP Processing</TableHeadCell>
                            <TableHeadCell className="text-right">Sent For Queries</TableHeadCell>
                            <TableHeadCell className="text-right">Sent For Final Review</TableHeadCell>
                            <TableHeadCell className="text-right">Job Completed</TableHeadCell>
                            <TableHeadCell className="text-right">WIP Query Replies</TableHeadCell>
                            <TableHeadCell className="text-right">WIP Review Replies</TableHeadCell>
                            <TableHeadCell className="text-right">Internal Review</TableHeadCell>
                            <TableHeadCell className="text-right">Query Replies Received Yet To Attend</TableHeadCell>
                            <TableHeadCell className="text-right">WIP Internal Review Replies</TableHeadCell>
                            <TableHeadCell className="text-right">Sent For Review</TableHeadCell>
                            <TableHeadCell className="text-right">Review Replies Received Yet To Attend</TableHeadCell>
                            <TableHeadCell className="text-right">On Hold</TableHeadCell>
                            <TableHeadCell className="text-right">Cancelled</TableHeadCell>
                            <TableHeadCell className="text-right">Total</TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows && filteredRows.map((job, index) => (
                            <TableRow 
                                key={index} 
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                            >
                                <td className="text-sm py-1 px-3 text-left font-medium">
                                    <div className="whitespace-nowrap">{new Date(job.StatusDate).toLocaleDateString('en-AU', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
                                </td>
                                <td className="text-sm py-1 px-3 text-right">{job.jobInYetToStart}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.wipProcessing}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.sentForQueries}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.sentForFinalReview}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.jobCompleted}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.wipQueryReplies}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.wipReviewReplies}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.internalReview}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.queryRepliesReceivedYetToAttend}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.wipInternalReviewReplies}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.sentForReview}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.reviewRepliesReceivedYetToAttend}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.onHold}</td>
                                <td className="text-sm py-1 px-3 text-right">{job.cancelled}</td>
                                <td className="text-sm py-1 px-3 text-right">{Number(job.jobInYetToStart) + Number(job.wipProcessing) + Number(job.sentForQueries) + Number(job.sentForFinalReview) + Number(job.jobCompleted) + Number(job.wipQueryReplies) + Number(job.wipReviewReplies) + Number(job.internalReview) + Number(job.queryRepliesReceivedYetToAttend) + Number(job.wipInternalReviewReplies) + Number(job.sentForReview) + Number(job.reviewRepliesReceivedYetToAttend) + Number(job.onHold) + Number(job.cancelled)}</td>
                            </TableRow>
                        ))}

                        <TableRow className="bg-slate-200 font-semibold">
                            <td className="text-sm py-1 px-3 text-left">Total</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.jobInYetToStart), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.wipProcessing), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.sentForQueries), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.sentForFinalReview), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.jobCompleted), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.wipQueryReplies), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.wipReviewReplies), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.internalReview), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.queryRepliesReceivedYetToAttend), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.wipInternalReviewReplies), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.sentForReview), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.reviewRepliesReceivedYetToAttend), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.onHold), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.cancelled), 0)}</td>
                            <td className="text-sm py-1 px-3 text-right">{filteredRows.reduce((total, job) => Number(total) + Number(job.jobInYetToStart) + Number(job.wipProcessing) + Number(job.sentForQueries) + Number(job.sentForFinalReview) + Number(job.jobCompleted) + Number(job.wipQueryReplies) + Number(job.wipReviewReplies) + Number(job.internalReview) + Number(job.queryRepliesReceivedYetToAttend) + Number(job.wipInternalReviewReplies) + Number(job.sentForReview) + Number(job.reviewRepliesReceivedYetToAttend) + Number(job.onHold) + Number(job.cancelled), 0)}</td>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};