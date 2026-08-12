import { useEffect, useState } from "react";
import { apiRoutes } from "../../../config/api-routes";
import { getPostData, postData } from "../../../core/utils/helpers/fetch";
import {
    Pagination,
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
    TableHeadRow,
    TableRow,
    TableRowData,
} from "../../../shell/components/collections/table";
import type { JobQuery } from "../job-queries/jobs";
import QueryToolbar from "./components/queries-toolbar";
import { SubQueries } from "./components/sub-queries";
import { Button } from "../../../shell/components/atoms/buttons";
import SimpleLoader from "../../../shell/components/atoms/loaders";
import type { Query } from "../../../core/models/query";
import { NewQueryView } from "./new-queries/new-query";
import { ArrowLeft, MessageCircle, MessageCirclePlus } from "lucide-react";
import { SimpleDialog } from "../../../shell/components/dialogs/dialog";
import React from "react";
import Tiptap from "../../../shell/components/tools/TipTap";
import type { ClientUser } from "../../../core/models/user";
import { useAppContext } from "../../../core/utils/stores/AppContext";
import { decryptData } from "../../../core/utils/helpers/localStorage";

interface JobQueryProps {
    selectedJobQuery: JobQuery;
    onClose: () => void;
    initialView?: "all" | "draft" | "open" | "responded" | "resolved" | "closed";
    initialWindow?: "queries" | "new_query";
}

interface QueryCounts {
    draft: number;
    open: number;
    responded: number;
    resolved: number;
    closed: number;
    all: number;
}

export interface QueryView {
    label: string | React.ReactNode;
    value: keyof QueryCounts;
    count: number;
}

const Views: QueryView[] = [
    { label: "All Queries", value: "all", count: 0 },
    { label: "Draft", value: "draft", count: 0 },
    { label: "Open", value: "open", count: 0 },
    { label: "Responded", value: "responded", count: 0 },
    { label: "Resolved", value: "resolved", count: 0 },
    { label: "Closed", value: "closed", count: 0 },
];

export interface QueryWindow {
    label: "queries" | "new_query";
    value: string;
    icon?: React.ReactNode;
}

export const Windows: QueryWindow[] = [
    { label: "queries", value: "Queries", icon: <MessageCircle size={18} /> },
    {
        label: "new_query",
        value: "Raise Query",
        icon: <MessageCirclePlus size={18} />,
    },
];

