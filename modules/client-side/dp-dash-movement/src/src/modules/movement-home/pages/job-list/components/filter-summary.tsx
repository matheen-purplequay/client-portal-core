import { X } from "lucide-react";
import type { JobTitle } from "../../../../../core/models/movement";

interface FilterSummaryProps {
    filters: any;
    jobTitles: JobTitle[];
    statusLookup: Record<string, number>;
    onRemove?: (key: string) => void;
    onValueClick?: () => void;
}

export const FilterSummary = ({ filters, jobTitles, statusLookup, onRemove, onValueClick }: FilterSummaryProps) => {
    const jobTitleMap = jobTitles.reduce((acc, job) => {
        acc[job.key] = job.title;
        return acc;
    }, {} as Record<string, string>);

    const getStatusLabel = (id: number) => {
        if (id === 0) return null;
        if (id === -1) return "Live Jobs";
        const key = Object.keys(statusLookup).find(k => statusLookup[k] === id);
        return key ? jobTitleMap[key] || key : null;
    };

    const activeFilters: { label: string; value: string; key: string }[] = [];

    // 1. Status
    const statusLabel = getStatusLabel(filters.status_id);
    if (statusLabel) {
        activeFilters.push({ label: "Status", value: statusLabel, key: "status_id" });
    }

    // 2. Financial Year
    if (filters.financial_year && filters.financial_year !== "All") {
        activeFilters.push({ label: "FY", value: filters.financial_year, key: "financial_year" });
    }

    // 3. Received From
    if (filters.received_from && filters.received_from !== "All") {
        activeFilters.push({ label: "From", value: filters.received_from, key: "received_from" });
    }

    // 4. Accountant
    if (filters.accountant && filters.accountant !== "All") {
        activeFilters.push({ label: "Accountant", value: filters.accountant, key: "accountant" });
    }

    // 5. Nature of Job
    if (filters.nature_of_job && filters.nature_of_job !== "All") {
        activeFilters.push({ label: "Nature", value: filters.nature_of_job, key: "nature_of_job" });
    }

    // 6. Date Ranges (just simplified indicators)
    if (filters.received_date_range) {
        activeFilters.push({ label: "Received", value: "Custom", key: "received_date_range" });
    }
    if (filters.commenced_date_range) {
        activeFilters.push({ label: "Commenced", value: "Custom", key: "commenced_date_range" });
    }

    const displayedFilters = activeFilters.slice(0, 3);

    if (displayedFilters.length === 0) return null;

    return (
        <div className="flex items-center gap-2 mr-2">
            <div className="flex flex-col items-end leading-0">
                <div className="text-xs text-neutral-500 font-medium">Selected</div>
                <div className="text-sm text-neutral-500 font-semibold">Filters</div>
            </div>
            {displayedFilters.map((f) => (
                <div 
                    key={f.key}
                    className="flex items-center gap-2 pl-3 pr-2 py-[3px] bg-secondary/5 rounded-lg text-[10px] font-medium text-slate-600"
                >
                    <div 
                        className="flex flex-col leading-none cursor-pointer group"
                        onClick={onValueClick}
                    >
                        <span className="opacity-70 text-xs">{f.label}</span>
                        <span className="text-secondary font-semibold text-sm group-hover:underline max-w-[70px] truncate">{f.value}</span>
                    </div>
                    <div className="border-r border-slate-300 py-2">&nbsp;</div>
                    {onRemove && (
                        <button 
                            onClick={() => onRemove(f.key)}
                            className="p-1 rounded-full hover:bg-red-800 hover:text-white cursor-pointer aspect-square transition-colors"
                        >
                            <X size={10} strokeWidth={3} />
                        </button>
                    )}
                </div>
            ))}
            {activeFilters.length > 3 && (
                <div className="text-[10px] font-medium text-slate-700 bg-white/50 px-2 py-1 rounded-full border border-slate-300">
                    +{activeFilters.length - 3} more
                </div>
            )}
        </div>
    );
};
