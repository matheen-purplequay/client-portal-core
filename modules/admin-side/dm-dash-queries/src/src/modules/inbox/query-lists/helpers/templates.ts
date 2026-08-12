import { apiRoutes } from "../../../../config/api-routes";

export const getQueryTemplates = async () => {
    const response = await fetch(apiRoutes.templates.get.getQueryTemplates, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}

export const getQueryTemplatesById = async (id: number) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_id: id
        })
    };
    const response = await fetch(apiRoutes.templates.get.getQueryTemplatesById, options);
    const data = await response.json();
    return data;
}

export const getQueryTemplate = async (id: number) => {
    const response = await fetch(apiRoutes.templates.get.getQueryTemplate.replace('{id}', id.toString()), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}