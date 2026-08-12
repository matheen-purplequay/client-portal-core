export interface ConnectReportPayload {
    id: number;
    client_id: number;
    name: string;
    pages: string;
    month: string;
    year: number;
    report_type: string;
    client_director: string;
    team_lead: string;
    uploaded_by: string;
}

export interface ConnectReportData {
    id: number;
    client_id: number;
    name: string;
    company_name: string;
    company_id: number;
    title: string;
    pages: string;
    month: string;
    year: number;
    client_director: string;
    team_lead: string;
    uploaded_by: number;
    uploaded_by_email: string;
    uploaded_by_first_name?: string;
    uploaded_by_last_name?: string;
    approved_by_first_name?: string;
    approved_by_last_name?: string;
    rejected_by_first_name?: string;
    rejected_by_last_name?: string;
    approved_by: string;
    rejected_by: string;
    status: number;
    status_name: string;
    status_role: string;
    status_type: string;
    reason: string;
    file: string;
    custom_section: string;
    uploaded_date: string;
    is_email_sent_code: number;
    approval_mail_requested_by: number;
    mail_sent_count: number;
}

export interface WeeklyReportList {
    id: number;
    client_id: number;
    name: string;
    pages: string;
    month: string;
    year: number;
    client_director: string;
    team_lead: string;
    uploaded_by: string;
    approved_by: string;
    file: string;
}

export class Report {
    static defaultConnectReportPayload() {
        return {
            id: 0,
            client_id: 0,
            name: "",
            pages: "",
            month: "",
            year: 0,
            report_type: "",
            client_director: "",
            team_lead: "",
            uploaded_by: "",
            approved_by: ""
        } as ConnectReportPayload;
    }

    static defaultConnectReportData() {
        return {
            id: 0,
            client_id: 0,
            name: "",
            pages: "",
            month: "",
            year: 0,
            client_director: "",
            team_lead: "",
            uploaded_by: 0,
            approved_by: "",
            status: 0,
            status_name: "",
            reason: "",
            file: "",
        } as ConnectReportData;
    }

    static defaultWeeklyReportList() {
        return {
            id: 0,
            client_id: 0,
            name: "",
            pages: "",
            month: "",
            year: 0,
            client_director: "",
            team_lead: "",
            uploaded_by: "",
            approved_by: "",
            file: "",
        } as WeeklyReportList;
    }
}

export interface AgreedPayload {
    project_id: number;
    month: string;
    year: number;
    number_of_jobs: number;
}

export interface AgreedData {
    id: number;
    month: string;
    year: number;
    number_of_jobs: number;
}

export interface AgreedJobDetailsData {
    id: number;
    job_name: string;
    date_received: string;
    job_status: string;
}

export class Agreed {
    static defaultAgreedPayload() {
        return {
            project_id: 0,
            month: "",
            year: 0,
            number_of_jobs: 0
        } as AgreedPayload;
    }
}