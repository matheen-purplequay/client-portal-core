export interface Document {
    documentID: number,
    title: string,
    user_id: number,
    link: string
}

export interface Template {
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
    response_type_id: number,
    response_attachments: Document[]
}