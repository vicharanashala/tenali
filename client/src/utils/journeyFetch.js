import CONFIG from "../config";
import { authGetToken } from './authHelper';

const journeyFetch = async (path, options = {}) => {
    const token = authGetToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${CONFIG.api}${path}`, {
        ...options,
        headers,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `Request failed (HTTP ${res.status})`);
    }
    return res.json();
};

export default journeyFetch