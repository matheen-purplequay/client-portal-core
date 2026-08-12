import Card from "../../../shell/components/collections/card";

interface Status {
    openingStock: number;
    jobIn: number;
    inProgress: number;
    Rework: number;
    queryCheck: number;
    clientQueries: number;
    reviewClient: number;
    reworkClient: number;
    jobCompleted: number;
    closingStock: number;
}

interface Count {
    date: string;
    day: string;
    status: Status;
}

export default function JobCount() {
    const counts: Count[] = [
        {
            date: "2025-08-01",
            day: "Monday",
            status: {
                openingStock: 24,
                jobIn: 14,
                inProgress: 24,
                Rework: 0,
                queryCheck: 5,
                clientQueries: 25,
                reviewClient: 0,
                reworkClient: 0,
                jobCompleted: 0,
                closingStock: 18,
            }
        },
        {
            date: "2025-08-01",
            day: "Monday",
            status: {
                openingStock: 24,
                jobIn: 14,
                inProgress: 24,
                Rework: 0,
                queryCheck: 5,
                clientQueries: 25,
                reviewClient: 0,
                reworkClient: 0,
                jobCompleted: 0,
                closingStock: 18,
            }
        },
        {
            date: "2025-08-01",
            day: "Monday",
            status: {
                openingStock: 24,
                jobIn: 14,
                inProgress: 24,
                Rework: 0,
                queryCheck: 5,
                clientQueries: 25,
                reviewClient: 0,
                reworkClient: 0,
                jobCompleted: 0,
                closingStock: 18,
            }
        },
    ];

    return (
        <Card title="Job Count in Hand">
            <div>
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Date</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Day</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Opening Stock</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Job In</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">In Progress</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Rework</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Query Check</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Client Queries</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Review Client</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Rework Client</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Job Completed</th>
                            <th className="text-xs py-1 px-3 text-left bg-slate-200 text-slate-800">Closing Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {counts.map((count, index) => (
                            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                <td className="text-sm py-1 px-3 text-left">{count.date}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.day}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.openingStock}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.jobIn}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.inProgress}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.Rework}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.queryCheck}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.clientQueries}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.reviewClient}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.reworkClient}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.jobCompleted}</td>
                                <td className="text-sm py-1 px-3 text-left">{count.status.closingStock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}