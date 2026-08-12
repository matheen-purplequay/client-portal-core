import { Download, ListFilter, RefreshCw } from "lucide-react";
import { Button } from "../../../../../shell/components/atoms/buttons";

export interface JobToolbarTab {
    key: string;
    title: string;
}

export const jobToolbarTabs: JobToolbarTab[] = [
    { key: "data", title: "Live Data" },
    { key: "report", title: "Report" }
];


interface JobToolbarProps {
    isRefreshing: boolean;
    refreshRecords: () => void;
    setIsFilterOpen: (open: boolean) => void;
    isExporting: boolean;
    downloadJobs: () => void;
    disabled?: boolean;
}

export const JobToolbar = ({
    isRefreshing,
    refreshRecords,
    setIsFilterOpen,
    isExporting,
    downloadJobs,
    disabled = false,
}: JobToolbarProps) => {

    const handleRefresh = () => {
        if(!isRefreshing) refreshRecords();
    };

    return (
        <div className={`
            inline-flex items-stretch justify-end gap-3 relative z-20
        `}>
            <div className={`flex gap-2 bg-slate-100 p-1 rounded-full`}>
                <Button
                    onClick={() => setIsFilterOpen(true)}
                    theme="simple_primary"
                    shape="pill"
                    className={`text-xs font-semibold text-primary p-2 flex gap-1 items-center`}
                >
                    <ListFilter size={18} /> Filters
                </Button>

                <Button
                    onClick={handleRefresh}
                    theme="simple_primary"
                    shape="pill"
                    className={`text-xs font-semibold text-primary p-2 flex gap-1 items-center`}
                >
                    <RefreshCw size={18} className={`${isRefreshing ? "animate-spin" : ""}`} /> {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>

                <Button onClick={() => { downloadJobs() }} theme="simple_primary" shape='pill'
                    className={`text-xs font-semibold text-primary p-2 flex gap-1 items-center ${!isExporting && !disabled ? "" : "opacity-50 pointer-events-none cursor-not-allowed"}`}
                >
                    <Download size={18} /> {isExporting ? "Downloading..." : "Download"}
                </Button>
            </div>
        </div>
    )
}