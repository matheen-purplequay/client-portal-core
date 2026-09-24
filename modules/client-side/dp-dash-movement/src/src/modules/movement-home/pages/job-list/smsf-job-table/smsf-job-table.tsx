import { useEffect, useRef, useState } from 'react';
import type { JobHeader, SMSFJobRowData, JobTitle, StatusCount, SMSFDashboardFilter } from '../../../../../core/models/movement';
import ProgressPanel from '../../../../components/statistics-panel-home/panels/progress-panel';
import LegendButtons from '../../../../components/statistics-panel-home/panels/components/legend-buttons';
import ManagerViewToggle, { type JobStatusViewMode } from '../../../../components/statistics-panel-home/components/manager-view-toggle';
import PartnerWiseGrid, { type PartnerWisePartner, type PartnerWiseRow } from '../../../../components/statistics-panel-home/components/partner-wise-grid';
import Toast from '../../../../../shell/components/collections/toast';
import { apiRoutes } from '../../../../../config/api-routes';
import { DashboardTable } from '../../../../components/collections/dashboard-table';
import { useAppContext } from '../../../../../core/utils/stores/AppContext';
import { JobDetails } from '../../details/job-details/job-details';
import { JobTabBar } from '../components/job-tab-bar';
import { useEngagementVerticalContext } from '../../../../../core/utils/stores/EngagementVerticalContext';
import { transformStatusCounts } from '../../../helpers/transform-status-counts';
import { filterRowsByLegend, type LegendFilter } from '../../../helpers/legend-filter';
import { verticals } from '../../../../../core/seeds/verticals';
import { decryptData } from '../../../../../core/utils/helpers/localStorage';
import { FilterSidebar } from '../components/sidebarfilters';
import { JobToolbar } from '../components/job-toolbar';
import { FilterSummary } from '../components/filter-summary';

// One card per tbl_smsfjobstatus entry (jobmonitor.SMSFJSid), matching the
// granular status the grid itself now shows — replaces the old 8 generic
// Wsid-bucket cards (WIP Processing/Query Sent/...), which collapsed
// several distinct SMSF sub-statuses into one card each. Keys are 'smsf' +
// Code to match what the backend's counts query now returns.
const jobTitles: JobTitle[] = [
    { key: 'smsfInProgress', title: 'In Progress' },
    { key: 'smsfAwaitingQueries', title: 'Awaiting Queries', className: 'bg-yellow-100' },
    { key: 'smsfWorkpapersCompleted', title: 'Workpapers Completed' },
    { key: 'smsf8', title: 'Workpapers Changes Required', className: 'bg-yellow-100' },
    { key: 'smsf9', title: 'Moved to Audit', className: 'bg-green-100' },
];

