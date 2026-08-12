export interface JobData {
    [key: string]: any;
    Aid: number;
    JobId: number;
    JobName: string;
    Status: string;
    SubClientName: string;
    ClientContact: string;
    FinancialYear: number | string;
    Datereceived: string;
    LastTouch: string;
    commentcode: number;
    commentid: number;
    CommentsCreatedOn: string;
}

export interface JobFeedback {
    Aid: number;
    UserId: number;
    Pid: number;
    ProcessArea: string;
    SubProcessArea: string;
    Feedback: string;
    DTComments: string;
    FeedbackStatus: number;
    IsActive: number;
    Date: string;
    CreatedOn: Date;
    CreatedBy: number;
    UpdatedOn: Date;
    UpdatedBy: number;
    Status: string;
}

export class Job {
    static defaultJob() {
        return {
            Aid: 0,
            Datereceived: "",
            JobId: 0,
            JobName: "",
            Status: "",
            SubClientName: "",
            ClientContact: "",
            FinancialYear: "",
            LastTouch: "",
            commentcode: 0,
            commentid: 0
        } as JobData;
    }

    static defaultJobFeedback() {
        return {
            Aid: 0,
            UserId: 0,
            Pid: 0,
            ProcessArea: '',
            SubProcessArea: '',
            Feedback: '',
            DTComments: '',
            FeedbackStatus: 0,
            IsActive: 0,
            Date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
            CreatedOn: new Date(),
            CreatedBy: 0,
            UpdatedOn: new Date(),
            UpdatedBy: 0,
            Status: ''
        } as JobFeedback;
    }
}

export interface comments {
    comment_id: number;
    job_id: number;
    user_id: number;
    comment: string;
    commented_date: Date;
    status: 0 | 1;
}

export interface CommentCode {
    id: number;
    code: number;
    title: string;
    description: string;
}
  
export class CommentCode {
    static defaultCommentCode() {
      return {
        id: 0,
        code: 0,
        title: "",
        description: ""
      } as CommentCode;
    }
}
  