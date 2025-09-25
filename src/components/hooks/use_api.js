import { useState, useEffect } from 'react';
import { getApi } from '../../api';
import logger from '../../logger';

/**
 * Generic hook to fetch data from an API endpoint using Axios.
 *
 * @param {string} path - API path to fetch data from
 * @param {Object} [options] - Optional config
 * @param {boolean} [options.skip=false] - Skip the fetch
 * @returns {Object} { data, error, loading }
 */
export function useApi(path, options = {}) {
    const { skip = false } = options;
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!skip);

    useEffect(() => {
        if (skip || !path) {
            logger.error(`skipping or no path`);
            return;
        }

        let isMounted = true;
        const api = getApi();

        logger.info(`useApi: fetching data from ${path}`);
        setLoading(true);

        api.get(path)
            .then((res) => {
                if (!isMounted) return;
                setData(res.data);
                logger.info(`useApi: fetched data successfully.`);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err);
                logger.error(`useApi: error fetching data from ${path}`, err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
            logger.debug(`useApi: cleanup for ${path}`);
        };
    }, [path, skip]);

    return { data, error, loading };
}
