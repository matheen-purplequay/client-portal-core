export const getData = async (apiURL: string, queryString?: string[]) => {
    const response = await fetch(apiURL + (queryString ? `?${queryString.join('&')}` : ''), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}

export const getPostData = async (apiURL: string, body: any) => {
    const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return data;
}

export const postData = async (apiURL: string, body: any) => {
    const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return data;
}

export const postDataWithParams = async (apiURL: string, params: string[]) => {
    const response = await fetch(`${apiURL}?${params.join('&')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
    const data = await response.json();
    return data;
}

export const postFile = async (apiURL: string, file: File, otherData: any = {}) => {
    const formData = new FormData();
    formData.append('excel_file', file);
    
    Object.keys(otherData).forEach(key => {
        formData.append(key, otherData[key]);
    });

    const response = await fetch(apiURL, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    return data;
}