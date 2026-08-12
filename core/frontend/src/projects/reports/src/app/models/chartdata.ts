import { NgbDate } from "@ng-bootstrap/ng-bootstrap";

export interface WorkFlowStatus {
    Clientname: string,
    Jobdescription: string,
    TLName: string,
    timetaken: string,
    budgettime: string,
    Status: string,
    Daterecieved: string,
    EstimatedDate: string,
    LastTouch: number
}

export interface WorkFlowRequest {
    filterType: number;
    startDate: Date;
    endDate: Date;
    project_id: number;
    month: number;
    monthText: string;
    monthTextWithYear: string;
    year: number;
    vertical: number;
}

export interface JobStatusRequest {
    contractType: number;
    period: string;
    project_id: number;
    vertical: number;
}

export interface ToARequest {
    project_id: number;
    intervalId: number;
}

export interface ToAData {
    Month: string;
    ClosedJobs: number;
    NearToClose: number;
}

export class DefaultRequest {
    static defaultWorkflowRequest() {
        return {
            filterType: 1,
            startDate: new Date(),
            endDate: new Date(),
            project_id: 0,
            month: 0,
            monthText: "",
            monthTextWithYear: "",
            year: 0,
            vertical: 1
        } as WorkFlowRequest;
    }

    static defaultToARequest(): ToARequest {
        return {
            project_id: 0,
            intervalId: 0
        } as ToARequest;
    }

    static defaultJobStatusRequest() {
        return {
            contractType: 0,
            period: '',
            project_id: 0,
            vertical: 0
        } as JobStatusRequest
    }
}

