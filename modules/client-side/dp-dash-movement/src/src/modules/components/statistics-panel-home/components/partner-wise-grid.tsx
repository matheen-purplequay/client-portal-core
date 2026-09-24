export interface PartnerWiseRow {
    key: string;
    label: string;
    wsid: number;
    counts: Record<string, number>;
    total: number;
}

export interface PartnerWisePartner {
    cid: number;
    name: string;
}

interface PartnerWiseGridProps {
    partners: PartnerWisePartner[];
    rows: PartnerWiseRow[];
    totals: Record<string, number>;
    isLoading?: boolean;
    // Fired when a non-zero cell is clicked — the job grid below should
    // filter to that partner (by name, via the existing received_from
    // filter) and that exact status (wsid).
    onCellClick?: (partnerName: string, wsid: number) => void;
}

export default function PartnerWiseGrid({ partners, rows, totals, isLoading, onCellClick }: PartnerWiseGridProps) {
    if (isLoading) {
        return <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Loading partner-wise jobs...</div>;
    }

    if (partners.length === 0) {
        return <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No managed partners found.</div>;
    }

    const allStatusTotal = totals['all'] ?? 0;

    return (
        <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="bg-primary text-white px-4 py-3 font-bold flex items-center justify-between">
                <span>Partner Wise Jobs</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-rose-50">
                            <th className="text-left px-4 py-2 font-semibold text-primary">Job Status</th>
                            {partners.map((p) => (
                                <th key={p.cid} className="text-center px-4 py-2 font-semibold text-primary whitespace-nowrap">{p.name}</th>
                            ))}
                            <th className="text-center px-4 py-2 font-semibold text-primary">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-100 font-semibold">
                            <td className="px-4 py-2">All Status</td>
                            {partners.map((p) => (
                                <td key={p.cid} className="text-center px-4 py-2 text-primary">{totals[p.cid] ?? 0}</td>
                            ))}
                            <td className="text-center px-4 py-2">{allStatusTotal}</td>
                        </tr>
                        {rows.map((row) => (
                            <tr key={row.key} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-2 py-2 border-l-2 border-primary/60 pl-3 text-primary font-medium">{row.label}</td>
                                {partners.map((p) => {
                                    const value = row.counts[p.cid] ?? 0;
                                    const clickable = value > 0 && !!onCellClick;
                                    return (
                                        <td
                                            key={p.cid}
                                            className={`text-center px-4 py-2 ${clickable ? 'cursor-pointer text-blue-700 hover:underline font-medium' : 'text-slate-400'}`}
                                            onClick={() => clickable && onCellClick?.(p.name, row.wsid)}
                                        >
                                            {value}
                                        </td>
                                    );
                                })}
                                <td className="text-center px-4 py-2 font-medium text-slate-700">{row.total}</td>
                            </tr>
                        ))}
                        <tr className="bg-rose-50 font-bold">
                            <td className="px-4 py-2 text-primary">Total Jobs</td>
                            {partners.map((p) => (
                                <td key={p.cid} className="text-center px-4 py-2 text-primary">{totals[p.cid] ?? 0}</td>
                            ))}
                            <td className="text-center px-4 py-2 text-primary">{allStatusTotal}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