export default function Queries({ selectedJobQuery, onClose, initialView, initialWindow }: JobQueryProps) {
    const context = useAppContext();
    const userData = context?.userData;
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [queries, setQueries] = useState<Query[]>([]);
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [filteredRows, setFilteredRows] = useState<Query[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [orderBy, setOrderBy] = useState<keyof Query>("query_code");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [sortedRows, setSortedRows] = useState<Query[]>([]);
    const [paginatedRows, setPaginatedRows] = useState<Query[]>([]);
    const [views, setViews] = useState<QueryView[]>(Views);
    const [selectedQueryView, setSelectedQueryView] = useState<QueryView>(
        views[3],
    );
    const [window, setWindow] = useState<QueryWindow>(Windows[0]);
    const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
    const [isApprover, setIsApprover] = useState(false);
    const [showExistingQueriesDialog, setShowExistingQueriesDialog] = useState(false);
    const [selectedDraftQueryForEdit, setSelectedDraftQueryForEdit] =
        useState<Query | null>(null);
    // const [DraftSubQueries, setDraftSubQueries] = useState<SubQuery[]>([]);

    useEffect(() => {
        if (!isMounted) {
            getClientUsers();
            // getDraftSubQueries();
            checkIfApprover();
            setIsMounted(true);
        }
    }, [isMounted]);

    useEffect(() => {
        if (initialView) {
            const view = views.find(v => v.value === initialView);
            if (view) setSelectedQueryView(view);
        }
    }, [initialView]);

    useEffect(() => {
        if (initialWindow) {
            const win = Windows.find(w => w.label === initialWindow);
            if (win) setWindow(win);
        }
    }, [initialWindow]);

    useEffect(() => {
        if (window.label === "new_query" && queries.length > 0) {
            setShowExistingQueriesDialog(true);
        }
    }, [window.label, queries.length]);

    useEffect(() => {
        setSelectedQueryView(prev => {
            const updated = views.find(v => v.value === prev.value);
            return updated ?? prev;
        });
    }, [views]);

    // 1. Filtering
    useEffect(() => {
        if (queries.length > 0) {
            // 1. Filter by search term
            let result = queries.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase()),
                ),
            );

            // 2. Further filter by selected status (if applicable)
            if (selectedQueryView?.value) {
                if (selectedQueryView.value === "all") {
                    result = queries;
                } else {
                    result = result.filter(
                        (row) => row.query_status_code === selectedQueryView.value,
                    );
                }
            }

            // Set final sorted rows
            // Reset order and set filteredRows
            setOrder("asc");
            if (result && result.length > 0) setFilteredRows(result);
            else setFilteredRows([]);
            setIsLoading(false);
        } else setFilteredRows([]);
    }, [queries, searchTerm, selectedQueryView]);

    // 2. Sorting
    useEffect(() => {
        if (filteredRows.length > 0) {
            const sorted = [...filteredRows].sort((a, b) => {
                const aVal = a[orderBy as keyof Query];
                const bVal = b[orderBy as keyof Query];

                if (aVal < bVal) return order === "asc" ? -1 : 1;
                if (aVal > bVal) return order === "asc" ? 1 : -1;
                return 0;
            });
            setSortedRows(sorted);
        } else setSortedRows([]);
    }, [filteredRows, order, orderBy]);

    // 3. Pagination
    useEffect(() => {
        if (sortedRows.length > 0) {
            const start = page * rowsPerPage;
            const end = start + rowsPerPage;
            setPaginatedRows(sortedRows.slice(start, end));
        } else setPaginatedRows([]);
    }, [sortedRows, page, rowsPerPage]);

    // 4. Query counts
    useEffect(() => {
        updateQueryCounts();
    }, [queries, filteredRows]);

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

    const getClientUsers = () => {
        getPostData(apiRoutes.client.get.getClientUsers, {
            project_id: selectedJobQuery.client_id,
        }).then((data) => {
            setClientUsers(data.data);
        });
    };

    // const getDraftSubQueries = () => {
    //     getPostData(apiRoutes.queries.get.getDraftSubQueries, {
    //         user_id: userData?.staff_id || 0,
    //         client_id: selectedJobQuery.client_id
    //     }).then((data) => {
    //         setDraftSubQueries(data.data);
    //     });
    // };

    const checkIfApprover = async () => {
        try {
            const response = await getPostData(apiRoutes.permission.isApprover, {
                user_id: userData?.staff_id || 0,
                client_id: selectedJobQuery.client_id,
            });
            if (response && response.status) {
                setIsApprover(true);
            } else {
                setIsApprover(false);
            }
        } catch (error) {
            console.error("Failed to check approver status", error);
            setIsApprover(false);
        }
    };

    const fetchQueries = async () => {
        setIsLoading(true);
        try {
            const data = await getPostData(apiRoutes.queries.get.getQueries, {
                filters: [
                    {
                        code: "category_id",
                        value: 0,
                    },
                    {
                        code: "sub_category_id",
                        value: 0,
                    },
                    {
                        code: "criticality_id",
                        value: 0,
                    },
                    {
                        code: "status_id",
                        value: 0,
                    },
                    {
                        code: "raised_to_id",
                        value: 0,
                    },
                    {
                        code: "raised_by_id",
                        value: 0,
                    },
                ],
                jobId: selectedJobQuery?.job_id,
                isAdmin: true,
            });
            console.log("queries in fetch", data);
            if (data.queries?.length > 0) {
                setQueries(data.queries);
                console.log("queries in fetch", data.queries);
            } else {
                setQueries([]); // clear old queries if none come back
            }
        } catch (error) {
            console.error("Failed to fetch queries", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQueryCounts = () => {
        if (queries.length > 0) {
            const draft = queries.filter(
                (query) => query.query_status_code === "draft",
            ).length;
            const open = queries.filter(
                (query) => query.query_status_code === "open",
            ).length;
            const responded = queries.filter(
                (query) => query.query_status_code === "responded",
            ).length;
            const resolved = queries.filter(
                (query) => query.query_status_code === "resolved",
            ).length;
            const closed = queries.filter(
                (query) => query.query_status_code === "closed",
            ).length;
            const all = queries.length;
            const countMap: Record<string, number> = { draft, open, responded, resolved, closed, all };
            setViews(prev => prev.map(view => ({ ...view, count: countMap[view.value] ?? view.count })));
        }
    };

    useEffect(() => {
        fetchQueries();
    }, [selectedJobQuery]);

    const approveDraftQuery = (
        query: Query,
        edited_reason: string,
        updated_query?: string,
    ) => {
        postData(apiRoutes.queries.update.approveDraftQuery, {
            query_id: query.id,
            status_id: 2,
            query: updated_query || query.query,
            title: query.title,
            user_id: JSON.parse(decryptData(localStorage.getItem("userdata")))
                ?.staff_id,
            user_name:
                JSON.parse(decryptData(localStorage.getItem("userdata")))?.first_name +
                " " +
                JSON.parse(decryptData(localStorage.getItem("userdata")))?.last_name,
            reject_reason: "",
            edited_reason: edited_reason,
        })
            .catch((error) => {
                console.error("Failed to approve draft query", error);
            })
            .then(() => {
                fetchQueries();
            });
    };

    const rejectDraftQuery = (query: Query, reject_reason: string) => {
        postData(apiRoutes.queries.update.rejectDraftQuery, {
            query_id: query.id,
            status_id: 2,
            query: query.query,
            title: query.title,
            user_id: JSON.parse(decryptData(localStorage.getItem("userdata")))
                ?.staff_id,
            user_name:
                JSON.parse(decryptData(localStorage.getItem("userdata")))?.first_name +
                " " +
                JSON.parse(decryptData(localStorage.getItem("userdata")))?.last_name,
            reject_reason: reject_reason,
            edited_reason: "",
        })
            .catch((error) => {
                console.error("Failed to reject draft query", error);
            })
            .then(() => {
                setSelectedQuery(null);
                fetchQueries();
            });
    };

    // new helper to update the queries list immutably
    const handleLocalQueryUpdate = (id: number, payload: Partial<Query>) => {
        setQueries((prev) =>
            prev.map((q) => (q.id === id ? { ...q, ...payload } : q)),
        );
    };

    return (
        <div>
            {showExistingQueriesDialog && (
                <SimpleDialog
                    title={`Existing Queries for this Job (${queries.length})`}
                    dialogSize="lg"
                    dialogStyle="rounded"
                    onClose={() => setShowExistingQueriesDialog(false)}
                >
                    <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                        {queries.map((q, i) => (
                            <div key={q.id} className="flex items-start gap-3 py-3 px-2">
                                <span className="text-xs text-slate-400 w-5 shrink-0">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800 truncate">{q.title ?? '-'}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex gap-3">
                                        <span>{q.category_name ?? ''}</span>
                                        {q.criticality_name && <span>· {q.criticality_name}</span>}
                                        {q.posted_date && <span>· {q.posted_date.split('T')[0]}</span>}
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                    q.query_status_code === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                    q.query_status_code === 'responded' ? 'bg-blue-100 text-blue-800' :
                                    q.query_status_code === 'resolved' ? 'bg-green-100 text-green-800' :
                                    q.query_status_code === 'draft' ? 'bg-slate-100 text-slate-600' :
                                    'bg-slate-100 text-slate-500'
                                }`}>{q.query_status_code}</span>
                            </div>
                        ))}
                    </div>
                </SimpleDialog>
            )}
            <div className="rounded-xl shadow-lg border-2 border-slate-700">
                <QueryToolbar
                    values={{ searchTerm }}
                    events={{
                        onClose,
                        setSearchTerm,
                    }}
                    selectedJobQuery={selectedJobQuery}
                    views={views}
                    selectedQueryView={selectedQueryView}
                    onViewChange={(v) => { setSelectedQueryView(v); setWindow(Windows[0]); }}
                />
                {isLoading && (
                    <div className="p-5">
                        <SimpleLoader />
                    </div>
                )}
                {!isLoading && (
                    <div>
                        {window.label === "new_query" && (
                            <div>
                                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
                                    <span className="text-sm font-semibold text-slate-700">Raise New Query</span>
                                    <Button theme="outline" shape="pill" className="flex items-center gap-1 text-xs px-3 py-1" onClick={() => setWindow(Windows[0])}>
                                        <ArrowLeft size={14} strokeWidth={2} /> Back to Queries
                                    </Button>
                                </div>
                                <NewQueryView
                                    values={{
                                        selectedJobQuery: selectedJobQuery,
                                        clientUsers: clientUsers,
                                    }}
                                    events={{
                                        queryAdded: (doesReviewerExists) => {
                                            fetchQueries();
                                            setWindow(Windows[0]);
                                            if (doesReviewerExists) {
                                                setSelectedQueryView(views[2]);
                                            } else {
                                                setSelectedQueryView(views[1]);
                                            }
                                        },
                                    }}
                                />
                            </div>
                        )}
                        {window.label === "queries" && (
                            <div>
                                <div className="z-0 relative">
                                    <Table>
                                        <TableHead>
                                            <TableHeadRow className="bg-gradient-to-b from-slate-100 to-slate-200">
                                                <TableHeadCell>#</TableHeadCell>
                                                <TableHeadCell
                                                    onClick={() => setOrderBy("title")}
                                                    className="cursor-pointer"
                                                >
                                                    Query Title
                                                </TableHeadCell>
                                                <TableHeadCell
                                                    onClick={() => setOrderBy("query")}
                                                    className="cursor-pointer"
                                                >
                                                    Query
                                                </TableHeadCell>
                                                <TableHeadCell>Attachments</TableHeadCell>
                                                <TableHeadCell
                                                    onClick={() => setOrderBy("posted_date")}
                                                    className="cursor-pointer"
                                                >
                                                    Posted Date
                                                </TableHeadCell>
                                                <TableHeadCell
                                                    onClick={() => setOrderBy("resolved_date")}
                                                    className="cursor-pointer"
                                                >
                                                    Resolved Date
                                                </TableHeadCell>
                                                <TableHeadCell className="text-center">
                                                    Actions
                                                </TableHeadCell>
                                            </TableHeadRow>
                                        </TableHead>
                                        <TableBody>
                                            {!paginatedRows ||
                                                (paginatedRows.length === 0 && (
                                                    <TableRow>
                                                        <TableRowData colSpan={8} className="text-center">
                                                            <div className="flex flex-col items-center justify-center gap-2 py-5">
                                                                <div className="text-slate-500 text-lg">
                                                                    No queries found
                                                                </div>
                                                            </div>
                                                        </TableRowData>
                                                    </TableRow>
                                                ))}
                                            {paginatedRows &&
                                                paginatedRows.length > 0 &&
                                                paginatedRows.map((query: Query, index: number) => {
                                                    return (
                                                        <React.Fragment key={query.id}>
                                                            <QueryRow
                                                                query={query}
                                                                index={index}
                                                                selectedQuery={selectedQuery}
                                                                setSelectedQuery={setSelectedQuery}
                                                                approveDraftQuery={approveDraftQuery}
                                                                rejectDraftQuery={rejectDraftQuery}
                                                                isApprover={isApprover}
                                                                selectedDraftQueryForEdit={
                                                                    selectedDraftQueryForEdit
                                                                }
                                                                setSelectedDraftQueryForEdit={
                                                                    setSelectedDraftQueryForEdit
                                                                }
                                                                onSaveDraft={handleLocalQueryUpdate}
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Pagination
                                    rowsPerPage={rowsPerPage}
                                    handleRowsPerPageChange={handleRowsPerPageChange}
                                    page={page}
                                    setPage={setPage}
                                    filteredRows={filteredRows}
                                />
                                <div className="flex justify-end px-4 py-3 border-t border-slate-200">
                                    <Button
                                        theme="simple"
                                        shape="pill"
                                        className="bg-gradient-to-b from-primary-800 to-primary-900 hover:text-white hover:shadow-xl hover:scale-110 shadow-lg duration-200 text-white flex items-center gap-2 py-2"
                                        onClick={() => setWindow(Windows[1])}
                                    >
                                        <MessageCirclePlus strokeWidth={1.5} /> Raise New Query
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface QueryRowProps {
    query: Query;
    index: number;
    selectedQuery: Query | null;
    setSelectedQuery: React.Dispatch<React.SetStateAction<Query | null>>;
    approveDraftQuery: (
        query: Query,
        comment: string,
        updated_query?: string,
    ) => void;
    rejectDraftQuery: (query: Query, comment: string) => void;
    isApprover: boolean;
    selectedDraftQueryForEdit: Query | null;
    setSelectedDraftQueryForEdit: (query: Query | null) => void;
    onSaveDraft?: (id: number, payload: Partial<Query>) => void;
}

const QueryRow = ({
    query,
    index,
    selectedQuery,
    setSelectedQuery,
    approveDraftQuery,
    rejectDraftQuery,
    isApprover,
    selectedDraftQueryForEdit,
    setSelectedDraftQueryForEdit,
    onSaveDraft,
}: QueryRowProps) => {
    const [editorContent, setEditorContent] = useState(query.query);
    const [updatedQuery, setUpdatedQuery] = useState<Query>(query);

    useEffect(() => {
        if (selectedDraftQueryForEdit?.id === query.id) {
            setEditorContent(query.query);
            setUpdatedQuery(query);
        }
    }, [selectedDraftQueryForEdit, query.id, query.query]);

    const handleSaveDraftQuery = () => {
        // Update the local query object with new content
        const newQuery = { ...updatedQuery, query: editorContent };
        console.log("Draft saved:", updatedQuery);
        setUpdatedQuery(newQuery);

        // Update the original query object passed as prop
        if (onSaveDraft) {
            onSaveDraft(query.id, { query: editorContent });
        }

        // if this query is currently selected in the parent view, update that too
        setSelectedQuery((prev) =>
            prev && prev.id === query.id ? { ...prev, query: editorContent } : prev,
        );
        setSelectedDraftQueryForEdit(null);

        // Optionally: show a toast or notification
        console.log("Draft saved:", newQuery);
    };

    return (
        <TableRow
            noHover={true}
            className={`
            transition-all duration-100 ${selectedQuery?.id === query.id ? "border-t-2 border-t-secondary border-b border-b-slate-300" : ""}
        `}
            onClick={(e) => {
                if (query.query_status_code == "draft") return null;
                e.stopPropagation();
                if (selectedQuery?.id !== query.id) {
                    setSelectedQuery(query);
                }
            }}
        >
            <TableRowData verticalAlign="top">{index + 1}</TableRowData>
            <TableRowData verticalAlign="top">
                <div className="sticky top-[32px] text-secondary/90 font-semibold">
                    {query.title ?? "-"}
                </div>
            </TableRowData>
            <TableRowData
                verticalAlign="top"
                className="max-w-lg"
                onClick={(e: any) => {
                    if (query.query_status_code === "draft") {
                        e.stopPropagation();
                        setSelectedDraftQueryForEdit(query);
                    }
                }}
            >
                <div className="space-y-4 lg:max-w-lg xl:max-w-xl">
                    {selectedDraftQueryForEdit?.id === query.id &&
                        query.query_status_code === "draft" ? (
                        <div
                            className="flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Tiptap
                                content={editorContent}
                                onChange={(content) => setEditorContent(content)}
                            />
                            <div className="flex gap-2">
                                <Button
                                    theme="simple"
                                    className="bg-green-700 text-white hover:bg-green-100"
                                    onClick={handleSaveDraftQuery}
                                >
                                    Save
                                </Button>
                                <Button
                                    theme="simple"
                                    onClick={() => setSelectedDraftQueryForEdit(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`overflow-hidden ${selectedQuery?.id === query.id ? "max-h-auto" : "max-h-[100px] "}`}
                                dangerouslySetInnerHTML={{
                                    __html: updatedQuery.query ?? query.query ?? "-",
                                }}
                            />
                            {selectedQuery && selectedQuery.id === query.id && (
                                <SubQueries
                                    queryId={query.id}
                                    onClose={() => setSelectedQuery(null)}
                                    containerClassName={`${index % 2 !== 0 ? "bg-white" : "bg-slate-50"}`}
                                    isApprover={isApprover}
                                />
                            )}
                        </>
                    )}
                </div>
            </TableRowData>
            <TableRowData verticalAlign="top">
                <div className="flex flex-col gap-2 w-full max-w-[100px]">
                    {query.attachments &&
                        query.attachments.length > 0 &&
                        query.attachments.map((attachment: any, index: number) => (
                            <div key={index}>
                                <a
                                    className="truncate text-blue-700"
                                    href={attachment.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {attachment.name ?? `Document ${index + 1}`}
                                </a>
                            </div>
                        ))}
                    {!query.attachments ||
                        (query.attachments.length <= 0 && <div>No attachments</div>)}
                </div>
            </TableRowData>
            <TableRowData verticalAlign="top">
                <div className="sticky top-[32px]">
                    {new Date(query.posted_date).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    }) ?? "-"}
                </div>
            </TableRowData>
            <TableRowData verticalAlign="top">
                <div className="sticky top-[32px]">
                    {query.resolved_date ?? "-"}
                </div>
            </TableRowData>
            <TableRowData verticalAlign="top">
                <div className="flex flex-col gap-1 sticky top-[32px]">
                    {query.query_status_code === "draft" ? (
                        <>
                            {isApprover && (
                                <>
                                    <Button
                                        theme="simple"
                                        className="bg-green-700 text-white hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            approveDraftQuery(query, "", updatedQuery.query);
                                        }}
                                        props={{
                                            disabled: selectedDraftQueryForEdit?.id === query.id,
                                        }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        theme="simple"
                                        className="bg-red-300 text-primary hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            const reason = window.prompt(
                                                "Please provide a reason for rejecting this query.",
                                            );
                                            if (reason && reason.trim().length > 0) {
                                                rejectDraftQuery(query, reason);
                                            }
                                        }}
                                        props={{
                                            disabled: selectedDraftQueryForEdit?.id === query.id,
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="sticky top-[32px]">
                            {selectedQuery?.id === query.id ? (
                                <Button theme="simple" onClick={() => setSelectedQuery(null)}>
                                    Close
                                </Button>
                            ) : (
                                <Button theme="simple" onClick={() => setSelectedQuery(query)}>
                                    Open
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </TableRowData>
        </TableRow>
    );
};
