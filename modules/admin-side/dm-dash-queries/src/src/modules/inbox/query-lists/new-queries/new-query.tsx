import { AlertCircle, AlertTriangle, Check, Funnel, Loader, MessageSquareText, Paperclip, PlusCircle, PlusIcon, Replace, SendHorizontal, SendIcon, TrashIcon, Type, User } from "lucide-react";
import { useState, useEffect } from "react";
import type { Template } from "../../../../core/models/template";
import { TableRowData, TableRow, Table, TableHead, TableHeadRow, TableHeadCell, TableBody } from "../../../../shell/components/collections/table";
import TipTap from "../../../../shell/components/tools/TipTap";
import { getQueryTemplatesById } from "../helpers/templates";
import { Input, SearchBox } from "../../../../shell/components/atoms/inputs";
import { Button } from "../../../../shell/components/atoms/buttons";
import { NewQuery, type Attachment, type Query } from "../../../../core/models/query";
import { useQueryMasterContext } from "../../../../core/utils/stores/QueryMasterContext";
import { type Master, type QueryMaster } from "../../../../core/models/master";
import { ProDropDown } from "../../../../shell/components/atoms/dropdowns";
import type { JobQuery } from "../../job-queries/jobs";
import React from "react";
import { SimpleHDivider } from "../../../../shell/components/atoms/divider";
import { AttachmentForm } from "./components/attachment-form";
import { useAppContext } from "../../../../core/utils/stores/AppContext";
import type { ClientUser } from "../../../../core/models/user";
import { postData } from "../../../../core/utils/helpers/fetch";
import { apiRoutes } from "../../../../config/api-routes";


interface AddNewQueryPanelProps {
    events: {
        addNewEmptyQuery: () => void;
        sendQueries: () => void;
    },
    values: {
        newQueries: NewQuery[];
        paginatedRows: Query[];
    }
}

export const AddNewQueryPanel = ({ events, values }: AddNewQueryPanelProps) => {

    console.log("new queries panel values", values);

    return (
        <TableRow noHover={true} className={`bg-secondary-100/30 py-4`}>
            <TableRowData colSpan={8} className="text-center">
                <div className="flex items-center justify-between gap-4">
                    <div className={`text-center text-slate-500 px-2 py-1 flex-1 w-full flex gap-1 items-center ${values.newQueries && values.newQueries?.length > 0 ? "justify-end" : "justify-center"}`}>
                        {((!values.newQueries || values.newQueries.length <= 0) && (values.paginatedRows && values.paginatedRows.length <= 0)) ? <><AlertTriangle size={16} /> No queries found. Click this button to raise new queries </> : <><AlertCircle size={16} /> You can add more queries below by clicking here </>}
                        <Button theme={values.newQueries && values.newQueries?.length > 0 ? "outline_secondary" : "primary"} className="pl-2 pr-3 py-1 flex gap-1 items-center" shape="pill" onClick={() => events.addNewEmptyQuery()}>{(values.newQueries && values.newQueries?.length > 0 ? <><PlusCircle size={16} /> Add New Query</> : <><PlusIcon size={16} /> Raise New Queries</>)}</Button>
                    </div>
                    {values.newQueries && values.newQueries.length > 0 &&
                        <Button theme="secondary" className="flex gap-1 items-center justify-between py-2" onClick={() => events.sendQueries()}>Send Queries <SendIcon size={16} /></Button>
                    }
                </div>
            </TableRowData>
        </TableRow>
    );
};



interface NewQueryPanelTitleProps {
    index?: number;
    title: string;
    description: string;
    isValid?: "valid" | "required" | "invalid" | "default";
    showIndex?: boolean;
    icon?: any;
}

