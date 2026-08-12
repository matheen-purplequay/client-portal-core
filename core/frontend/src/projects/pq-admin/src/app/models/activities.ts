export interface Activities {
    [key: string]: { title: string, index: number };
    connectList    : { title: string, index: number };
    connectView    : { title: string, index: number };
    connectUpload  : { title: string, index: number };
    weeklyList     : { title: string, index: number };
    weeklyView     : { title: string, index: number };
    weeklyUpload   : { title: string, index: number };
};

export class Activity {
    static defaultActivity() {
        return 1;
    }

    static defaultActivities() {
        return {
            connectList    : { title: 'Connect List', index: 1 },
            connectView    : { title: 'Connect View', index: 2 },
            connectUpload  : { title: 'Connect Updaet', index: 3 },
            weeklyList     : { title: 'Weekly List', index: 4 },
            weeklyView     : { title: 'Weekly View', index: 5 },
            weeklyUpload   : { title: 'Weekly Upload', index: 6 }
        };
    }
}