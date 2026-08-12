export interface QueryPayload {
    topicID:    number;
    comment:    string;
    parentID:   number;
    userID:     number;
    raisedTo:   number;
}

export interface QueryRequestPayload {
    topicCode:  number;
    pageNumber: number;
    pageSize:   number;
    userCode:   number;
}

export interface SubQueryRequestPayload {
    commentID:  number;
    pageNumber: number;
    pageSize:   number;
    userCode:   number;
    topicCode:  number;
    raisedTo:   number;
}

export interface QueriesData {
    createdon: string;
    hasSubQueries: boolean;
    query: string;
    queryId: number;
    raisedToName: string;
    raisedToUserId: number;
    userCode: number;
    userName: string;
}

export class Queries {
    static defaultQueriesData() {
        return {
            createdon: "",
            hasSubQueries: false,
            query: "",
            queryId: 0,
            raisedToName: "",
            raisedToUserId: 0,
            userCode: -1,
            userName: ""
        } as QueriesData;
    }
}