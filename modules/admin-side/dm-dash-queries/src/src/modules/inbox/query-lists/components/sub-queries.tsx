import { useEffect, useState } from "react";
import { apiRoutes } from "../../../../config/api-routes";
import { getPostData, postData } from "../../../../core/utils/helpers/fetch";
import TipTap from "../../../../shell/components/tools/TipTap";
import { Button } from "../../../../shell/components/atoms/buttons";
import SimpleLoader from "../../../../shell/components/atoms/loaders";
import { Check, MessagesSquare, X, Paperclip, TrashIcon } from "lucide-react";
import { type Attachment, type SubQuery } from "../../../../core/models/query";
import { useAppContext } from "../../../../core/utils/stores/AppContext";
import { decryptData } from "../../../../core/utils/helpers/localStorage";
import { AttachmentForm } from "../new-queries/components/attachment-form";

declare global {
    interface Window {
        Dropbox: any;
    }
}

interface SubQueryItem {
    id: number;
    query_code: string;
    title: string;
    query: string;
    response_value: string;
    response_type: string;
    response_type_description: string;
    raised_by_id: number;
    raised_by_name: string;
    raised_by_type: string;
    raised_to_id: string;
    raised_to_name: string;
    posted_date: string;
    status_id: number;
    status_code: string;
    status_name: string;
    resolved_date: string;
    attachments: any[]
}

interface SubQueriesProps {
    queryId: number;
    onClose: () => void;
    containerClassName?: string;
    isApprover?: boolean;
}

interface QueryReplyAttachment {
    title: string;
    link: string;
    user_id: number;
}

interface QueryReply {
    query: string;
    posted_date: string;
    raised_by_id: number;
    raised_by_name: string;
    raised_by_type: string;
    parent_query_id: number;
    response_type: string;
    response_type_description: string;
    response_value: string;
    attachments: QueryReplyAttachment[]
}

