export interface ConnectReportData {
    id?: number;
    name: string;
    month: string;
    year: string;
    pages: string;
    client_director: string;
    team_lead: string;
    file: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

export interface WeeklyReportData {
    id?: number;
    name: string;
    month: string;
    year: string;
    week: string;
    pages: string;
    client_director: string;
    team_lead: string;
    file: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

export interface InvoiceData {
    client_id: string;
    invoice_number: string;
    name: string;
    date: string;
    file: string;   
}

export class Report {
    static defaultConnectReportData() {
        return {
            name: '',
            month: '',
            year: '',
            pages: '',
            file: '',
            status: 0,
            created_at: new Date(),
            updated_at: new Date()
        } as ConnectReportData;
    }

    static defaultWeeklyReportData() {
        return {
            id: 0,
            name: "",
            month: "",
            year: "",
            week: "",
            pages: "",
            file: "",
            status: 0,
            created_at: new Date(),
            updated_at: new Date(),
        } as WeeklyReportData;
    }

    static defaultInvoiceData() {
        return {
            client_id: "",
            invoice_number: "",
            name: "",
            date: "",
            file: ""
        } as InvoiceData;
    }
}