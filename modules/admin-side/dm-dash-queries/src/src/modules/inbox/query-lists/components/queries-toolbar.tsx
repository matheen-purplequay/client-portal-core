import { SearchBox } from "../../../../shell/components/atoms/inputs";
import type { JobQuery } from "../../job-queries/jobs";
import { SimpleHDivider } from "../../../../shell/components/atoms/divider";
import type { QueryView } from "../queries";

interface QueryToolbarEvents {
    onClose: () => void;
    setSearchTerm: (searchTerm: string) => void;
}

interface QueryToolbarValues {
    searchTerm: string;
}

interface QueryToolbarProps {
    values: QueryToolbarValues;
    events: QueryToolbarEvents;
    selectedJobQuery: JobQuery;
    views: QueryView[];
    selectedQueryView: QueryView;
    onViewChange: (view: QueryView) => void;
}

export default function QueryToolbar({ values: options, events, selectedJobQuery, views, selectedQueryView, onViewChange }: QueryToolbarProps) {
    return (
        <div className="bg-white flex gap-2 items-center justify-between border-b border-slate-300 text-slate-700 rounded-t-xl px-3 py-1">
            {/* Left: job info */}
            <div className="flex gap-3 items-stretch">
                <ToolbarInfoItem label="Queries for the Fund" value={selectedJobQuery.job_name} valueClassName="font-semibold" />
                <SimpleHDivider />
                <ToolbarInfoItem label="Vertical" value={selectedJobQuery.vertical_name} />
                <SimpleHDivider />
                <ToolbarInfoItem label="Client" value={selectedJobQuery.client} />
                <SimpleHDivider />
                <ToolbarInfoItem label="Financial Year" value={selectedJobQuery.fy} />
                <SimpleHDivider />
                <ToolbarInfoItem label="Job Year" value={new Date(selectedJobQuery.jy).toLocaleDateString('en-AU', { year: 'numeric', month: undefined, day: undefined })} />
            </div>

            {/* Right: tabs + search */}
            <div className="flex items-center gap-3">
                <div className="flex items-end gap-1">
                    {views.map((v) => (
                        <button
                            key={v.value}
                            className={`
                                text-sm cursor-pointer px-3 py-1 rounded-t-lg font-semibold transition-all duration-200 whitespace-nowrap
                                ${v.value === selectedQueryView.value
                                    ? "bg-slate-700 text-white"
                                    : "bg-transparent text-slate-500 hover:text-slate-700"
                                }
                            `}
                            onClick={() => onViewChange(v)}
                        >
                            {v.label} ({v.count ?? 0})
                        </button>
                    ))}
                </div>
                <SearchBox placeholder="Search" value={options.searchTerm} onChange={(e) => events.setSearchTerm(e.target.value)} onClear={() => events.setSearchTerm('')} />
            </div>
        </div>
    );
}

interface ToolbarInfoItemProps {
    label: string;
    value: string | number;
    labelClassName?: string;
    valueClassName?: string;
}

const ToolbarInfoItem = ({ label, value, labelClassName, valueClassName }: ToolbarInfoItemProps) => {
    return (
        <div className="p-1">
            <div className={`${!valueClassName?.includes('text-') && 'text-lg'} ${!valueClassName?.includes('font-') && 'font-medium'} ${valueClassName}`}>{value}</div>
            <div className={`${!labelClassName?.includes('text-') && 'text-xs text-slate-500'} ${labelClassName}`}>{label}</div>
        </div>
    );
};