export const SubQueries = ({ queryId, containerClassName, isApprover }: SubQueriesProps) => {

    const [subQueries, setSubQueries] = useState<SubQueryItem[]>([]);
    const [queryReply, setQueryReply] = useState<QueryReply | null>(null);
    const [showAddReply, setShowAddReply] = useState(false);
    const [isGettingSubQueries, setIsGettingSubQueries] = useState(true);
    const context = useAppContext();
    const userData = context?.userData;

    const getSubQueries = async () => {
        const data = await getPostData(apiRoutes.queries.get.getSubQueries, {
            queryId: queryId
        });
        console.log("sub queries", data);
        if (data.queries?.length > 0) {
            setSubQueries(data.queries);
        } else {
            setSubQueries([]);
        }
        setIsGettingSubQueries(false);
    };

    useEffect(() => {
        getSubQueries();
    }, [queryId]);

    const addQueryReply = () => {
        setShowAddReply(true);
        setQueryReply({
            query: '',
            posted_date: new Date().toISOString(),
            raised_by_id: userData?.staff_id || 0,
            raised_by_name: userData?.first_name + ' ' + userData?.last_name || "",
            raised_by_type: "",
            parent_query_id: queryId,
            response_type: "",
            response_type_description: "",
            response_value: "",
            attachments: []
        });
    };

    const handleQueryReply = (reply: string) => {
        if (queryReply) {
            setQueryReply({ ...queryReply, query: reply });
        } else {
            setQueryReply({
                query: reply,
                posted_date: new Date().toISOString(),
                raised_by_id: userData?.staff_id || 0,
                raised_by_name: userData?.first_name + ' ' + userData?.last_name || "",
                raised_by_type: "",
                parent_query_id: queryId,
                response_type: "",
                response_type_description: "",
                response_value: "",
                attachments: []
            });
        }
    };

    const approveDraftQuery = (query: SubQueryItem, edited_reason: string) => {
        postData(apiRoutes.queries.update.approveDraftQuery, {
            query_id: query.id,
            status_id: 2,
            query: query.query,
            title: query.title,
            user_id: JSON.parse(decryptData(localStorage.getItem('userdata')))?.staff_id,
            user_name: JSON.parse(decryptData(localStorage.getItem('userdata')))?.first_name + ' ' + JSON.parse(decryptData(localStorage.getItem('userdata')))?.last_name,
            reject_reason: "",
            edited_reason: edited_reason
        }).catch((error) => {
            console.error("Failed to approve draft query", error);
        }).then(() => {
            getSubQueries();
        });
    };

    const rejectDraftQuery = (query: SubQueryItem, reject_reason: string) => {
        postData(apiRoutes.queries.update.rejectDraftQuery, {
            query_id: query.id,
            status_id: 2,
            query: query.query,
            title: query.title,
            user_id: JSON.parse(decryptData(localStorage.getItem('userdata')))?.staff_id,
            user_name: JSON.parse(decryptData(localStorage.getItem('userdata')))?.first_name + ' ' + JSON.parse(decryptData(localStorage.getItem('userdata')))?.last_name,
            reject_reason: reject_reason,
            edited_reason: ""
        }).catch((error) => {
            console.error("Failed to reject draft query", error);
        }).then(() => {
            getSubQueries();
        });
    };

    const handleSubmit = async () => {
        if (!queryReply?.query || queryReply.query === '<p></p>') return;

        const subQuery: SubQuery = {
            query: queryReply.query,
            posted_date: new Date().toISOString(),
            raised_by_id: userData?.staff_id || 0,
            raised_by_name: userData?.first_name + ' ' + userData?.last_name || "",
            raised_by_type: "internal",
            parent_query_id: queryId,
            response_value: "",
            response_type: "",
            response_type_description: "",
            attachments: []
        };

        try {
            await postData(apiRoutes.queries.insert.sendSubQuery, subQuery);
            setQueryReply(null);
            setShowAddReply(false);
            getSubQueries();
        } catch (error) {
            console.error("Failed to send reply", error);
        }
    };

    const handleAttachmentSet = (attachment: Attachment) => {
        if (checkIfDuplicateExists(attachment.link)) return;
        queryReply!.attachments.push({
            title: attachment.title,
            link: attachment.link,
            user_id: userData?.staff_id
        });
        console.log('attachment added ', attachment);
    };

    const checkIfDuplicateExists = (link: string) => {
        return queryReply!.attachments.some((attachment: Attachment) => attachment.link === link);
    };

    const handleAttachmentRemove = (link: string) => {
        queryReply!.attachments = queryReply!.attachments.filter(attachment => attachment.link !== link);
    };

    useEffect(() => {
        console.log('query reply attachments ', queryReply)
    }, [queryReply]);

    return (
        <div className={`rounded-lg shadow-sm cursor-default space-y-4 py-3 ${!containerClassName?.includes('bg-') && 'bg-white'} ${containerClassName}`}>
            <div className="space-y-2">
                <div className="px-3 text-slate-500 font-semibold text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1"><MessagesSquare size={20} className="text-slate-500" /> Query Replies</div>
                    {/* <Button theme="simple_primary" onClick={onClose} className="pl-2 pr-1 text-xs flex items-center gap-1 group/QueryReplyClose" shape="pill"><span>Close</span> <X strokeWidth={1.5} size={20} className="bg-slate-300 rounded-full p-1 text-primary" /></Button> */}
                </div>
                <div className="text-slate-500">
                    {isGettingSubQueries && <div className="p-5 flex items-center justify-center"><SimpleLoader text="Loading Sub Queries" /></div>}
                    {!isGettingSubQueries &&
                        <>
                            {((!subQueries || subQueries.length === 0) && !showAddReply) && <div className="text-center p-2 text-xs">No Sub Queries Found</div>}
                            {subQueries && subQueries.length > 0 && subQueries.map((subQuery: SubQueryItem, index: number) => (
                                <div key={index} className="bg-white p-3 flex flex-col border-b border-slate-200 last:border-0">
                                    <div className="flex flex-col gap-2 items-start">
                                        <div className="flex items-center justify-between w-full flex-1">
                                            <div className="flex items-center gap-2">
                                                <img className="rounded-full h-[28px] w-[28px]" src='/assets/images/profile_placeholder.png' alt="" />
                                                <p className="text-sm font-medium text-slate-700">{subQuery.raised_by_name}</p>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500">{new Date(subQuery.posted_date).toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                                        </div>
                                        <div className="pl-[32px] w-full flex-1 mt-2 space-y-2">
                                            {subQuery.response_value && <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: subQuery.response_value }}></p>}
                                            <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: subQuery.query }}></p>
                                        </div>
                                        {
                                            subQuery.status_code === "sub_query_draft" ?
                                                <>
                                                    {isApprover &&
                                                        <div className="flex items-center justify-between w-full flex-1 bg-red-100 px-2 py-1">
                                                            <p className="text-xs font-medium text-slate-500">Draft pending approval</p>
                                                            <div className="flex items-center gap-4">
                                                                <Button theme="minimal" className="px-0" onClick={() => approveDraftQuery(subQuery, "")}>
                                                                    <div className="flex items-center gap-0">
                                                                        <p className="px-0 text-xs font-medium " style={{ color: "green" }} >Approve</p>
                                                                        <Check size={18} style={{ color: "green" }} />
                                                                    </div>
                                                                </Button>
                                                                <Button theme="minimal" className="px-0" onClick={() => {
                                                                    const reason = window.prompt("Please provide a reason for rejecting this query.");
                                                                    if (reason && reason.trim().length > 0) {
                                                                        rejectDraftQuery(subQuery, reason);
                                                                    }
                                                                }}>
                                                                    <div className="flex items-center gap-0">
                                                                        <p className="px-0 text-xs font-medium" style={{ color: "red" }} >Reject</p>
                                                                        <X size={18} style={{ color: "red" }} />
                                                                    </div>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    }
                                                </> : null
                                        }
                                        {
                                            subQuery.status_code === "draft_rejected" ?
                                                <>
                                                    <div className="flex items-center justify-between w-full flex-1 bg-red-100 px-2 py-1">
                                                        <p className="text-xs font-medium text-slate-500">Draft rejected</p>
                                                    </div>
                                                </> : null
                                        }
                                    </div>
                                </div>
                            ))}
                        </>
                    }
                </div>
            </div>
            <div className="space-y-2 px-3">
                {!showAddReply && <Button theme="outline_secondary" className="w-full py-3 shadow-sm" onClick={() => addQueryReply()}>Add Reply</Button>}
                {showAddReply &&
                    <div className="space-y-2 border-t border-slate-300 pt-4">
                        <TipTap
                            content={queryReply?.query ?? ''}
                            onBlur={(content) => handleQueryReply(content)}
                            containerClassName="rounded-lg overflow-hidden bg-white"
                        />
                        <div className="flex gap-2 items-center justify-between">
                            <div className="flex flex-col gap-2 items-center">
                                <AttachmentForm
                                    values={{ user_id: userData?.staff_id }}
                                    events={{
                                        attachmentSet: (attachment: Attachment) => handleAttachmentSet(attachment),
                                    }}
                                />
                                <div>
                                    {queryReply && queryReply!.attachments && queryReply!.attachments!.length > 0 && queryReply!.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white rounded shadow-sm p-2">
                                            <div className="flex items-center gap-2">
                                                <Paperclip size={14} strokeWidth={1.5} />
                                                <div className="flex flex-col max-w-[200px] overflow-hidden">
                                                    <div className="text-sm font-medium truncate">{attachment.title}</div>
                                                    <div className="text-xs text-slate-500 truncate">{attachment.link}</div>
                                                </div>
                                            </div>
                                            <Button theme="simple" className="aspect-square p-1" shape="circle" onClick={() => handleAttachmentRemove(attachment.link)}>
                                                <TrashIcon size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Button theme="light" className="py-2 px-5 shadow-sm" onClick={() => setShowAddReply(!showAddReply)}>Cancel</Button>
                                <Button theme="primary" className="py-2 px-5 shadow-sm" onClick={handleSubmit}>Send</Button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};