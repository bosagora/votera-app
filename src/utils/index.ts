import { NativeScrollEvent } from 'react-native';
import fetch, { HeadersInit, Response } from 'node-fetch';

export function isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
}

class HTTPResponseError extends Error {
    response: Response;

    constructor(response: Response) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`);
        this.response = response;
    }
}

function checkStatus(response: Response) {
    if (response.ok) {
        return response;
    }
    throw new HTTPResponseError(response);
}

export async function fetchJson(url: string): Promise<string> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    try {
        const response = await fetch(url, { method: 'get', headers });
        checkStatus(response);
        return response.text();
    } catch (err) {
        console.log(err);
        if (err instanceof HTTPResponseError) {
            const errorBody = await err.response.text();
            console.warn(`Error body: ${errorBody}`);
        }
        return 'Err: failed to fetch';
    }
}
