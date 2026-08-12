import React, { createContext, useContext, useState, useEffect } from "react";
import { getData } from "../helpers/fetch";
import { apiRoutes } from "../../../config/api-routes";

export interface Client {
    client_id: number;
    client: string;
}

export interface ClientSelectionContextType {
    selectedClientIds: string;
    setSelectedClientIds: (clientIds: string) => void;
    clients: Client[];
    setClients: (clients: Client[]) => void;
    isLoading: boolean;
}

export const ClientSelectionContext = createContext<ClientSelectionContextType | null>(null);

export const useClientSelection = () => {
    const context = useContext(ClientSelectionContext);
    if (!context) {
        throw new Error("useClientSelection must be used inside ClientSelectionProvider");
    }
    return context;
};

interface ClientSelectionProviderProps {
    children: React.ReactNode;
    userData?: {
        staff_id?: number | string;
    };
}

export function ClientSelectionProvider({ children, userData }: ClientSelectionProviderProps) {
    const [selectedClientIds, setSelectedClientIds] = useState<string>("");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch clients on initial load
    useEffect(() => {
        const fetchClients = async () => {
            if (!userData?.staff_id) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await getData(apiRoutes.queries.get.getJobQueries, [
                    `userId=${userData.staff_id}`,
                    `clientId=0`,
                    `queryStatusId=0`,
                    `queryCriticalityId=0`,
                    `queryCategoryId=0`,
                    `querySubCategoryId=0`
                ]);

                if (data.queries?.length > 0) {
                    // Extract unique clients from job queries
                    const uniqueClients = Array.from(
                        new Map(
                            data.queries.map((q: any) => [q.client_id, { client: q.client, client_id: q.client_id }])
                        ).values()
                    ) as Client[];

                    setClients(uniqueClients);

                    // Set all client IDs as selected by default
                    const clientIds = uniqueClients.map(client => client.client_id).join(",");
                    setSelectedClientIds(clientIds);
                }
            } catch (error) {
                console.error("Failed to fetch clients for context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
    }, [userData?.staff_id]);

    return (
        <ClientSelectionContext.Provider value={{ 
            selectedClientIds, 
            setSelectedClientIds, 
            clients, 
            setClients,
            isLoading 
        }}>
            {children}
        </ClientSelectionContext.Provider>
    );
}
