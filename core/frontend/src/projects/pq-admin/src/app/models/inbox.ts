export interface JobInstruction {
    Pid: number;
    ClientName: string;
    JobName: string;
    jobid: number;
    Aid: number;
    UserId: number;
    CommentType: number;
    Comments: string;
    CommentId: number;
    CommentCode: number;
    CreatedOn: string;
    username: string;
    profile_picture: string | null;
}

export class JobInstruction {
    static defaultJobInstructionList() {
        return {
            Pid: 0,
            ClientName: "",
            JobName: "",
            jobid: 0,
            Aid: 0,
            UserId: 0,
            CommentType: 0,
            Comments: "",
            CommentId: 0,
            CommentCode: 0,
            CreatedOn: "",
            username: "",
            profile_picture: ""
        } as JobInstruction;
    }
}