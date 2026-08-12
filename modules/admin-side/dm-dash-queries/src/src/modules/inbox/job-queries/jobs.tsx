import { useState, useEffect, useRef } from "react";
import { Pagination, Table, TableBody, TableHead, TableHeadCell, TableHeadRow, TableRow, TableRowData } from "../../../shell/components/collections/table";
import { Button } from "../../../shell/components/atoms/buttons";
import Queries from "../query-lists/queries";
import { X } from "lucide-react";
import JobToolbar from "./components/jobs-toolbar";
import { useClientSelection, type Client } from "../../../core/utils/stores/ClientSelectionContext";

export interface JobQuery {
    job_id: number;
    job_name: string;
    fy: number;
    jy: string;
    client: string;
    client_id: number;
    ob_touchpoint: string;
    vertical_id: number;
    vertical_name: string;
    query_code: string;
    query_title: string;
    query_posted_date: string;
    job_touchpoint_id: number,
    job_touchpoint: string,
    total_queries: number;
    open?: number;
    resolved?: number;
    draft?: number;
    responded?: number;
    closed?: number;
    low?: number;
    normal?: number;
    medium?: number;
    high?: number;
    fresh_queries?: number;
    pending_queries?: number;
    overdue_queries?: number;
}

interface JobQueryCounts {
    totalQueries: number;
    open: number;
    closed: number;
    responded: number;
    resolved: number;
    draft: number;
}

interface JobQueryAge {
    fresh_queries: number;
    pending_queries: number;
    overdue_queries: number;
}

interface JobQueryCriticality {
    low: number;
    normal: number;
    medium: number;
    high: number;
}

interface FilterJobQuery {
    field: keyof JobQuery | null;
    minCount: number;
}

interface JobProps {
    jobQueries: JobQuery[];
    onRefresh: () => void;
    isRefreshing: boolean;
    autoOpenJobId?: string | null;
}


