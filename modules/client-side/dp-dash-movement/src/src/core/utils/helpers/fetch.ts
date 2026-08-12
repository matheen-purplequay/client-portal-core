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