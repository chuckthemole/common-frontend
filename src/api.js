import axios from 'axios';

let api = null;

export function setApi(instance) {
    api = instance;
}

export function getApi() {
    if (!api) throw new Error('API instance not set. Call setApi() first.');
    return api;
}

// TODO: maybe let the user decide params to set
export function createApiClient(baseURL) {
    return axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
}