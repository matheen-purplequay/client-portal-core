export interface Clients { 
    companies: any[];
    selectedClient: { 
        works_manager_client_id: number;
        name: string;
    } 
}

export class Client {
    static defaultClients() {
        return {
            companies: [], 
            selectedClient: { 
                works_manager_client_id: 0, 
                name: '' 
            }
        } as Clients;
    }
}

export interface TeamsPayload {
    client_id: number;
    user_id?: number;
    wm_user_id: number;
    name: string;
    heirarchy: number;
    role_id: number;
    vertical_id: number;
    email: string;
    status: string;
}

export interface TeamsData {
    id: number;
    client_id: number;
    name: string;
    heirarchy: number;
    role: { id: number; title: string };
    vertical: { id: number; title: string };
    email: string;
    status: string;
}

export class Teams {
    static defaultTeamsPayload() {
        return {
            client_id: 0,
            user_id: 0,
            wm_user_id: 0,
            name: "",
            role_id: 0,
            heirarchy: 0,
            vertical_id: 0,
            email: "",
            status: "active"
        } as TeamsPayload;
    }
}