import { useEffect, useRef, useState } from 'react';
import type { JobHeader, FPJobRowData, JobTitle, FPDashboardFilter, StatusCount } from '../../../../../core/models/movement';
import ProgressPanel from '../../../../components/statistics-panel-home/panels/progress-panel';
import Toast from '../../../../../shell/components/collections/toast';
import { apiRoutes } from '../../../../../config/api-routes';
import { DashboardTable } from '../../../../components/collections/dashboard-table';
import { useAppContext } from '../../../../../core/utils/stores/AppContext';
import { JobDetails } from '../../details/job-details/job-details';
import { JobTabBar } from '../components/job-tab-bar';
import { useEngagementVerticalContext } from '../../../../../core/utils/stores/EngagementVerticalContext';
import { transformStatusCounts } from '../../../helpers/transform-status-counts';
import { verticals } from '../../../../../core/seeds/verticals';
import { decryptData } from '../../../../../core/utils/helpers/localStorage';
import { FilterSidebar } from '../components/sidebarfilters';
import { JobToolbar } from '../components/job-toolbar';
import { FilterSummary } from '../components/filter-summary';

const jobTitles: JobTitle[] = [
    { key: 'jobInYetToStart', title: 'Job In Yet To Start' },
    { key: 'wipProcessing', title: 'WIP Processing' },
    { key: 'sentForQueries', title: 'Query Sent', className: 'bg-yellow-100' },
    { key: 'wipQueryReplies', title: 'Response Received' },
    { key: 'sentForReview', title: 'Sent For Review', className: 'bg-yellow-100' },
    { key: 'internalReview', title: 'Review notes received' },
    { key: 'sentForFinalReview', title: 'Review notes attended', className: 'bg-yellow-100' },
    { key: 'jobCompleted', title: 'Job Completed', className: 'bg-green-100' },
];

