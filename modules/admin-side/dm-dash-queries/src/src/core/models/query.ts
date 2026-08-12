export interface Attachment {
    title: string;
    link: string;
    user_id: number;
}

export interface Query {
    id: number,
    query_code: string,
    title: string,
    query: string,
    category_id: number,
    category_name: string,
    sub_category_id: number,
    sub_category_name: string,
    criticality_id: number,
    criticality_name: string,
    query_status_id: number,
    query_status_code: string;
    query_status_name: string,
    response_value: string,
    response_type: string,
    response_type_description: string,
    raised_by_id: number,
    raised_by_name: string,
    raised_to_id: number,
    raised_to_name: string,
    elapsed_days: number,
    posted_date: string,
    resolved_date: string,
    attachments: Attachment[]
}

export interface NewQuery {
    title: string;
    query: string;
    is_query_empty?: boolean;
    category_id: number;
    sub_category_id: number;
    criticality_id: number;
    response_value: string;
    response_type: string;
    response_type_description: string;
    raised_by_id: number;
    raised_by_name: string;
    raised_to_id: number;
    raised_to_name: string;
    posted_date: string;
    resolved_date: string;
    attachments: Attachment[];
    is_template_selected?: boolean;
    job_id: number;
    job_touchpoint_id: number,
    job_touchpoint: string,
    client_id: number,
    parent_query_id: number,
    template_code?: string;
    isValid: {
        title: boolean;
        query: boolean;
        category_id: boolean;
        sub_category_id: boolean;
        criticality_id: boolean;
        raised_by_id: boolean;
        raised_to_id: boolean;
    }
}

export class NewQuery {
    static defaultNewQuery(job_id: number, job_touchpoint_id: number, job_touchpoint: string, client_id: number, context: any) {
        return {
            title: "",
            query: "",
            category_id: 0,
            sub_category_id: 0,
            criticality_id: 0,
            raised_to_id: 0,
            raised_by_id: context?.userData?.staff_id || 0,
            response_value: "",
            response_type: "",
            response_type_description: "",
            raised_by_name: context?.userData?.first_name + ' ' + context?.userData?.last_name || "",
            raised_to_name: "",
            elapsed_days: 0,
            posted_date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
            resolved_date: "",
            attachments: [],
            is_template_selected: false,
            job_id: job_id,
            job_touchpoint_id: job_touchpoint_id,
            job_touchpoint: job_touchpoint,
            client_id: client_id,
            parent_query_id: 0,
            isValid: {
                title: false,
                query: false,
                category_id: false,
                sub_category_id: false,
                criticality_id: false,
                raised_by_id: false,
                raised_to_id: false
            }
        }
    }
}

export interface DraftJobQueries {
    job_id: string;
    job_name: string;
    date: string;
    job_touchpoint?: string;
    client_id?: number;
    client_name?: string;
    sub_client?: string;
    sub_client_id?: number;
    total_queries?: number;
    vertical_id?: number;
    vertical_name?: string;
    vertical_code?: string;
    queries: Query[];
}


export interface RejectedQuery {
    id: number;
    query_code: string;
    job_id: number;
    job_name: string;
    job_touchpoint: string;
    title: string;
    query: string;
    category_id: number;
    category_name: string;
    sub_category_id: number;
    sub_category_name: string;
    criticality_id: number;
    criticality_name: string;
    query_status_id: number;
    query_status_code: string;
    query_status_name: string;
    raised_by_id: number;
    raised_by_name: string;
    raised_to_id: number;
    raised_to_name: string;
    posted_date: string;
}

export interface QueryTemplate {
    id: number,
    title: string,
    query_template_code: string,
    category_id: number,
    category_code: string,
    category_name: string,
    sub_category_id: number,
    sub_category_code: string,
    sub_category_name: string,
    job_stage_id: number,
    job_stage_code: string,
    job_stage_name: string,
    criticality_id: number,
    criticality_code: string,
    criticality_name: string,
    query: string,
    response_type: string,
    response_type_description: string,
    response_type_id: number;
    project_id?: number;
}

export interface SubQuery {
    query: string;
    posted_date: string;
    raised_by_id: number;
    raised_by_name: string;
    raised_by_type: string;
    parent_query_id: number;
    response_value: string;
    response_type: string;
    response_type_description: string;
    attachments: Attachment[];
}