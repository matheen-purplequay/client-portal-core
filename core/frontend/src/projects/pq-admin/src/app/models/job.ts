export interface JobFeedback {
    Aid: number;
    JobDescription?: string;
    UserId: number;
    Clientname: string;
    Pid: number;
    ProcessArea: string;
    SubProcessArea: string;
    Feedback: string;
    DTComments: string;
    FeedbackStatus: number;
    IsActive: number;
    Date: string;
    Createddate: Date;
    CreatedOn: Date;
    CreatedBy: number;
    UpdatedOn: Date;
    UpdatedBy: number;
    Status: string;
}

export const SubProcessArea = {
    query: {
        code: 'query',
        title: 'Query',
        sub_process: ['Document', 'Pension Allocation', 'Contribution Allocation'],
    },
    accounting: {
        code: 'accounting',
        title: 'Accounting',
        sub_process: ['Investment Reconciliation', 'GST Reconciliation', 'Income Tax Reconciliation', 'Pension Commencement', 'Software Procedures', 'Tax Return Validation'],
    },
    workpaper: {
        code: 'workpaper',
        title: 'Workpaper',
        sub_process: ['Document', 'Workings/Reconciliation', 'Collation'],
    },
    others: {
        code: 'others',
        title: 'Others',
        sub_process: ['Communication', 'Turnaround']
    }
}

export class JobFeedback {
    static defaultJobFeedback() {
        return {
            Aid: 0,
            JobDescription: '',
            UserId: 0,
            Pid: 0,
            ProcessArea: '',
            SubProcessArea: '',
            Feedback: '',
            Date: `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
            Createddate: new Date(),
            DTComments: '',
            FeedbackStatus: 0,
            IsActive: 0,
            CreatedOn: new Date(),
            CreatedBy: 0,
            UpdatedOn: new Date(),
            UpdatedBy: 0,
            Status: ''
        } as JobFeedback;
    }
}