export const SMSFJobTable = () => {
    const [statusLookup, setStatusLookup] = useState<{ [key: string]: number }>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [smsfJobs, setSMSFJobs] = useState<SMSFJobRowData[]>([]);
    const [smsfHeaders, setSMSFHeaders] = useState<JobHeader[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxTabs, setMaxTabs] = useState(5); // default fallback
    const [smsfTabs, setSMSFTabs] = useState<SMSFJobRowData[]>([]);
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);


    const [selectedSMSFJob, setSelectedSMSFJob] = useState<SMSFJobRowData | null>(null);
    const jobAPI = `${apiRoutes.movement.getWithCounts}`;

    const context = useAppContext();
    const engagementVertical = useEngagementVerticalContext();

    const downloadAPI = `${apiRoutes.movement.downloadWithCounts}`;

    const [filters, setFilters] = useState<SMSFDashboardFilter>({ financial_year: "All", status_id: -1 });
    const [receivedFrom, setReceivedFrom] = useState<string[]>([]);
    const [accountant, setAccountant] = useState<string[]>([]);
    const [natureOfJobOptions, setNatureOfJobOptions] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState<JobTitle | null>(null);
    const [originalSMSFJobs, setOriginalSMSFJobs] = useState<SMSFJobRowData[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const [statusCount, setStatusCount] = useState<StatusCount[]>([]);

    const [isFirstTimeLoaded, setIsFirstTimeLoaded] = useState(false);
    const [legendFilter, setLegendFilter] = useState<LegendFilter>(null);

    const [viewMode, setViewMode] = useState<JobStatusViewMode>('status');
    const [isManager, setIsManager] = useState(false);
    const [partnerWisePartners, setPartnerWisePartners] = useState<PartnerWisePartner[]>([]);
    const [partnerWiseRows, setPartnerWiseRows] = useState<PartnerWiseRow[]>([]);
    const [partnerWiseTotals, setPartnerWiseTotals] = useState<Record<string, number>>({});
    const [isLoadingPartnerWise, setIsLoadingPartnerWise] = useState(false);
    const [hasLoadedPartnerWise, setHasLoadedPartnerWise] = useState(false);

    // Switching legends can hide the currently selected status card (it may
    // not belong to the newly chosen legend), so drop back to the default
    // "Live Jobs" selection instead of leaving a stale/hidden card selected.
    const handleLegendFilterChange = (legend: LegendFilter) => {
        setLegendFilter(legend);
        handleJobFilterByTitle(null);
    };

    // The Legends row/filter is Status View-only — Manager View's partner
    // breakdown isn't scoped by legend, so switching views clears it.
    const handleViewModeChange = (mode: JobStatusViewMode) => {
        setViewMode(mode);
        if (mode === 'manager' && legendFilter) {
            handleLegendFilterChange(null);
        }
    };

    const getManagerContactId = () =>
        JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0;

    // Cheap check on load — just decides whether the Manager View toggle
    // should show at all. Fired in parallel with fetchSMSFJobs, not
    // awaited — it must never delay the job list itself. The actual
    // per-partner job counts are only fetched lazily, the first time the
    // toggle is clicked.
    const fetchManagerStatus = async () => {
        try {
            const response = await fetch(apiRoutes.movement.getManagerStatus, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: getManagerContactId() }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            if (data.status && data.data) {
                setIsManager(!!data.data.is_manager);
            }
        } catch (error) {
            console.log("Error checking manager status:", error);
        }
    };

    const fetchPartnerWiseJobs = async () => {
        setIsLoadingPartnerWise(true);
        try {
            const response = await fetch(apiRoutes.movement.getPartnerWiseJobs, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: verticals.smsf,
                    project_id: context?.userData?.project_id,
                    user_id: getManagerContactId(),
                }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            if (data.status && data.data) {
                setIsManager(!!data.data.is_manager);
                setPartnerWisePartners(data.data.partners ?? []);
                setPartnerWiseRows(data.data.rows ?? []);
                setPartnerWiseTotals(data.data.totals ?? {});
            }
        } catch (error) {
            console.log("Error fetching partner-wise jobs:", error);
        } finally {
            setIsLoadingPartnerWise(false);
        }
    };

    // Load the full partner-wise breakdown lazily, only the first time
    // Manager View is actually opened.
    useEffect(() => {
        if (viewMode === 'manager' && !hasLoadedPartnerWise) {
            setHasLoadedPartnerWise(true);
            fetchPartnerWiseJobs();
        }
    }, [viewMode]);

    // A Partner Wise Jobs cell click filters the job grid below to that
    // exact partner (by name, via the existing received_from filter) and
    // that exact status — same filter fields the stat cards already use.
    const handlePartnerCellClick = (partnerName: string, wsid: number) => {
        const newFilters = { ...filters, received_from: partnerName, status_id: wsid };
        setFilters(newFilters);
        setSelectedTitle(null);
        fetchSMSFJobsWith(newFilters);
    };

    useEffect(() => {
        if (engagementVertical.vertical && engagementVertical.vertical.wm_vertical_id === 2 && !isFirstTimeLoaded) {
            setIsFirstTimeLoaded(true);
            calculateMaxTabs();
            fetchSMSFJobs();
            fetchManagerStatus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
    }, [engagementVertical.vertical]);


    const handleSMSFJobUnselected = (job: SMSFJobRowData) => {
        calculateMaxTabs();
        if (smsfTabs.length === 1) {
            setSelectedSMSFJob(null);
            setSMSFTabs([]);
        } else {

            if (selectedSMSFJob?.Aid === job.Aid) {
                const index = smsfTabs.findIndex((tab) => tab.Aid === job.Aid);
                if (index > -1) {
                    if (index === 0) {
                        setSelectedSMSFJob(smsfTabs[index + 1]);
                    } else {
                        setSelectedSMSFJob(smsfTabs[index - 1]);
                    }
                }
            }
            setSMSFTabs(smsfTabs.filter((tab) => tab.Aid !== job.Aid));
        }
    };

    const calculateMaxTabs = () => {
        if (containerRef.current) {
            const parentWidth = containerRef.current.offsetWidth;
            const fitTabs = Math.floor(parentWidth / 220); // 220px per tab
            setMaxTabs(fitTabs);
        }
    };

    useEffect(() => {
        const excludeHeaders = ["StatusId", "NewWorkStatus"];
        if (smsfJobs && smsfJobs.length > 0) {
            const headers = Object.keys(smsfJobs[0]);
            setSMSFHeaders(
                headers
                    .filter((header) => !excludeHeaders.includes(header))
                    .map((header) => ({ id: header, label: header }))
            );
        }
    }, [smsfJobs]);

    const getFilters = () => {
        let params: any = {};
        if (filters.status_id !== 0 && filters.status_id !== undefined) {
            params.status_id = filters.status_id;
        }
        if (filters.financial_year && filters.financial_year !== "All") {
            params.financial_year = filters.financial_year;
        }
        if (filters.received_from !== 'All' && filters.received_from !== undefined) {
            params.received_from = filters.received_from;
        }
        if (filters.accountant !== 'All' && filters.accountant !== undefined) {
            params.accountant = filters.accountant;
        }
        if (filters.nature_of_job !== 'All' && filters.nature_of_job !== undefined) {
            params.nature_of_job = filters.nature_of_job;
        }
        if (filters.received_date_range) {
            params.received_date_range = filters.received_date_range;
        }
        if (filters.commenced_date_range) {
            params.commenced_date_range = filters.commenced_date_range;
        }
        return params;
    };

    const getFilterswith = (customFilter: any) => {
        let params: any = {};
        if (customFilter.status_id !== 0 && customFilter.status_id !== undefined) {
            params.status_id = customFilter.status_id;
        }
        if (customFilter.financial_year && customFilter.financial_year !== "All") {
            params.financial_year = customFilter.financial_year;
        }
        if (customFilter.received_from !== 'All' && customFilter.received_from !== undefined) {
            params.received_from = customFilter.received_from;
        }
        if (customFilter.accountant !== 'All' && customFilter.accountant !== undefined) {
            params.accountant = customFilter.accountant;
        }
        if (customFilter.nature_of_job !== 'All' && customFilter.nature_of_job !== undefined) {
            params.nature_of_job = customFilter.nature_of_job;
        }
        if (customFilter.received_date_range) {
            params.received_date_range = customFilter.received_date_range;
        }
        if (customFilter.commenced_date_range) {
            params.commenced_date_range = customFilter.commenced_date_range;
        }
        return params;
    };

    const fetchSMSFJobs = async () => {
        try {
            setSMSFJobs([]);
            setIsRefreshing(true);
            const response = await fetch(jobAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: verticals.smsf,
                    project_id: context?.userData?.project_id,
                    user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
                    filters: JSON.stringify(getFilters()),
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setSMSFJobs(data.data ?? []);
            setOriginalSMSFJobs(data.data ?? []);
            if (Array.isArray(data.counts)) {
                setStatusCount(transformStatusCounts(data.counts, jobTitles));
            }
            setIsRefreshed(true);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchSMSFJobsWith = async (customFilter: any) => {
        try {
            setSMSFJobs([]);
            setIsRefreshing(true);

            const response = await fetch(jobAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: verticals.smsf,
                    project_id: context?.userData?.project_id,
                    user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
                    filters: JSON.stringify(getFilterswith(customFilter)),
                }),
            });

            const data = await response.json();
            setSMSFJobs(data.data ?? []);
            if (Array.isArray(data.counts)) {
                setStatusCount(transformStatusCounts(data.counts, jobTitles));
            }
        } catch (e) {
            console.error("Error fetching jobs with filter:", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const downloadSMSFJobs = async () => {
        setIsExporting(true);

        try {
            const res = await fetch(downloadAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: verticals.smsf,
                    project_id: context?.userData?.project_id,
                    user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
                    filters: JSON.stringify(getFilters()),
                }),
            });

            if (!res.ok) {
                throw new Error("Download failed");
            }

            const blob = await res.blob();
            const cd = res.headers.get("content-disposition");
            const match = cd?.match(/filename="?([^"]+)"?/i);
            const filename = match?.[1] || "Job_Movement_Export.xlsx";

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setIsExporting(false);
        } catch (err) {
            console.log("Download error:", err);
            setIsExporting(false);
        }
    };

    const switchJobTab = (job: SMSFJobRowData) => {
        setSelectedSMSFJob(job);
    };

    const handleJobSelected = (job: SMSFJobRowData) => {
        calculateMaxTabs();
        if (smsfTabs.length >= maxTabs) return;

        if (!smsfTabs.some(tab => tab.Aid === job.Aid)) {
            setSMSFTabs([...smsfTabs, job]);
        }

        if (!isShiftPressed) {
            setSelectedSMSFJob(job);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsRefreshed(false), 3000);
        return () => clearTimeout(timer);
    }, [isRefreshed]);

    const handleJobFilterByTitle = (jobTitle: JobTitle | null) => {
        if (jobTitle && jobTitle.id) {
            const newFilters = { ...filters, status_id: jobTitle.id };
            setFilters(newFilters);
            setSelectedTitle(jobTitle);
            fetchSMSFJobsWith(newFilters);
        } else {
            const newFilters = { ...filters, status_id: -1 };
            setFilters(newFilters);
            setSelectedTitle({ id: -1, key: 'livejobs', title: 'Live Jobs', titleClass: '', valueClass: '', className: '' });
            fetchSMSFJobsWith(newFilters);
        }
    };

    const handleRemoveFilter = (key: string) => {
        const newFilters = { ...filters };
        if (key === 'status_id') {
            newFilters.status_id = 0;
            setSelectedTitle(null);
        } else if (key === 'financial_year') {
            newFilters.financial_year = "All";
        } else if (key === 'received_from') {
            newFilters.received_from = 'All';
        } else if (key === 'accountant') {
            newFilters.accountant = 'All';
        } else if (key === 'nature_of_job') {
            newFilters.nature_of_job = 'All';
        } else if (key === 'received_date_range') {
            newFilters.received_date_range = undefined;
        } else if (key === 'commenced_date_range') {
            newFilters.commenced_date_range = undefined;
        }

        setFilters(newFilters);
        fetchSMSFJobsWith(newFilters);
    };

    useEffect(() => {
        if (statusCount.length > 0) {
            const map: any = {};
            statusCount.forEach((item) => {
                map[item.key] = item.id;   // key = name | id = API StatusId
            });
            setStatusLookup(map);
        }
    }, [statusCount]);


    useEffect(() => {
        if (originalSMSFJobs && originalSMSFJobs.length > 0) {
            const receivedFrom = originalSMSFJobs.map((job) => job.ReceivedFrom).filter((value, index, self) => self.indexOf(value) === index);
            setReceivedFrom(['All', ...receivedFrom]);

            const accountant = originalSMSFJobs.map((job) => job.Accountant).filter((value, index, self) => self.indexOf(value) === index);
            setAccountant(['All', ...accountant]);

            const natureOfJobOptions = originalSMSFJobs
                .map(job => job.Naturejob)
                .filter((value, index, self) => value && self.indexOf(value) === index);

            setNatureOfJobOptions(['All', ...natureOfJobOptions]);

            setFilters(prev => ({
                ...prev,
                received_from: prev.received_from ?? 'All',
                accountant: prev.accountant ?? 'All',
                nature_of_job: prev.nature_of_job ?? 'All',
            }));
        }
    }, [originalSMSFJobs]);

    return (
        <div className="w-full">
            <div className="space-y-3">
                <div className="text-lg font-semibold text-slate-800 text-center leading-none">Job Details</div>
                {isManager && <ManagerViewToggle viewMode={viewMode} setViewMode={handleViewModeChange} />}
                <LegendButtons legendFilter={legendFilter} setLegendFilter={handleLegendFilterChange} showPills={viewMode === 'status'} />
                {viewMode === 'manager' ? (
                    <PartnerWiseGrid
                        partners={partnerWisePartners}
                        rows={partnerWiseRows}
                        totals={partnerWiseTotals}
                        isLoading={isLoadingPartnerWise}
                        onCellClick={handlePartnerCellClick}
                    />
                ) : (
                    <ProgressPanel statusCount={statusCount} setSelectedTitle={handleJobFilterByTitle} selectedTitle={selectedTitle} isRefreshing={isRefreshing} containerClassName={`${isRefreshing && 'opacity-50 pointer-events-none'} `} hideIfNoValue={true} legendFilter={legendFilter} />
                )}

                <div className="flex flex-col gap-4 space-y-4">
                    <div className="flex-1">
                        <JobTabBar tabs={smsfTabs} selectedTab={selectedSMSFJob} vertical={engagementVertical.vertical?.title || ""} onTabSelect={switchJobTab} onTabClose={handleSMSFJobUnselected} containerRef={containerRef} />
                        <div className="z-10 relative">
                            <div className={`${selectedSMSFJob === null ? "block" : "hidden"}`}>
                                <DashboardTable
                                    rows={filterRowsByLegend(smsfJobs, statusCount, legendFilter)}
                                    headers={smsfHeaders}
                                    jobSelected={handleJobSelected}
                                    isRefreshing={isRefreshing}
                                    toolbarContent={
                                        <div className="flex items-center">
                                            <FilterSummary
                                                filters={filters}
                                                onRemove={handleRemoveFilter}
                                                onValueClick={() => setIsFilterOpen(true)}
                                            />
                                            <JobToolbar
                                                isRefreshing={isRefreshing}
                                                refreshRecords={() => {
                                                    fetchSMSFJobs();
                                                }}
                                                setIsFilterOpen={setIsFilterOpen}
                                                isExporting={isExporting}
                                                downloadJobs={() => {
                                                    downloadSMSFJobs();
                                                }}
                                                disabled={smsfJobs.length === 0 && !isRefreshing}
                                            />
                                        </div>
                                    }
                                />
                            </div>
                            {smsfTabs && smsfTabs.length > 0 && smsfTabs.map((tab) => (
                                <div key={tab.Aid} className={`pb-5 ${selectedSMSFJob?.Aid === tab.Aid ? "block" : "hidden"}`}>
                                    <JobDetails<SMSFJobRowData> job={tab} jobUnselected={handleSMSFJobUnselected} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Toast message="Jobs Refreshed" show={isRefreshed} setShow={setIsRefreshed} />
            </div>
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                receivedFrom={receivedFrom}
                accountant={accountant}
                natureOfJobOptions={natureOfJobOptions}
                jobTitles={jobTitles}
                statusLookup={statusLookup}
                onApply={(appliedFilters) => {
                    setFilters(appliedFilters);
                    fetchSMSFJobsWith(appliedFilters);
                }}
            />
        </div>
    );
};
