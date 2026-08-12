import { Table, TableBody, TableRowData, TableHead, TableHeadCell, TableHeadRow, TableRow } from "../../../../../../shell/components/collections/table";
import { useEffect, useState } from "react";
import { apiRoutes } from "../../../../../../config/api-routes";
import type { OBSJobRowData } from "../../../../../../core/models/movement";
import { useAppContext } from "../../../../../../core/utils/stores/AppContext";

interface QueryJob {
    name: string;
    fy: number;
    jy: number;
    lastQuery: string;
    totalQueries: number;
    open: number;
    resolved: number;
}

const queryTableHeader = [
    { id: "name", label: "Name" },
    { id: "fy", label: "FY" },
    { id: "jy", label: "JY" },
    { id: "lastQuery", label: "Last Query" },
    { id: "totalQueries", label: "Total Queries" },
    { id: "open", label: "Open" },
    { id: "resolved", label: "Resolved" }
];

export const QueriesJobs = ({ job }: { job: OBSJobRowData }) => {
    const userData = useAppContext()?.userData;
    const [queries, setQueries] = useState<QueryJob[]>([]);

    const requestObject = {
        jobId: job.Aid,
        projectId: userData?.project_id,
        userId: userData?.user_id,
        isAdmin: false,
        filters: [
            {
                "code": "category_id",
                "value": 0
            },
            {
                "code": "sub_category_id",
                "value": 0
            },
            {
                "code": "criticality_id",
                "value": 0
            },
            {
                "code": "status_id",
                "value": 0
            }
        ]
    };

    

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        const response = await fetch(apiRoutes.queries.get, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestObject),
        });
        const data = await response.json();
        console.log('queries', data);
        setQueries(data.data);
    }

    return (
        <div>
            {queries && queries.length > 0 &&             
                <Table>
                    <TableHead className="border-b border-slate-300">
                        <TableHeadRow className="bg-primary-50/50 text-primary text-xs">
                            {queryTableHeader.map((header, idx) => (
                                <TableHeadCell key={idx}>{header.label}</TableHeadCell>
                            ))}
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {queries && queries.length > 0 && queries.map((query, idx) => (
                            <TableRow key={idx}>
                                {queryTableHeader.map((header, idx) => (
                                    <TableRowData key={idx}>{query[header.id as keyof typeof query]}</TableRowData>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
            {queries && queries.length <= 0 && 
                <div className="p-4 text-center text-slate-500 text-sm font-semibold">
                    No queries available
                </div>
            }
            {!queries && 
                <div className="p-4 text-center text-slate-500 text-sm font-semibold">
                    No queries found
                </div>
            }

        </div>
    );
};