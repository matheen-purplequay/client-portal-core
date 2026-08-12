export interface CommentCode {
    id: number;
    code: number;
    app_id: number;
    title: string;
    description: string;
}

export interface Instruction {
    id: number;
    Aid: number;
    UserId: number;
    Pid: number;
    CommentType: number;
    Comments: string;
    CommentId: number;
    CommentCode: number;
    IsActive: number;
    CreatedOn: string;
    CreatedBy: number;
    UpdatedOn: string | null;
    UpdatedBy: number | null;
    RemovedOn: string | null;
    RemovedBy: number | null;
    username: string;
    profile_picture: string;
}