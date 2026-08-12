import { apiRoutes } from "../../../../../../config/api-routes";

export const getQueryTemplates = async () => {
    const response = await fetch(apiRoutes.queries.getQueryTemplates, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}

export const getQueryTemplate = async (id: number) => {
    const response = await fetch(apiRoutes.queries.getQueryTemplate.replace('{id}', id.toString()), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}