import { Briefcase, Calendar1, CalendarRange, CircleCheckBig, CircleUser, Contact, FunnelX, NotebookTabs, User, X } from "lucide-react";
import type { JobTitle } from "../../../../../core/models/movement";
import { Button } from "../../../../../shell/components/atoms/buttons";
import { useState, useEffect } from "react";
import { useDateFilters } from "../../../helpers/date-filter";

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;

    filters: any;
    setFilters: (f: any) => void;

    jobTitles: JobTitle[];
    receivedFrom: string[];
    accountant: string[];
    natureOfJobOptions: string[];
    statusLookup: Record<string, number>;

    onApply: (f: any) => void;
}

interface StatusFilterItem {
    key: string;
    title: string;
    id: number;
}

const readableLabels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    currentWeek: "Current Week",
    lastWeek: "Last Week",
    currentMonth: "Current Month",
    lastMonth: "Last Month",
    currentQuarter: "Current Quarter",
    lastQuarter: "Last Quarter",
    currentFinancialYear: "Current Financial Year",
    lastFinancialYear: "Last Financial Year",
};

const getFinancialYearOptions = (): string[] => {
    const currentYear = new Date().getFullYear();
    const years: string[] = ["All"];
    for (let y = 2022; y <= currentYear; y++) {
        years.push(`${y}`);
    }
    return years;
};

const getFinancialYear = (): string => {
    const prevYear = new Date().getFullYear();
    return `${prevYear}`;
};


