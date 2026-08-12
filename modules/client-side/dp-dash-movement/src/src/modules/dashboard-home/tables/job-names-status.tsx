import { useState, useEffect } from "react";
import { apiRoutes } from "../../../config/api-routes";
import { getPostData } from "../../../core/utils/helpers/fetch";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import Card from "../../../shell/components/collections/card";
import { Pagination, Table, TableBody, TableHead, TableHeadCell, TableHeadRow, TableRow, TableRowData } from "../../../shell/components/collections/table";
import type { JobReference } from "../dashboard-home";

interface Job {
    jobId: number;
    jobName: string;
    remarks: string;
    accountant: string;
}

interface JobNamesStatusProps {
    selectedJob: (job: JobReference) => void;
}

export default function JobNamesStatus({ selectedJob }: JobNamesStatusProps) {
    const context = useAppContext();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [firstTimeLoad, setFirstTimeLoad] = useState(false);
    const [filteredRows, setFilteredRows] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortedRows, setSortedRows] = useState<Job[]>([]);
    const [paginatedRows, setPaginatedRows] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

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
            setIsLoading(true);
            getPostData(apiRoutes.dashboard.jobNamesWithStatus, {
                id: context?.userData?.project_id,
            }).then((data) => {
                setJobs(data.data);
                setIsLoading(false);
            });
        };
        fetchCounts();
    }, [firstTimeLoad]);

    // 2. Sorting
    useEffect(() => {
        if (filteredRows.length > 0) {
            setSortedRows(filteredRows);
        }
    }, [filteredRows]);

    // 3. Pagination
    useEffect(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        setPaginatedRows(sortedRows.slice(start, end));
    }, [sortedRows, page, rowsPerPage]);

    const handleJobClick = (job: JobReference) => {
        selectedJob(job);
    };

    return (
        <Card 
            title="Jobs Status" 
            subtitle="Click on Job Name to view Job Information" 
            enableSearch={true} searchPlaceholder="Search Jobs..." searchValue={searchTerm} onSearchChange={(value) => setSearchTerm(value)}
            footerClass="bg-slate-200 border-l border-r border-b border-slate-200"
            footer={<Pagination
                rowsPerPage={rowsPerPage}
                handleRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                setPage={setPage}
                paginationStyle="simple"
                filteredRows={filteredRows}
                // isDisabled={isLoading}
            />}    
            isLoading={isLoading}
        >
            <div>
                <Table>
                    <TableHead>
                        <TableHeadRow>
                            <TableHeadCell>Job Name</TableHeadCell>
                            <TableHeadCell>Remarks</TableHeadCell>
                            <TableHeadCell>Accountant</TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRows.map((job, index) => (
                            <TableRow key={index} onClick={() => handleJobClick(job)}>
                                <TableRowData>{job.jobName}</TableRowData>
                                <TableRowData>{job.remarks}</TableRowData>
                                <TableRowData>{job.accountant}</TableRowData>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>



                 {/* <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Job Name</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Remarks</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Accountant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((job, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} cursor-pointer hover:bg-primary-50`}
                                onClick={() => handleJobClick(job.jobId)}
                            >
                                <td className="text-sm py-1 px-3 text-left font-medium">{job.jobName}</td>
                                <td className="text-sm py-1 px-3 text-left">{job.remarks}</td>
                                <td className="text-sm py-1 px-3 text-left">{job.accountant}</td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </div>
        </Card>
    );
}