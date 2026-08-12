import { getData } from "../../core/utils/helpers/fetch";
import { apiRoutes } from "../../config/api-routes";
import { useEffect, useState } from "react";
import type { RejectedQuery } from "../../core/models/query";
import { Pagination, Table, TableBody, TableHead, TableHeadCell, TableHeadRow, TableRow, TableRowData } from "../../shell/components/collections/table";

export default function RejectedQueries() {
    const [isMounted, setIsMounted] = useState(false);
    const [rejectedQueries, setRejectedQueries] = useState<RejectedQuery[]>([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [paginatedRows, setPaginatedRows] = useState<RejectedQuery[]>([]);

    const getRejectedQueries = () => {
        getData(apiRoutes.queries.get.getRejectedQueries).then((data) => {
            console.log('rejected queries from api ', data);
            setRejectedQueries(data.data);
        });
    };

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
        handlePageChange(0);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const paginateRows = () => {
        if (rejectedQueries && rejectedQueries.length > 0) {
            const start = page * rowsPerPage;
            const end = start + rowsPerPage;
            setPaginatedRows(rejectedQueries.slice(start, end));
        } else {
            setPaginatedRows([]);
        }
    };

    useEffect(() => {
        if(!isMounted) {
            setIsMounted(true);
            getRejectedQueries();
        }
    }, [isMounted]);

    useEffect(() => {
        paginateRows();
    }, [page, rowsPerPage, rejectedQueries]);
    
    useEffect(() => {
        setPage(0);
    }, [rejectedQueries]);

    return (
        <div>
            <div className="border border-slate-300 rounded-xl overflow-hidden">
                <Table>
                    <TableHead>
                        <TableHeadRow className="bg-gradient-to-b from-slate-100 to-slate-200">
                            <TableHeadCell>ID</TableHeadCell>
                            <TableHeadCell>Job</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Query Title</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Query</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Category</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Sub Category</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Criticality</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Posted Date</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Raised By</TableHeadCell>
                            <TableHeadCell className="cursor-pointer">Raised To</TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRows && paginatedRows.length > 0 &&
                            paginatedRows.map((query) => (
                                <TableRow key={query.id}>
                                    <TableRowData verticalAlign="top">{query.id}</TableRowData>
                                    <TableRowData verticalAlign="top">
                                        <div className="font-medium">{query.job_name}</div>
                                        <div className="text-xs font-medium text-slate-700">{query.job_touchpoint}</div>
                                    </TableRowData>
                                    <TableRowData verticalAlign="top">{query.title}</TableRowData>
                                    <TableRowData verticalAlign="top">
                                        <div className="space-y-4 lg:max-w-lg xl:max-w-xl">
                                            <div className="overflow-hidden line-clamp-3" dangerouslySetInnerHTML={{ __html: query.query ?? '-' }} />
                                        </div>
                                    </TableRowData>
                                    <TableRowData verticalAlign="top">{query.category_name}</TableRowData>
                                    <TableRowData verticalAlign="top">{query.sub_category_name}</TableRowData>
                                    <TableRowData verticalAlign="top">{query.criticality_name}</TableRowData>
                                    <TableRowData verticalAlign="top">
                                        <div>{query.posted_date && query.posted_date.split('T')[0]}</div>
                                        <div className="text-xs text-slate-700 font-medium">{query.posted_date && query.posted_date.split('T').length > 1 && query.posted_date.split('T')[1]}</div>
                                    </TableRowData>
                                    <TableRowData verticalAlign="top">{query.raised_by_name ?? '-'}</TableRowData>
                                    <TableRowData verticalAlign="top">{query.raised_to_name ?? '-'}</TableRowData>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>

                <Pagination rowsPerPage={rowsPerPage} handleRowsPerPageChange={handleRowsPerPageChange} page={page} setPage={handlePageChange} filteredRows={rejectedQueries} />
            </div>
        </div>
    );
}