export const FilterSidebar = ({
    isOpen,
    onClose,
    filters,
    setFilters,
    jobTitles,
    receivedFrom,
    accountant,
    natureOfJobOptions,
    statusLookup,
    onApply
}: FilterSidebarProps) => {
    const dateRanges = useDateFilters();
    const financialYearOptions = getFinancialYearOptions();
    const [receivedPeriod, setReceivedPeriod] = useState<string>("");
    const [commencedPeriod, setCommencedPeriod] = useState<string>("");
    const [selected, setSelected] = useState<string>("");
    const [localStatus, setLocalStatus] = useState(filters.status_id || 0);
    const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>(filters.financial_year || getFinancialYear());
    const [selectedReceivedFrom, setSelectedReceivedFrom] = useState("All");
    const [selectedAccountant, setSelectedAccountant] = useState("All");
    const [localNatureOfJob, setLocalNatureOfJob] = useState("All");
    const [convertedStatusFilterItems, setConvertedStatusFilterItems] = useState<StatusFilterItem[]>([]);

    useEffect(() => {
        if (convertedStatusFilterItems.length <= 0) {
            const newobj = Object.keys(statusLookup).map(key => ({
                key,
                title: jobTitleMap[key],
                id: statusLookup[key]
            }));

            setConvertedStatusFilterItems(newobj);
        }
    }, []);

    // LOAD CURRENT FILTERS WHEN SIDEBAR OPENS
    useEffect(() => {
        setSelected("");
        setSelectedReceivedFrom(filters.received_from || "All");
        setSelectedAccountant(filters.accountant || "All");
        setLocalNatureOfJob(filters.nature_of_job || "All");
        setLocalStatus(filters.status_id || 0);
        setSelectedFinancialYear(filters.financial_year || getFinancialYear());
    }, [filters, isOpen]);

    // APPLY BUTTON
    const handleApply = () => {
        const range = selected ? dateRanges[selected as keyof typeof dateRanges] : null;
        const updatedFilters: any = {
            status_id: localStatus || 0,
            financial_year: selectedFinancialYear,
            received_from: selectedReceivedFrom,
            accountant: selectedAccountant,
            nature_of_job: localNatureOfJob,
            dateRange: range,
            received_date_range: range,
            commenced_date_range: range
        };

        // 👉 Date filter for RECEIVED DATE
        if (receivedPeriod) {
            const r = dateRanges[receivedPeriod as keyof typeof dateRanges];
            updatedFilters.received_date_range = {
                from: r.from,
                to: r.to,
            };
        }
        if (commencedPeriod) {
            const r = dateRanges[commencedPeriod as keyof typeof dateRanges];
            updatedFilters.commenced_date_range = {
                from: r.from,
                to: r.to,
            };
        }

        setFilters(updatedFilters);  // update parent once
        onApply(updatedFilters);     // pass correct values
        onClose();
    };

    // CLEAR BUTTON
    const handleClear = () => {
        setSelectedReceivedFrom("All");
        setSelectedAccountant("All");
        setLocalNatureOfJob("All");
        setReceivedPeriod("");     // 👈 this will make dropdown show "All"
        setCommencedPeriod("");
        setLocalStatus(0);
        setSelectedFinancialYear("All");

        const cleared = {
            received_from: "All",
            accountant: "All",
            nature_of_job: "All",
            status_id: 0,
            financial_year: "All",
            received_date_range: null,    // optional to clear
            commenced_date_range: null
        };

        setFilters(cleared);
        onApply(cleared);
    };

    // Create a lookup map for jobTitles (ADD THIS ABOVE RETURN)
    const jobTitleMap = jobTitles.reduce((acc, job) => {
        acc[job.key] = job.title;
        return acc;
    }, {} as Record<string, string>);

    return (
        <>
            {/* Overlay */}
            <div
                className={`
                    fixed inset-0 bg-black/30 p-5 z-[9999] flex justify-end 
                    transition-opacity duration-300
                    ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                onClick={onClose}
            >

                {/* Sidebar */}
                <div
                    className={`
                        top-0 right-0 h-full w-80 bg-slate-100/90 to-30% backdrop-blur-sm shadow-2xl z-50 rounded-l-lg
                        rounded-r-lg
                        transition-transform duration-300 ease-in-out
                        ${isOpen ? "translate-x-0" : "translate-x-full"}
                        flex flex-col
                    `}
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header */}
                    <div className="flex justify-between items-center rounded-t-lg pl-4 pr-2 pt-2">
                        <h2 className="text-xl font-medium text-secondary">Filters</h2>
                        <Button
                            onClick={onClose}
                            theme="simple_primary"
                            shape="pill"
                            className="text-xs font-semibold text-slate-700 p-2 flex gap-1 items-center"
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-6">

                        <div className="px-4 flex flex-col gap-6">
                            {/* FINANCIAL YEAR */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <CalendarRange className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Financial Year</label>
                                        <select
                                            className="p-2 bg-white rounded-lg w-full text-xs focus-visible:outline-none mt-1 shadow-md"
                                            value={selectedFinancialYear}
                                            onChange={(e) => setSelectedFinancialYear(e.target.value)}
                                        >
                                            {financialYearOptions.map((fy) => (
                                                <option key={fy} value={fy} className="text-xs">
                                                    {fy}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* STATUS */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <Briefcase className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Status</label>
                                        <select
                                            className="p-2 bg-white rounded-lg w-full text-xs focus-visible:outline-none mt-1 shadow-md"
                                            value={localStatus}
                                            onChange={(e) => setLocalStatus(Number(e.target.value))}
                                        >
                                            <option value={0}>All</option>
                                            <option value={-1}>Live Jobs</option>

                                            {Object.entries(statusLookup)
                                                .filter(([_, id]) => id !== -1 && id !== 0)  // 👈 HIDE items with -1 and 0 (All)
                                                .map(([key, id]) => (
                                                    <option key={key} value={id} className="text-xs">
                                                        {jobTitleMap[key] || key}  {/* 👈 Show proper title */}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* NATURE OF JOB */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <NotebookTabs className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Nature of Job</label>
                                        <select
                                            className="p-2 bg-white rounded-lg w-full text-xs focus-visible:outline-none mt-1 shadow-md"
                                            value={localNatureOfJob}
                                            onChange={(e) => setLocalNatureOfJob(e.target.value)}
                                        >
                                            <option value="All">All</option>
                                            {natureOfJobOptions.map((option) => (
                                                <option key={option} value={option} className="text-xs">
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-300"></div>

                        <div className="px-4 flex flex-col gap-6">
                            {/* RECEIVED DATE FILTER */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <Calendar1 className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Received Date</label>
                                        <select
                                            className="p-2 bg-white rounded-lg w-full text-xs focus-visible:outline-none mt-1 shadow-md"
                                            value={receivedPeriod}
                                            onChange={(e) => setReceivedPeriod(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {Object.keys(dateRanges).map((key) => (
                                                <option key={key} value={key} className="text-xs">
                                                    {readableLabels[key] || key}   {/* 👈 SHOW USER-FRIENDLY LABEL */}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* COMMENCED DATE FILTER */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <Calendar1 className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Commenced Date</label>
                                        <select
                                            className="p-2 bg-white rounded-lg w-full text-xs focus-visible:outline-none mt-1 shadow-md"
                                            value={commencedPeriod}
                                            onChange={(e) => setCommencedPeriod(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {Object.keys(dateRanges).map((key) => (
                                                <option key={key} value={key} className="text-xs">
                                                    {readableLabels[key] || key}   {/* 👈 SHOW USER-FRIENDLY LABEL */}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-300"></div>

                        <div className="px-4 flex flex-col gap-6">
                            {/* RECEIVED FROM */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <Contact className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium p-2">Received From</label>
                                        <div className="max-h-[400px] overflow-y-auto bg-white shadow-md rounded">
                                            {receivedFrom.map((item) => (
                                                <div key={item}
                                                    className={`
                                                        p-2 flex items-center gap-2 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer border-l-4 
                                                        ${selectedReceivedFrom === item ? 'border-l-slate-500 bg-slate-200' : 'border-transparent'}
                                                    `}
                                                    onClick={() => setSelectedReceivedFrom(item)}
                                                >
                                                    {selectedReceivedFrom === item ? <CircleCheckBig className="text-green-800" size={16} /> : <User className="text-slate-500" size={16} />}
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACCOUNTANT */}
                            <div>
                                <div className="flex gap-2 items-start">
                                    <CircleUser className="mt-1 text-slate-500" size={18} />
                                    <div className="flex-1">
                                        <label className="font-medium">Accountant</label>
                                        <div className="max-h-[400px] overflow-y-auto bg-white shadow-md rounded">
                                            {accountant.map((item) => (
                                                <div key={item}
                                                    className={`
                                                        p-2 flex items-center gap-2 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer border-l-4 
                                                        ${selectedAccountant === item ? 'border-l-slate-500 bg-slate-200' : 'border-transparent'}
                                                    `}
                                                    onClick={() => setSelectedAccountant(item)}
                                                >
                                                    {selectedAccountant === item ? <CircleCheckBig className="text-green-800" size={16} /> : <User className="text-slate-500" size={16} />}
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="px-2 py-2 border-t border-slate-300 bg-white/50 rounded-b-lg flex justify-between">
                        <Button
                            onClick={handleClear}
                            theme="simple_primary"
                            shape="pill"
                            className="text-xs font-semibold text-primary p-2 flex gap-1 items-center"
                        >
                            <FunnelX size={16} />  Clear Filter
                        </Button>

                        <Button
                            onClick={handleApply}
                            theme="primary"
                            className="text-xs font-semibold p-2 flex gap-1 items-center"
                        >
                            Apply
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
};