export const NewQueryPanelTitle = ({ index, title, description, isValid = "default", showIndex = true, icon }: NewQueryPanelTitleProps) => {
    return (
        <div className="flex flex-col gap-2 items-start">
            {showIndex &&
                <div
                    className={`
                        h-[32px] flex items-center justify-center rounded-full font-bold ${!icon ? 'aspect-square w-[32px]' : 'px-3 gap-2'}
                        ${isValid === "valid" && 'bg-green-50/50 border border-green-100 text-green-800'}
                        ${isValid === "invalid" && 'bg-red-50 border border-red-400 text-red-800'}
                        ${isValid === "required" && 'bg-yellow-50 border border-yellow-400 text-yellow-800'}
                        ${isValid === "default" && 'bg-slate-50 border border-slate-400 text-slate-800'}
                    `}
                >
                    {isValid === "valid" && <Check size={16} />} {index && index} {icon}
                </div>
            }
            {isValid !== "valid" &&
                <div>
                    <div className="text-sm font-semibold text-slate-700">{title}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                </div>
            }
        </div>
    );
};

interface NewQueryRowProps {
    values: {
        selectedJobQuery: JobQuery;
        clientUsers: ClientUser[];
    }
    events: {
        queryAdded: (doesReviewerExists: boolean) => void;
    }
}

interface QueryMasters extends QueryMaster {
    selected_criticality_id: number;
    selected_response_type_id: number;
    selected_sub_category_id: number;
    selected_category_id: number;
}

