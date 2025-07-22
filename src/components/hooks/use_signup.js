import { useCallback, useState } from 'react';
import { getApi } from '../../api';
import qs from 'qs';

/**
 * Custom React hook to handle user signup with form-encoded credentials.
 * 
 * @param {Object} [options] - Optional configuration options.
 * @param {Function} [options.onSignup] - Callback invoked after successful signup.
 * @param {string|null} [options.redirectTo=null] - Path to redirect after successful signup.
 * @param {Function|null} [options.navigate=null] - Optional navigation function from react-router.
 * 
 * @returns {{
 *   signup: (username: string, email: string, password: string) => Promise<void>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */
export function useSignup({ onSignup, redirectTo = null, navigate = null } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handles user signup request to the backend.
     * 
     * - Sends data as `application/x-www-form-urlencoded`
     * - Handles redirection or reload on success
     * 
     * @param {string} username - Desired username
     * @param {string} email - Email address
     * @param {string} password - Desired password
     */
    const signup = useCallback(async (username, email, password) => {
        setLoading(true);
        setError(null);

        try {
            const api = getApi();

            const res = await api.post(
                '/auth/signup', // Endpoint must match backend // TODO: this should not be hard coded, it should be past as param.
                qs.stringify({ username, email, password }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    withCredentials: true
                }
            );

            if (res.status === 200 || res.status === 201) {
                if (onSignup) onSignup();

                if (redirectTo) {
                    navigate ? navigate(redirectTo) : window.location.href = redirectTo;
                } else {
                    window.location.reload();
                }
            } else {
                setError('Signup failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [onSignup, redirectTo, navigate]);

    return { signup, loading, error };
}
