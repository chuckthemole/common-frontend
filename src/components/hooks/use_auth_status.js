import { useState, useEffect } from 'react';
import { getApi } from '../../api';

export function useAuthStatus() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState({ authenticated: false });

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const res = await getApi().get('/auth/is_authenticated'); // TODO: need to pass this endpoint in
            setIsAuthenticated(res.data);
        } catch (err) {
            setIsAuthenticated({ authenticated: false });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return { isLoading, isAuthenticated, refetch: fetchStatus };
}