export const FPJobTable = () => {
    const [statusLookup, setStatusLookup] = useState<{ [key: string]: number }>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [fpJobs, setFPJobs] = useState<FPJobRowData[]>([]);
    const [fpHeaders, setFPHeaders] = useState<JobHeader[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxTabs, setMaxTabs] = useState(5); // default fallback
    const [fpTabs, setFPTabs] = useState<FPJobRowData[]>([]);
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const [selectedFPJob, setSelectedFPJob] = useState<FPJobRowData | null>(null);
    const jobAPI = `${apiRoutes.movement.getWithCounts}`;

    const context = useAppContext();
    const engagementVertical = useEngagementVerticalContext();

    const downloadAPI = `${apiRoutes.movement.downloadWithCounts}`;

    const [filters, setFilters] = useState<FPDashboardFilter>({ financial_year: "All", status_id: -1 });
    const [receivedFrom, setReceivedFrom] = useState<string[]>([]);
    const [accountant, setAccountant] = useState<string[]>([]);
    const [natureOfJobOptions, setNatureOfJobOptions] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState<JobTitle | null>(null);
    const [originalFPJobs, setOriginalFPJobs] = useState<FPJobRowData[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const [statusCount, setStatusCount] = useState<StatusCount[]>([]);

    const [isFirstTimeLoaded, setIsFirstTimeLoaded] = useState(false);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        if (engagementVertical.vertical && engagementVertical.vertical.wm_vertical_id === 5 && !isFirstTimeLoaded) {
            setIsFirstTimeLoaded(true);
            calculateMaxTabs();
            fetchFPJobs();
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [engagementVertical.vertical]);


    const handleFPJobUnselected = (job: FPJobRowData) => {
        calculateMaxTabs();
        if (fpTabs.length === 1) {
            setSelectedFPJob(null);
            setFPTabs([]);
        } else {
            if (selectedFPJob?.Aid === job.Aid) {
                const index = fpTabs.findIndex((tab) => tab.Aid === job.Aid);
                if (index > -1) {
                    if (index === 0) {
                        setSelectedFPJob(fpTabs[index + 1]);
                    } else {
                        setSelectedFPJob(fpTabs[index - 1]);
                    }
                }
            }
            setFPTabs(fpTabs.filter((tab) => tab.Aid !== job.Aid));
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
        if (fpJobs && fpJobs.length > 0) {
            const headers = Object.keys(fpJobs[0]);
            setFPHeaders(
                headers
                    .filter((header) => !excludeHeaders.includes(header))
                    .map((header) => ({ id: header, label: header }))
            );
        }
    }, [fpJobs]);

    const fetchFPJobs = async () => {
        try {
            setIsRefreshing(true);
            const response = await fetch(jobAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: verticals.fp,
                    project_id: context?.userData?.project_id,
                    user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
                    filters: JSON.stringify(getFilters())
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setFPJobs(data.data ?? []);
            setOriginalFPJobs(data.data ?? []);
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

    const fetchFPJobsWith = async (customFilter: any) => {
        try {
            setIsRefreshing(true);
            const response = await fetch(jobAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: verticals.fp,
                    project_id: context?.userData?.project_id,
                    user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
                    filters: JSON.stringify(getFilterswith(customFilter))
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setFPJobs(data.data ?? []);
            if (Array.isArray(data.counts)) {
                setStatusCount(transformStatusCounts(data.counts, jobTitles));
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const switchJobTab = (job: FPJobRowData) => {
        setSelectedFPJob(job);
    };

    const handleJobSelected = (job: FPJobRowData) => {
        calculateMaxTabs();
        if (fpTabs.length >= maxTabs) return;

        if (!fpTabs.some(tab => tab.Aid === job.Aid)) {
            setFPTabs([...fpTabs, job]);
        }

        if (!isShiftPressed) {
            setSelectedFPJob(job);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsRefreshed(false), 3000);
        return () => clearTimeout(timer);
    }, [isRefreshed]);

    const downloadFPJobs = async () => {
        setIsExporting(true);

        try {
            const res = await fetch(downloadAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: verticals.fp,
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

    const handleJobFilterByTitle = (jobTitle: JobTitle | null) => {
        if (jobTitle && jobTitle.id) {
            const newFilters = { ...filters, status_id: jobTitle.id };
            setFilters(newFilters);
            setSelectedTitle(jobTitle);
            fetchFPJobsWith(newFilters);
        } else {
            const newFilters = { ...filters, status_id: -1 };
            setFilters(newFilters);
            setSelectedTitle({ id: -1, key: 'livejobs', title: 'Live Jobs', titleClass: '', valueClass: '', className: '' });
            fetchFPJobsWith(newFilters);
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
        fetchFPJobsWith(newFilters);
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
        if (originalFPJobs && originalFPJobs.length > 0) {
            const receivedFrom = originalFPJobs.map((job) => job.ReceivedFrom).filter((value, index, self) => self.indexOf(value) === index);
            setReceivedFrom(['All', ...receivedFrom]);
            const accountants = originalFPJobs.map((job) => job.Accountant).filter((value, index, self) => self.indexOf(value) === index);
            setAccountant(['All', ...accountants]);

            const natureOfJobOptions = originalFPJobs
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
    }, [originalFPJobs]);

    return (
        <div className="w-full">
            <div className="space-y-6">
                <ProgressPanel statusCount={statusCount} setSelectedTitle={handleJobFilterByTitle} selectedTitle={selectedTitle} isRefreshing={isRefreshing} containerClassName={`${isRefreshing && 'opacity-50 pointer-events-none'}`} hideIfNoValue={true} />

                <div className="flex flex-col gap-4 space-y-4">
                    <div className="flex-1">
                        <JobTabBar tabs={fpTabs} selectedTab={selectedFPJob} vertical={engagementVertical.vertical?.title || ""} onTabSelect={switchJobTab} onTabClose={handleFPJobUnselected} containerRef={containerRef} />
                        <div className="z-10 relative">
                            <div className={`${selectedFPJob === null ? "block" : "hidden"}`}>
                                <DashboardTable
                                    rows={fpJobs}
                                    headers={fpHeaders}
                                    jobSelected={handleJobSelected}
                                    isRefreshing={isRefreshing}
                                    toolbarContent={
                                        <div className="flex items-center">
                                            <FilterSummary 
                                                filters={filters} 
                                                jobTitles={jobTitles} 
                                                statusLookup={statusLookup} 
                                                onRemove={handleRemoveFilter}
                                                onValueClick={() => setIsFilterOpen(true)}
                                            />
                                            <JobToolbar
                                                isRefreshing={isRefreshing}
                                                refreshRecords={() => {
                                                    fetchFPJobs();
                                                }}
                                                setIsFilterOpen={setIsFilterOpen}
                                                isExporting={isExporting}
                                                downloadJobs={() => {
                                                    downloadFPJobs();
                                                }}
                                                disabled={fpJobs.length === 0 && !isRefreshing}
                                            />
                                        </div>
                                    }
                                />
                            </div>
                            {fpTabs && fpTabs.length > 0 && fpTabs.map((tab) => (
                                <div key={tab.Aid} className={`pb-5 ${selectedFPJob?.Aid === tab.Aid ? "block" : "hidden"}`}>
                                    <JobDetails<FPJobRowData> job={tab} jobUnselected={handleFPJobUnselected} />
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
                    fetchFPJobsWith(appliedFilters);
                }}
            />
        </div>
    );
};