export default function Jobs({ jobQueries, onRefresh, isRefreshing, autoOpenJobId }: JobProps) {
    const { clients, setSelectedClientIds } = useClientSelection();
    const [isLoading, setIsLoading] = useState(true);
    const [tabs, setTabs] = useState<JobQuery[]>([]);
    const [maxTabs, setMaxTabs] = useState(5); // default fallback
    const containerRef = useRef<HTMLDivElement>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobQuery | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [oldPage, setOldPage] = useState(0);
    const [filteredRows, setFilteredRows] = useState<JobQuery[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState<keyof JobQuery>('job_name');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [sortedRows, setSortedRows] = useState<JobQuery[]>([]);
    const [paginatedRows, setPaginatedRows] = useState<JobQuery[]>([]);
    const [selectedClients, setSelectedClients] = useState<typeof clients>([]);
    const [showOnlyWithQueries, setShowOnlyWithQueries] = useState(false);
    const [jobQueriesCount, setJobQueriesCount] = useState<JobQueryCounts>({
        totalQueries: 0,
        open: 0,
        closed: 0,
        responded: 0,
        resolved: 0,
        draft: 0
    });
    const [jobQueryCriticality, setJobQueryCriticality] = useState<JobQueryCriticality>({
        low: 0,
        normal: 0,
        medium: 0,
        high: 0
    });
    const [jobQueryAge, setJobQueryAge] = useState<JobQueryAge>({
        fresh_queries: 0,
        pending_queries: 0,
        overdue_queries: 0
    });
    const [selectedFilter, setSelectedFilter] = useState<FilterJobQuery>({
        field: null,
        minCount: 0
    });
    const [viewPerTab, setViewPerTab] = useState<Record<number, string>>({});
    const [windowPerTab, setWindowPerTab] = useState<Record<number, string>>({});
    const [autoOpenNotFound, setAutoOpenNotFound] = useState(false);
    const hasAutoOpenedRef = useRef(false);

    const normalizeDate = (date: any): string => {
        if (!date) return "";
        if (typeof date === "string") return new Date(date).toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (typeof date === "object") {
            // If it's something like { date: "2025-09-15T00:00:00Z" }
            return "-";
        }
        return String(date);
    };

    useEffect(() => {
        calculateMaxTabs();

        // Empty condition to avoid lint errors
        if(jobQueryAge) {}

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
    }, []);

    // 1. Initialize selected clients from context clients when they become available
    useEffect(() => {
        if (clients.length > 0 && selectedClients.length === 0) {
            setSelectedClients(clients);
        }
    }, [clients]);

    // 3. Initialize selected client IDs in context
    useEffect(() => {
        if (selectedClients.length > 0) {
            const clientIds = selectedClients.map(client => client.client_id).join(",");
            setSelectedClientIds(clientIds);
        }
    }, [selectedClients]);

    // 4. Search
    useEffect(() => {
        searchRows();
    }, [searchTerm]);

    // 5. Filtering
    useEffect(() => {
        filterRows();
    }, [jobQueries, selectedClients, showOnlyWithQueries]);

    // 6. Sorting
    useEffect(() => {
        sortRows();
    }, [filteredRows, order, orderBy]);

    // 7. Pagination
    useEffect(() => {
        paginateRows();
    }, [sortedRows, page, rowsPerPage]);

    // 8. Calculate total queries count
    useEffect(() => {
        const totals = filteredRows.reduce(
          (acc, job) => {
            acc.totalQueries += job.total_queries || 0;
            acc.open += job.open || 0;
            acc.closed += job.closed || 0;
            acc.responded += job.responded || 0;
            acc.resolved += job.resolved || 0;
            acc.draft += job.draft || 0;
            return acc;
          },
          {
            totalQueries: 0,
            open: 0,
            closed: 0,
            responded: 0,
            resolved: 0,
            draft: 0
          }
        );

        const criticality = filteredRows.reduce(
          (acc, job) => {
            acc.low += job.low || 0;
            acc.normal += job.normal || 0;
            acc.medium += job.medium || 0;
            acc.high += job.high || 0;
            return acc;
          },
          {
            low: 0,
            normal: 0,
            medium: 0,
            high: 0
          }
        );

        const age = filteredRows.reduce(
          (acc, job) => {
            acc.fresh_queries += job.fresh_queries || 0;
            acc.pending_queries += job.pending_queries || 0;
            acc.overdue_queries += job.overdue_queries || 0;
            return acc;
          },
          {
            fresh_queries: 0,
            pending_queries: 0,
            overdue_queries: 0
          }
        );

        setJobQueryAge(age);
        setJobQueryCriticality(criticality);
        setJobQueriesCount(totals);
    }, [filteredRows]);

    useEffect(() => {
    if (!selectedFilter.field) {
        filterRows(); // reset to base filters
        return;
    }

    const result = filteredRows.filter(row => {
        const value = row[selectedFilter.field!];
        return typeof value === "number" && value >= selectedFilter.minCount;
    });

    setFilteredRows(result);
    setPage(0);
    }, [selectedFilter]);

    const filterRows = () => {
        if (jobQueries.length > 0) {

            const result = jobQueries.filter(row => {
                // Filter by selected clients
                const clientMatch = selectedClients && selectedClients.length > 0
                    ? selectedClients.some(client => client.client_id === row.client_id)
                    : false;

                if (!clientMatch) {
                    return false;
                }

                // Filter by total_queries if toggle is on
                if (showOnlyWithQueries && row.total_queries <= 0) {
                    return false;
                }

                return true;
            });
            setFilteredRows(result);
            setIsLoading(false);
            if (searchTerm) {
                setPage(0);
            } else {
                setPage(oldPage);
            }
        }
    };

    const searchRows = () => {
        if (searchTerm) {
            const result = filteredRows.filter((row: JobQuery) => {
                return Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
            setFilteredRows(result);
            setPage(0);
        } else {
            filterRows();
            setPage(oldPage);
        }
    };

    const sortRows = () => {
        if (filteredRows.length > 0) {
            const sorted = [...filteredRows].sort((a, b) => {
                const aVal = a[orderBy as keyof JobQuery];
                const bVal = b[orderBy as keyof JobQuery];

                if(aVal && bVal) {
                    if (aVal < bVal) return order === 'asc' ? -1 : 1;
                    if (aVal > bVal) return order === 'asc' ? 1 : -1;
                }
                return 0;
            });
            setSortedRows(sorted);
        } else setSortedRows([]);
    };

    const paginateRows = () => {
        if (sortedRows && sortedRows.length > 0) {
            const start = page * rowsPerPage;
            const end = start + rowsPerPage;
            setPaginatedRows(sortedRows.slice(start, end));
        } else {
            setPaginatedRows([]);
        }
    };

    const handlePageChange = (page: number) => {
        setPage(page);
        setOldPage(page);
    };

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
        handlePageChange(0);
    };

    useEffect(() => {
        filterRows();
    }, [selectedClients]);

    const handleClientChange = (selectedClients: Client[]) => {
        console.log('clients changed ', selectedClients);
        setSelectedClients(selectedClients);

        // Update the context with client IDs
        let clientIds: string;
        // Specific clients selected - join their IDs with commas
        clientIds = selectedClients.map(client => client.client_id).join(",");


        setSelectedClientIds(clientIds);
    };

    const switchJobTab = (job: JobQuery) => {
        setSelectedJob(job);
    };

    const calculateMaxTabs = () => {
        if (containerRef.current) {
            const parentWidth = containerRef.current.offsetWidth;
            const fitTabs = Math.floor(parentWidth / 200); // 150px per tab
            setMaxTabs(fitTabs);
        }
    };

    const handleJobSelected = (job: JobQuery) => {
        calculateMaxTabs();
        if (tabs.length >= maxTabs) return;

        if (!tabs.some(tab => tab.job_id === job.job_id)) {
            setTabs([...tabs, job]);
        }

        //Check if user is pressed shift key
        if (!isShiftPressed) {
            setSelectedJob(job);
        }
    };


    const openJobOnView = (job: JobQuery, view: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewPerTab(prev => ({ ...prev, [job.job_id]: view }));
        setWindowPerTab(prev => ({ ...prev, [job.job_id]: "queries" }));
        handleJobSelected(job);
    };

    const openJobRaiseQuery = (job: JobQuery, e: React.MouseEvent) => {
        e.stopPropagation();
        setWindowPerTab(prev => ({ ...prev, [job.job_id]: "new_query" }));
        handleJobSelected(job);
    };

    useEffect(() => {
        if (hasAutoOpenedRef.current) return;
        if (!autoOpenJobId || jobQueries.length === 0) return;

        hasAutoOpenedRef.current = true;
        const job = jobQueries.find(j => String(j.job_id) === String(autoOpenJobId));
        if (job) {
            openJobRaiseQuery(job, { stopPropagation: () => {} } as React.MouseEvent);
        } else {
            setAutoOpenNotFound(true);
        }
    }, [autoOpenJobId, jobQueries]);

    const handleJobUnselected = (job: JobQuery) => {
        calculateMaxTabs();
        if (tabs.length === 1) {
            setSelectedJob(null);
            setTabs([]);
        } else {
            // select nearest tab on right or left
            // if unselected job is selected tab switch to nrearest tab or else just remove the tab
            if (selectedJob?.job_id === job.job_id) {
                const index = tabs.findIndex((tab) => tab.job_id === job.job_id);
                if (index > -1) {
                    if (index === 0) {
                        setSelectedJob(tabs[index + 1]);
                    } else {
                        setSelectedJob(tabs[index - 1]);
                    }
                }
            }
            setTabs(tabs.filter((tab) => tab.job_id !== job.job_id));
        }
    };

    return (
        <div>
            <div>
                {autoOpenNotFound && (
                    <div className="mx-4 mt-2 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm px-4 py-2 flex items-center justify-between">
                        <span>The requested job could not be found in your query list. It may not be assigned to you or the id may be incorrect.</span>
                        <button className="text-yellow-800 hover:text-yellow-900 cursor-pointer" onClick={() => setAutoOpenNotFound(false)}><X size={16} /></button>
                    </div>
                )}
                {jobQueries && jobQueries.length > 0 && (
                    <div className="space-y-6">
                        <div className="px-4 py-2 overflow-x-auto">
                            <h2 className="text-lg font-bold text-slate-700 mb-2 text-center">Your Query Summary</h2>
                            <div className="flex gap-4 items-stretch justify-center whitespace-nowrap">
                                <div className="flex flex-col justify-center items-center">
                                    <div className="flex items-stretch gap-4 bg-white rounded-lg shadow-sm">
                                        <JobQueryCount label="Total Queries" count={jobQueriesCount.totalQueries} onClick={() => setSelectedFilter({ field: null, minCount: 0 })} />
                                        {selectedFilter.field !== null &&
                                            <div className="flex items-center pr-4"><button className="cursor-pointer aspect-square text-xs bg-primary hover:bg-secondary text-white px-2 py-1 rounded-full" onClick={() => setSelectedFilter({ field: null, minCount: 0 })}><X size={16} /></button></div>
                                        }
                                    </div>
                                    <label>&nbsp;</label>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex items-stretch">
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "draft"} label="Draft" count={jobQueriesCount.draft} onClick={() => setSelectedFilter({ field: "draft", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "open"} label="Open" count={jobQueriesCount.open} color="yellow" onClick={() => setSelectedFilter({ field: "open", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "responded"} label="Responded" count={jobQueriesCount.responded} color="blue" onClick={() => setSelectedFilter({ field: "responded", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "resolved"} label="Resolved" count={jobQueriesCount.resolved} color="green" onClick={() => setSelectedFilter({ field: "resolved", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "closed"} label="Closed" count={jobQueriesCount.closed} color="green" onClick={() => setSelectedFilter({ field: "closed", minCount: 1 })} />
                                    </div>
                                    <div className="flex items-center"><span className="text-primary px-3 py-1 font-medium rounded-full text-xs">Status Filter</span></div>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <div className="flex items-stretch bg-white rounded-lg shadow-sm overflow-hidden">
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "low"} label="Low" count={jobQueryCriticality.low} onClick={() => setSelectedFilter({ field: "low", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "normal"} label="Normal" count={jobQueryCriticality.normal} color="blue" onClick={() => setSelectedFilter({ field: "normal", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "medium"} label="Medium" count={jobQueryCriticality.medium} color="yellow" onClick={() => setSelectedFilter({ field: "medium", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "high"} label="High" count={jobQueryCriticality.high} color="red" onClick={() => setSelectedFilter({ field: "high", minCount: 1 })} />
                                    </div>
                                    <div className="flex items-center"><span className="text-yellow-800 px-3 py-1 font-medium rounded-full text-xs">Criticality Filter</span></div>
                                </div>
                                {/* <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-stretch bg-white rounded-lg shadow-sm overflow-hidden">
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "fresh_queries"} label="Fresh < 5" count={jobQueryAge.fresh_queries} onClick={() => setSelectedFilter({ field: "fresh_queries", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "pending_queries"} label="Pending < 10" count={jobQueryAge.pending_queries} color="yellow" onClick={() => setSelectedFilter({ field: "pending_queries", minCount: 1 })} />
                                        <JobQueryCount isSelectedFilter={selectedFilter.field === "overdue_queries"} label="Overdue > 10" count={jobQueryAge.overdue_queries} color="red" highlightCount={15} onClick={() => setSelectedFilter({ field: "overdue_queries", minCount: 1 })} />
                                    </div>
                                    <div className="flex items-center"><span className="text-secondary px-3 py-1 font-medium rounded-full text-xs">Aging Filter (in days)</span></div>
                                </div> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 space-y-4">
                            <div className="flex-1">
                                <div className="flex items-end gap-2 px-5 -z-0 select-none">
                                    <JobTabButton id={0}
                                        index={-1}
                                        title="Jobs List"
                                        onClose={() => setSelectedJob(null)}
                                        onClick={() => setSelectedJob(null)}
                                        isSelected={selectedJob === null}
                                        theme="primary"
                                    />
                                    <div className="flex-1 w-full flex items-center gap-2" ref={containerRef}>
                                        {tabs.map((tab, index) => (
                                            <JobTabButton
                                                index={index}
                                                key={tab.job_id}
                                                id={Number(tab.job_id)}
                                                title={tab.job_name}
                                                isSelected={selectedJob?.job_id === tab.job_id}
                                                onClose={() => handleJobUnselected(tab)}
                                                onClick={() => switchJobTab(tab)}
                                                theme="secondary"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="z-10 relative">
                                    {jobQueries && jobQueries.length > 0 &&
                                        <div className={`${selectedJob === null ? "block" : "hidden"}`}>
                                            <div className="rounded-xl shadow-sm border-2 border-primary">
                                                <JobToolbar
                                                    containerClass="rounded-t-lg"
                                                    events={{
                                                        onSearch: (searchTerm: string) => setSearchTerm(searchTerm),
                                                        onClientChange: (clients: Client[]) => handleClientChange(clients),
                                                        onToggleWithQueries: (value: boolean) => setShowOnlyWithQueries(value),
                                                        onRefresh: onRefresh,
                                                    }}
                                                    values={{
                                                        clients,
                                                        selectedClients,
                                                        showOnlyWithQueries,
                                                        isRefreshing: isRefreshing,
                                                    }}
                                                />

                                                {isLoading && <div>Loading queries...</div>}
                                                {!isLoading && jobQueries && jobQueries.length > 0 && !selectedJob &&
                                                    <div className="select-none">
                                                        <Table>
                                                            <TableHead>
                                                                <TableHeadRow>
                                                                    <TableHeadCell onClick={() => { setOrderBy("job_name"); setOrder(order === "asc" ? "desc" : "asc"); }}>Job Name</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("client"); setOrder(order === "asc" ? "desc" : "asc"); }}>Client Name</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("fy"); setOrder(order === "asc" ? "desc" : "asc"); }} className="text-right">FY</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("ob_touchpoint"); setOrder(order === "asc" ? "desc" : "asc"); }}>OB Touchpoint</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("jy"); setOrder(order === "asc" ? "desc" : "asc"); }}>JY</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("vertical_name"); setOrder(order === "asc" ? "desc" : "asc"); }}>Vertical</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("query_title"); setOrder(order === "asc" ? "desc" : "asc"); }}>Last Query</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("total_queries"); setOrder(order === "asc" ? "desc" : "asc"); }} className="text-right">Total Queries</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("open"); setOrder(order === "asc" ? "desc" : "asc"); }} className="text-right">Open</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("responded"); setOrder(order === "asc" ? "desc" : "asc"); }} className="text-right">Responded</TableHeadCell>
                                                                    <TableHeadCell onClick={() => { setOrderBy("resolved"); setOrder(order === "asc" ? "desc" : "asc"); }} className="text-right">Resolved</TableHeadCell>
                                                                    <TableHeadCell className="text-center">Raise Query</TableHeadCell>
                                                                </TableHeadRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {paginatedRows.map((job: JobQuery) => (
                                                                    <TableRow key={job.job_id} className="cursor-pointer font-medium" onClick={() => { handleJobSelected(job) }}>
                                                                        <TableRowData className="text-secondary/90 font-semibold">{job.job_name ?? '-'}</TableRowData>
                                                                        <TableRowData>{job.client ?? '-'}</TableRowData>
                                                                        <TableRowData className="text-right">{job.fy ?? '-'}</TableRowData>
                                                                        <TableRowData>{job.ob_touchpoint ?? '-'}</TableRowData>
                                                                        <TableRowData>{new Date(job.jy).toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' }) ?? '-'}</TableRowData>
                                                                        <TableRowData>{job.vertical_name ?? '-'}</TableRowData>
                                                                        <TableRowData>
                                                                            <div>{job.query_title ?? '-'}</div>
                                                                            {job.query_posted_date && <div className="text-xs text-slate-500">({normalizeDate(job.query_posted_date)})</div>}
                                                                        </TableRowData>
                                                                        <TableRowData className="text-right cursor-pointer text-secondary hover:underline" onClick={(e) => openJobOnView(job, "all", e)}>{job.total_queries ?? '-'}</TableRowData>
                                                                        <TableRowData className="text-right cursor-pointer text-secondary hover:underline" onClick={(e) => openJobOnView(job, "open", e)}>{job.open ?? '-'}</TableRowData>
                                                                        <TableRowData className="text-right cursor-pointer text-secondary hover:underline" onClick={(e) => openJobOnView(job, "responded", e)}>{job.responded ?? '-'}</TableRowData>
                                                                        <TableRowData className="text-right cursor-pointer text-secondary hover:underline" onClick={(e) => openJobOnView(job, "resolved", e)}>{job.resolved ?? '-'}</TableRowData>
                                                                        <TableRowData className="text-center" onClick={(e) => openJobRaiseQuery(job, e)}>
                                                                            <button className="text-xs bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full whitespace-nowrap cursor-pointer">+ Raise Query</button>
                                                                        </TableRowData>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                        <Pagination rowsPerPage={rowsPerPage} handleRowsPerPageChange={handleRowsPerPageChange} page={page} setPage={handlePageChange} filteredRows={filteredRows} />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    }
                                    {tabs && tabs.length > 0 && tabs.map((tab) => (
                                        <div key={tab.job_id} className={`pb-5 ${selectedJob?.job_id === tab.job_id ? "block" : "hidden"}`}>
                                            <Queries selectedJobQuery={tab} onClose={() => handleJobUnselected(tab)} initialView={viewPerTab[tab.job_id] as any} initialWindow={windowPerTab[tab.job_id] as any}></Queries>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface JobTabButtonProps {
    id: number;
    index: number;
    title: string;
    onClose: (id: number) => void;
    onClick: (id: number) => void;
    isSelected?: boolean;
    theme?: "primary" | "secondary";
}

const JobTabButton = ({ id, index, title, onClose, onClick, isSelected = false, theme = "primary" }: JobTabButtonProps) => {

    const themeClass = theme === "primary" ? "bg-primary text-white border-primary" : "bg-slate-700 text-white border-secondary";

    return (
        <div
            data-job-id={id}
            className={`
                cursor-pointer  rounded-t-lg flex items-center gap-2 transition-all duration-200
                pl-3 pr-2 pt-2 pb-3 border-l border-t border-r
                ${isSelected ? `${themeClass} translate-y-0 shadow-xl` : "bg-slate-200 text-slate-700 translate-y-2 border-slate-300"}
            `}
            onClick={() => onClick(id)}
        >
            <div className={`text-xs font-semibold whitespace-nowrap overflow-x-hidden text-ellipsis w-[150px]`}>
                {index > -1 && `${index + 1}. `} {title}
            </div>
            {index !== -1 &&
                <Button
                    theme="simple"
                    className={`p-0 ${isSelected ? "text-white" : "text-slate-700"}`}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClose(id) }}
                >
                    <X size={16} />
                </Button>
            }
        </div>
    );
};


const JobQueryCount = ({
  label,
  count,
  color,
  highlightCount,
  isSelectedFilter,
  onClick
}: {
  label: string;
  count: number;
  color?: string;
  highlightCount?: number;
  isSelectedFilter?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-r border-slate-200 last:border-0 group`}
    >
        <div className={`border-t-2 flex flex-col items-end ${color ? `bg-${color}-50 border-${color}-500` : "border-transparent"} px-4 py-1`}>
            <div className={`
                text-xs font-semibold rounded-full px-2 transition-all duration-300
                ${isSelectedFilter ? "bg-primary text-white" : "text-slate-700/80 group-hover:bg-secondary group-hover:text-white"}
            `}>
                {label}
            </div>
            <div 
                className={`
                    text-lg
                    ${highlightCount && count > highlightCount ? "text-red-500 font-semibold bg-red-50" : "text-slate-700"}
                `}
            >
                {count}
            </div>
        </div>
    </div>
  );
};
