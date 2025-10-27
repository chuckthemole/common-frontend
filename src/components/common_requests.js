// TODO: why is this in react dir? - chuck

import useSWR from 'swr';
import { getApi } from '../api';
import logger from '../logger';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const common_fetcher = async (endpoint) => {
    const api = getApi();
    try {
        const res = await api.get(endpoint);
        // console.log('common_fetcher debug');
        // console.log(endpoint);
        // console.log(res);

        // Safely return data, or an empty object/array if undefined
        return res.data ?? {}; // or use [] if the API typically returns arrays
    } catch (error) {
        // Optional: handle 204 No Content gracefully
        if (error.response?.status === 204) {
            return {}; // or [] depending on what your consumers expect
        }
        logger.info(endpoint);
        const err = new Error('An error occurred while fetching the data.');
        err.info = error.response?.data || null;
        err.status = error.response?.status || 500;
        throw err;
    }
};



/**
 * Common loader for all common requests
 * 
 * @param {string} path path to GET request
 * @returns {object} {data, error, isLoading}
 */
export function common_loader(path) {
    const { data, error, isLoading } = useSWR(
        path,
        common_fetcher
    );
    return {
        data: data,
        error: error,
        isLoading: isLoading
    }
}

export function getCurrentBasePath() {
    const { data, error, isLoading } = useSWR(
        "/common/api/current_base_path",
        common_fetcher
    );

    return {
        current_base_path: data,
        isLoading,
        isError: error
    }

}

export function getCommonPaths() {
    const { data, error, isLoading } = useSWR(
        "/common/api/paths",
        common_fetcher
    );

    return {
        common_paths: data,
        isLoading,
        isError: error
    }
}

export function getPathsFromBasePath(base_path) {
    const { data, error, isLoading } = useSWR(
        "common/api/paths" + base_path,
        common_fetcher
    );
    return {
        common_paths: data,
        isLoading,
        isError: error
    }

}

// Hook for auth status
export function useAuthStatus() {
    const { data, error, isLoading } = useSWR(
        "/auth/is_authenticated",
        // "/common/api/is_authenticated",
        common_fetcher, {
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
        // refreshWhenOffline: false,
        // refreshWhenHidden: false,
        // refreshInterval: 2000
    }
    );

    return {
        isAuthenticated: data,
        isLoading,
        isError: error
    }
}

// This version is for non-hook usage
export async function isCurrentUserAuthenticated() {
    return await common_fetcher("/auth/is_authenticated");
}

export function getCurrentUserAuthorities({ get_user_auth_path }) {
    const { data, error, isLoading } = useSWR(get_user_auth_path, common_fetcher);

    let authorities = [];
    if (!error && data?.userDetails?.authorities) {
        authorities = data.userDetails.authorities.map(auth => auth.authority);
    }

    return {
        data,
        error,
        isLoading,
        authorities
    };
}

export function currentUserInfo({ get_user_info_path }) {
    const { data, error, isLoading } = useSWR(
        get_user_info_path,
        common_fetcher
    );
    return {
        user_info: data,
        isLoading,
        isError: error
    }
}