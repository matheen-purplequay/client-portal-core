export interface NewslettersData {
    id?: number;
    title: string;
    month: number;
    year: number;
    link: string;
    master_company_id: number;
}

export interface ArticleData {
    id?: number;
    title: string;
    link: string;
    description: string;
    category: string;
    type: string;
    month: number;
    year: number;
    image: string;
}

export interface UsefulToolsData {
    id?: number;
    title: string;
    link: string;
    description: string;
    category: string;
    type: string;
    link_type: string;
    image: string;
}

export interface ITPolicyData {
    id?: number;
    title: string;
    date_of_issue: string;
    link: string;
}

export interface CalendarData {
    id?: number;
    month: string;
    day: string;
    year: number;
    reason: string;
    type: string;
    country: string;
    remarks: string;
}

export class CommonData {
    static defaultNewslettersData() {
        return {
            title: "",
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            master_company_id: 1,
            link: ""
        } as NewslettersData;
    }

    static defaultArticleData() {
        return {
            title: "",
            link: "",
            description: "",
            category: "",
            type: "",
            link_type: "",
            image: "",
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        } as ArticleData;
    }

    static defaultUsefulToolsData() {
        return {
            title: "",
            link: "",
            description: "",
            category: "",
            type: "",
            link_type: "",
            image: ""
        } as UsefulToolsData;
    }

    static defaultITPolicy() {
        return {
            title: "",
            date_of_issue: "",
            link: ""
        } as ITPolicyData;
    }

    static defaultCalendarData() {
        return {
            month: "",
            day: "",
            year: new Date().getFullYear(),
            reason: "",
            type: "",
            country: "",
            remarks: ""
        } as CalendarData;
    }
}