export const NewQueryView = ({ values, events }: NewQueryRowProps) => {
    const context = useAppContext();
    const wm_user_id = context?.userData?.staff_id;
    const [isMounted, setIsMounted] = useState(false);
    const queryContext = useQueryMasterContext();
    const [queryMasters, setQueryMasters] = useState<QueryMasters>();
    const maxNewQueries = 50;
    const [templates, setTemplates] = useState<Template[]>([]);
    const [commonTemplates, setCommonTemplates] = useState<Template[]>([]);
    const [templateSearchTerm, setTemplateSearchTerm] = useState('');
    const [newQueries, setNewQueries] = useState<NewQuery[]>([]);
    const [doesReviewerExists, setDoesReviewerExists] = useState(false);
    const [isCommonTemplatesLoaded, setIsCommonTemplatesLoaded] = useState(false);
    const [isClientTemplatesLoaded, setIsClientTemplatesLoaded] = useState(false);

    useEffect(() => {
        if (queryContext?.queryMasters) {
            setQueryMasters({
                ...queryContext.queryMasters,
                selected_criticality_id: 0,
                selected_response_type_id: 0,
                selected_sub_category_id: 0,
                selected_category_id: 0
            });
        }
    }, [queryContext?.queryMasters]);

    useEffect(() => {
        console.log('DEBUG - query masters ', queryMasters);
        checkIfReviewerExists();

        getQueryTemplates();
        getCommonQueryTemplates();

        if (!isMounted) {
            addNewEmptyQuery(1);
            setIsMounted(true);
        }
    }, []);

    const getQueryTemplates = () => {
        getQueryTemplatesById(values.selectedJobQuery.client_id).then((data) => {
            setTemplates(data.templates);
            setIsClientTemplatesLoaded(true);
        });
    };

    const getCommonQueryTemplates = () => {
        getQueryTemplatesById(0).then((data) => {
            setCommonTemplates(data.templates);
            setIsCommonTemplatesLoaded(true);
        });
    };

    const checkIfReviewerExists = () => {
        postData(apiRoutes.queries.review.getQueryReviewers, { client_id: values.selectedJobQuery.client_id })
            .then((data) => {
                if (data.data && data.data.length > 0) {
                    setDoesReviewerExists(true);
                }
            })
    };

    const updateNewQueries = (newQuery: NewQuery, index: number) => {
        // Find existing based on index and update only that query
        setNewQueries((prevQueries: NewQuery[]) => {
            const newQueries = [...prevQueries];
            newQueries[index] = newQuery;
            return newQueries;
        });
    };

    const handleTemplateSelect = (template: Template, nq: NewQuery, index: number) => {
        const newQuery: NewQuery = {
            ...nq,
            is_template_selected: true,
            query: template.query,
            title: template.title,
            response_type: template.response_type,
            response_type_description: template.response_type_description,
            category_id: template.category_id,
            sub_category_id: template.sub_category_id,
            criticality_id: template.criticality_id,
            template_code: template.query_template_code,
            isValid: { ...nq.isValid, title: true, query: true, category_id: true, sub_category_id: true, criticality_id: true }
        };
        updateNewQueries(validateNewQuery(newQuery), index);
    };

    const handleAttachmentSet = (attachment: Attachment, nq: NewQuery, index: number) => {
        if (checkIfDuplicateExists(attachment.link, nq)) return;

        const newQuery = {
            ...nq,
            attachments: [...nq.attachments, attachment]
        };
        updateNewQueries(newQuery, index);
    };

    const handleAttachmentRemove = (link: string, nq: NewQuery, index: number) => {
        const newQuery = {
            ...nq,
            attachments: nq.attachments.filter((attachment: Attachment) => attachment.link !== link)
        };
        updateNewQueries(newQuery, index);
    };

    const checkIfDuplicateExists = (link: string, nq: NewQuery) => {
        return nq.attachments.some((attachment: Attachment) => attachment.link === link);
    };

    // const checkIsQueryValid = (newQuery: NewQuery) => {
    //     // Check if query contains letters with this pattern [[]]
    //     const regex = /\[\w+\]/g;
    //     return regex.test(newQuery.query);
    // };

    const addNewEmptyQuery = (count: number) => {
        if ((newQueries || []).length >= maxNewQueries) return;
        console.log('query masters inside ', queryMasters, newQueries);

        // Add new query at first position
        const newQuery = NewQuery.defaultNewQuery(
            values.selectedJobQuery.job_id,
            values.selectedJobQuery.job_touchpoint_id,
            values.selectedJobQuery.job_touchpoint,
            values.selectedJobQuery.client_id,
            context
        );
        let newQueriesArray = [];

        let difference = maxNewQueries - (newQueries || []).length;
        if (difference < count) count = difference;

        for (let i = 0; i < count; i++) {
            newQueriesArray.push(newQuery);
        }
        console.log('new queries ', newQueriesArray, newQuery);
        setNewQueries([...(newQueries || []), ...newQueriesArray]);
    };

    const validateNewQuery = (newQuery: NewQuery): NewQuery => {
        if (newQuery.title) newQuery.isValid!.title = true; else newQuery.isValid!.title = false;
        if (newQuery.query) newQuery.isValid!.query = true; else newQuery.isValid!.query = false;
        if (newQuery.category_id) newQuery.isValid!.category_id = true; else newQuery.isValid!.category_id = false;
        if (newQuery.sub_category_id) newQuery.isValid!.sub_category_id = true; else newQuery.isValid!.sub_category_id = false;
        if (newQuery.criticality_id) newQuery.isValid!.criticality_id = true; else newQuery.isValid!.criticality_id = false;
        if (newQuery.raised_to_id) newQuery.isValid!.raised_to_id = true; else newQuery.isValid!.raised_to_id = false;
        if (newQuery.raised_by_id) newQuery.isValid!.raised_by_id = true; else newQuery.isValid!.raised_by_id = false;
        console.log('new query validations ', newQuery);
        return newQuery;
    };

    const validateNewQueries = () => {
        newQueries?.forEach((newQuery: NewQuery) => {
            const nQuery = validateNewQuery(newQuery);
            handeUpdateNewQuery(nQuery, newQueries.indexOf(newQuery));
        });
    };

    const handeUpdateNewQuery = (newQuery: NewQuery, index: number) => {
        updateNewQueries(validateNewQuery(newQuery), index);
    };

    const handleSendNewQuery = () => {
        console.log('inside handle send new query ');
        validateNewQueries();
        let validFlag = true;
        newQueries?.forEach((newQuery: NewQuery) => {
            if (!newQuery.isValid!.title) { validFlag = false; return; }
            if (!newQuery.isValid!.category_id) { validFlag = false; return; }
            if (!newQuery.isValid!.sub_category_id) { validFlag = false; return; }
            if (!newQuery.isValid!.criticality_id) { validFlag = false; return; }
            if (!newQuery.isValid!.raised_to_id) { validFlag = false; return; }
            if (!newQuery.isValid!.raised_by_id) { validFlag = false; return; }
            newQuery.response_type_description = "";

        });
        if (!validFlag) return;

        console.log('new queries values ', newQueries, validFlag);
        postData(apiRoutes.queries.insert.sendQuery, newQueries)
            .then((data) => {
                console.log(data);
                events.queryAdded(doesReviewerExists);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const removeNewQuery = (index: number) => {
        if (newQueries.length == 1) return;
        const newQueriesCopy = [...newQueries];
        newQueriesCopy.splice(index, 1);
        setNewQueries(newQueriesCopy);
    };


    return (
        <>
            <div className="bg-primary-50/50 pr-2 py-2 pl-4 border-b border-slate-300 flex gap-2 items-center justify-between">
                <div className="flex flex-col items-start gap-0">
                    <h1 className="text-lg font-semibold text-primary">Raise Queries</h1>
                    <div className="font-medium text-slate-700 flex items-center gap-1">
                        <div className="text-xs"><strong>{newQueries.filter((newQuery: NewQuery) => newQuery.isValid!.title && newQuery.isValid!.query && newQuery.isValid!.category_id && newQuery.isValid!.sub_category_id && newQuery.isValid!.criticality_id && newQuery.isValid!.raised_to_id && newQuery.isValid!.raised_by_id).length}/{newQueries.length}</strong> Queries Filled</div>
                        <progress className="rounded-full overflow-hidden h-[10px]" value={newQueries.filter((newQuery: NewQuery) => newQuery.isValid!.title && newQuery.isValid!.query && newQuery.isValid!.category_id && newQuery.isValid!.sub_category_id && newQuery.isValid!.criticality_id && newQuery.isValid!.raised_to_id && newQuery.isValid!.raised_by_id).length} max={newQueries.length}> 32% </progress>
                    </div>
                </div>
                <div className="flex gap-4 items-center justify-end">
                    <div className={`flex gap-2 items-center ${newQueries.length >= maxNewQueries ? 'opacity-25 cursor-not-allowed pointer-events-none' : ''}`}>
                        <div className="text-slate-500 text-sm font-medium">{newQueries.length >= maxNewQueries ? 'Max Queries Added' : 'Add More Query'}</div>
                        <Button theme="light" shape="pill" className="py-1 px-3 shadow-sm hover:shadow-lg flex items-center" onClick={() => addNewEmptyQuery(1)}><PlusIcon size={16} strokeWidth={1.5} /> 1</Button>
                        <Button theme="light" shape="pill" className="py-1 px-3 shadow-sm hover:shadow-lg flex items-center" onClick={() => addNewEmptyQuery(2)}><PlusIcon size={16} strokeWidth={1.5} /> 2</Button>
                        <Button theme="light" shape="pill" className="py-1 px-3 shadow-sm hover:shadow-lg flex items-center" onClick={() => addNewEmptyQuery(3)}><PlusIcon size={16} strokeWidth={1.5} /> 3</Button>
                        <Button theme="light" shape="pill" className="py-1 px-3 shadow-sm hover:shadow-lg flex items-center" onClick={() => addNewEmptyQuery(5)}><PlusIcon size={16} strokeWidth={1.5} /> 5</Button>
                        <Button theme="light" shape="pill" className="py-1 px-3 shadow-sm hover:shadow-lg flex items-center" onClick={() => addNewEmptyQuery(10)}><PlusIcon size={16} strokeWidth={1.5} /> 10</Button>
                    </div>
                    <SimpleHDivider />
                    <Button theme="primary" className="py-1 flex gap-5 items-center justify-between px-2" onClick={handleSendNewQuery}>
                        <div className="pr-5">Send</div>
                        <SendHorizontal size={16} strokeWidth={1.5} />
                    </Button>
                </div>
            </div>
            <Table>
                <TableHead>
                    <TableHeadRow>
                        <TableHeadCell>#</TableHeadCell>
                        <TableHeadCell>Raise To</TableHeadCell>
                        <TableHeadCell>Template</TableHeadCell>
                        <TableHeadCell>Query</TableHeadCell>
                        <TableHeadCell>Filters</TableHeadCell>
                        <TableHeadCell>Attachment</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHeadRow>
                </TableHead>
                <TableBody>
                    <>
                        {!newQueries || newQueries.length <= 0 &&
                            <TableRow noHover={true} className="py-4 rounded-b-xl overflow-hidden">
                                <TableRowData verticalAlign="top" colSpan={6}>
                                    Add more queries
                                </TableRowData>
                            </TableRow>
                        }
                        {newQueries && newQueries?.length > 0 && newQueries?.map((newQuery, index) => (
                            <React.Fragment key={index}>
                                <TableRow noHover={true}
                                    className={`${index % 2 !== 0 ? 'bg-secondary-50/50' : 'bg-secondary-50/20'} py-4 last:border-b-0`}>
                                    <TableRowData verticalAlign="top"><>{index + 1}</></TableRowData>

                                    {/* Raise to client */}
                                    <TableRowData verticalAlign="top" className="max-w-[150px]">
                                        <NewQueryPanelTitle
                                            index={1}
                                            icon={<User size={16} />}
                                            isValid={newQuery.isValid && newQuery.isValid!.raised_to_id ? "valid" : "required"}
                                            title="Raise to Client"
                                            description="Choose a client to raise the query to."
                                        />
                                        <ProDropDown
                                            width="full"
                                            title=""
                                            items={values.clientUsers}
                                            idKey="id"
                                            displayKey="full_name"
                                            selectedValue={newQuery.raised_to_id}
                                            onValueChange={(item: any) => handeUpdateNewQuery({ ...newQuery, raised_to_id: item.id, raised_to_name: item.full_name }, index)}
                                        />
                                    </TableRowData>


                                    {/* Query Template */}
                                    <TableRowData verticalAlign="top" className="max-w-[250px]">
                                        <div className="flex flex-col gap-2">
                                            <NewQueryPanelTitle
                                                index={2}
                                                icon={<Type size={16} />}
                                                isValid={newQuery.isValid && newQuery.isValid!.title && newQuery.title != 'Custom Query' ? "valid" : "required"}
                                                title={`${newQuery.is_template_selected ? 'Template Selected' : 'Query Template'}`}
                                                description={newQuery.is_template_selected ? 'Template can be changed by clicking below button.' : 'Choose a query template to begin.'}
                                            />
                                            {!newQuery.is_template_selected ?
                                                <>
                                                    <div className="space-y-2">
                                                        <SearchBox placeholder="Search" value={templateSearchTerm} onChange={(e) => setTemplateSearchTerm(e.target.value)} onClear={() => setTemplateSearchTerm('')} />
                                                        {!isCommonTemplatesLoaded && !isClientTemplatesLoaded && <div className="flex justify-start items-center gap-1 text-sm font-medium opacity-70"><Loader className="animate-spin" /> Getting templates...</div>}
                                                        {isCommonTemplatesLoaded && isClientTemplatesLoaded && <>
                                                            <div className="bg-white rounded border border-slate-300 min-h-[200px] max-h-[300px] overflow-y-auto relative">
                                                                <div className="border-b border-t border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100">Client Templates</div>
                                                                {templates && templates.length > 0 && templates.filter((template: Template) => template.title.toLowerCase().includes(templateSearchTerm.toLowerCase())).map((template: Template, ti: number) => (
                                                                    <div key={ti} className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => { handleTemplateSelect(template, newQuery, index) }}>
                                                                        <p className="text-sm font-medium text-slate-700">{template.title}</p>
                                                                    </div>
                                                                ))}
                                                                <div className="border-b border-t border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100">Common Templates</div>
                                                                {commonTemplates && commonTemplates.length > 0 && commonTemplates.filter((template: Template) => template.title.toLowerCase().includes(templateSearchTerm.toLowerCase())).map((template: Template, ti: number) => (
                                                                    <div key={ti} className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => { handleTemplateSelect(template, newQuery, index) }}>
                                                                        <p className="text-sm font-medium text-slate-700">{template.title}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </> }
                                                    </div>
                                                </>
                                                :
                                                <>
                                                    {newQuery.template_code == 'C001' && 
                                                        <div>
                                                            <Input label="Change Query Title" placeholder="Query Title" value={newQuery.title} required={true} isValid={newQuery.isValid && newQuery.isValid!.title && newQuery.title != 'Custom Query'} onChange={(e) => handeUpdateNewQuery({ ...newQuery, title: e.target.value }, index)} />
                                                        </div>
                                                    }
                                                    <div className="space-y-2 bg-white border-b border-slate-200 rounded-lg p-2">
                                                        <div className="text-sm font-medium">{newQuery.template_code == 'C001' ? 'Custom Query' : newQuery.title}</div>
                                                        <Button theme="simple_primary" className="w-full flex justify-center items-center gap-2" onClick={() => handeUpdateNewQuery({ ...newQuery, is_template_selected: false }, index)}><Replace size={16} strokeWidth={1.5} /> Change template</Button>
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    </TableRowData>


                                    {/* Query */}
                                    <TableRowData verticalAlign="top" className="max-w-[600px]">
                                        <div className="flex flex-col gap-2">
                                            <NewQueryPanelTitle
                                                index={3}
                                                isValid={newQuery.isValid && newQuery.isValid!.query ? "valid" : "required"}
                                                icon={<MessageSquareText size={16} />}
                                                title="Brief Query"
                                                description="Briefly describe the query."
                                            />
                                            {/* <TipTap
                                                content={newQuery?.query}
                                                onChange={(content, isEmpty) => {
                                                    if (!isEmpty) updateNewQueries({ ...newQuery, query: content, is_query_empty: checkIsQueryValid(newQuery) }, index);
                                                    else updateNewQueries({ ...newQuery, query: '', is_query_empty: true }, index);
                                                }}
                                                containerClassName={`rounded-lg overflow-hidden bg-white ${!newQuery.is_template_selected ? 'pointer-events-none opacity-50' : ''}`}
                                            /> */}

                                            <TipTap
                                                content={newQueries[index]?.query || ""}
                                                onChange={(content,) => {
                                                    handeUpdateNewQuery(
                                                        { ...newQueries[index], query: content },
                                                        index
                                                    );
                                                }}
                                                onBlur={(content) => {
                                                    handeUpdateNewQuery(
                                                        { ...newQueries[index], query: content },
                                                        index
                                                    );
                                                }}
                                                containerClassName={`rounded-lg overflow-hidden bg-white ${!newQuery.is_template_selected ? 'pointer-events-none opacity-50' : ''}`}
                                            />

                                        </div>
                                    </TableRowData>

                                    {/* Query Options */}
                                    <TableRowData verticalAlign="top" className="max-w-[150px]">
                                        <div className="space-y-4">
                                            <NewQueryPanelTitle
                                                index={4}
                                                isValid={newQuery.isValid && newQuery.isValid!.category_id && newQuery.isValid!.sub_category_id && newQuery.isValid!.criticality_id ? "valid" : "required"}
                                                icon={<Funnel size={16} />}
                                                title="Query Options"
                                                description="Set categories, sub categories and criticality."
                                            />
                                            <div
                                                className={`
                                                    flex flex-col gap-4 ${!newQuery.is_template_selected ? 'pointer-events-none opacity-50' : ''}
                                                `}
                                            >
                                                <NewQueryOption
                                                    label="Query Subject (Category > Sub Category)"
                                                    value={`${queryMasters?.category?.find((c: any) => c.id === newQuery.category_id)?.master_name || '-'} > ${queryMasters?.sub_category?.find((sc: any) => sc.id === newQuery.sub_category_id)?.master_name || '-'}`}
                                                    isEditMode={newQuery.template_code === 'C001'}
                                                >
                                                    <div className="text-xs text-slate-700 font-semibold">
                                                        {newQuery.category_id && newQuery.sub_category_id ? `${queryMasters?.category?.find((c: any) => c.id === newQuery.category_id)?.master_name}` : 'Select Query Subject'}
                                                    </div>
                                                    <select
                                                        className="w-full bg-white border border-slate-300 rounded px-2 py-2 text-sm outline-none focus:border-secondary transition-colors"
                                                        value={newQuery.sub_category_id || 0}
                                                        onChange={(e) => {
                                                            const scId = Number(e.target.value);
                                                            const scItem = queryMasters?.sub_category?.find((sc: any) => sc.id === scId);
                                                            updateNewQueries({ 
                                                                ...newQuery, 
                                                                sub_category_id: scId, 
                                                                category_id: scItem?.parent_master_id || 0 
                                                            }, index);
                                                        }}
                                                    >
                                                        <option value="0">Select Subject...</option>
                                                        {queryMasters?.category?.map((cat: any) => (
                                                            <optgroup key={cat.id} label={cat.master_name}>
                                                                {queryMasters?.sub_category
                                                                    ?.filter((sc: any) => sc.parent_master_id === cat.id)
                                                                    .map((sc: any) => (
                                                                        <option key={sc.id} value={sc.id}>
                                                                            {sc.master_name}
                                                                        </option>
                                                                    ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </NewQueryOption>
                                                <hr className="my-2 opacity-25" />
                                                <NewQueryOption
                                                    label="Priority"
                                                    value={queryMasters?.criticality?.filter((criticality: Master) => criticality.id === newQuery.criticality_id)[0]?.master_name!}
                                                    isEditMode={true}
                                                >
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-slate-700 font-semibold">Priority</div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {queryMasters && queryMasters?.criticality && queryMasters?.criticality.map((criticality: Master, ci: number) => (
                                                                <div key={ci}
                                                                    className={`
                                                                    rounded-full border-2 py-1 px-3 text-xs flex-1 w-full flex items-center justify-center cursor-pointer transition-all duration-100
                                                                    ${newQuery.criticality_id == criticality.id ? 'border-secondary shadow-lg scale-105' : 'border-slate-300 shadow-inner scale-95'}
                                                                    ${newQuery.criticality_id == criticality.id ? JSON.parse(criticality.master_meta_data || '{}')?.tw_class : ''}
                                                                `}
                                                                    onClick={() => updateNewQueries({ ...newQuery, criticality_id: criticality.id }, index)}
                                                                >
                                                                    <p className="text-sm font-medium text-slate-700">
                                                                        {criticality.master_name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </NewQueryOption>
                                            </div>
                                        </div>
                                    </TableRowData>
                                    <TableRowData verticalAlign="top">
                                        <div className="flex flex-col gap-2">
                                            <NewQueryPanelTitle
                                                icon={<Paperclip size={16} />}
                                                title="Attachments"
                                                description="Add attachment links only if required."
                                            />
                                            <div className={`${!newQuery.is_template_selected ? 'pointer-events-none opacity-50' : ''}`}>
                                                <AttachmentForm
                                                    values={{ user_id: wm_user_id }}
                                                    events={{
                                                        attachmentSet: (attachment: Attachment) => handleAttachmentSet(attachment, newQuery, index),
                                                    }}
                                                />
                                            </div>
                                            {newQuery.attachments.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    {newQuery.attachments.map((attachment: Attachment, index: number) => (
                                                        <div key={index} className="flex items-center justify-between bg-white rounded shadow-sm p-2">
                                                            <div className="flex items-center gap-2">
                                                                <Paperclip size={14} strokeWidth={1.5} />
                                                                <div className="flex flex-col max-w-[200px] overflow-hidden">
                                                                    <div className="text-sm font-medium truncate">{attachment.title}</div>
                                                                    <div className="text-xs text-slate-500 truncate">{attachment.link}</div>
                                                                </div>
                                                            </div>
                                                            <Button theme="simple" className="aspect-square p-1" shape="circle" onClick={() => handleAttachmentRemove(attachment.link, newQuery, index)}>
                                                                <TrashIcon size={16} />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableRowData>
                                    <TableRowData verticalAlign="top">
                                        <div className="flex flex-col gap-1">
                                            <Button theme="outline_primary" className={`flex gap-1 pl-2 pr-1 items-center justify-between ${newQueries.length == 1 ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => removeNewQuery(index)}>Delete <TrashIcon size={16} /></Button>
                                        </div>
                                    </TableRowData>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </>
                </TableBody>
            </Table>
        </>
    );
};

interface NewQueryOption {
    children: React.ReactNode;
    label: string;
    value: string;
    isEditMode?: boolean;
}

const NewQueryOption = ({ children, label, value, isEditMode = false }: NewQueryOption) => {
    return (
        <div>
            {isEditMode ? (
                children
            ) : (
                <div>
                    <div className="text-xs font-semibold text-slate-500">{label}</div>
                    <div className="text-sm text-slate-700 py-1 px-2 bg-white border-b border-slate-100 rounded">{value ?? '-'}</div>
                </div>
            )}
        </div>
    );
};