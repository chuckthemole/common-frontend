import { useCallback, useState } from 'react';
import { getApi } from '../../api';
import qs from 'qs'; // Used to serialize data as x-www-form-urlencoded

/**
 * Custom React hook to handle user login with form-encoded credentials.
 * 
 * @param {Object} [options] - Optional configuration.
 * @param {Function} [options.onLogin] - Callback executed after successful login.
 * @param {string|null} [options.redirectTo=null] - Optional URL to redirect after login. If not provided, the page reloads.
 * @param {Function|null} [options.navigate=null] - Optional navigation function (e.g., from React Router's useNavigate).
 * 
 * @returns {{
 *   login: (username: string, password: string) => Promise<void>,
 *   loading: boolean,
 *   error: string | null
 * }} Object containing the login function, loading state, and error message.
 */
export function useLogin({ onLogin, redirectTo = null, navigate = null } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Attempts to log in a user by posting to the backend login endpoint.
     * 
     * - Sends credentials as `application/x-www-form-urlencoded`, which is the default expected format for Spring Boot form login.
     * - Sets `withCredentials: true` to ensure cookies (like `SESSION`) are included in the response.
     * - Handles both redirect and page reload based on configuration.
     * 
     * @param {string} username - The username provided by the user.
     * @param {string} password - The corresponding password.
     */
    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const api = getApi();

            const res = await api.post(
                '/auth/login', // TODO: This path should eventually be made configurable
                qs.stringify({ username, password }), // Send as x-www-form-urlencoded
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    withCredentials: true, // Required for session cookie
                    // maxRedirects: 0 // prevent axios from following 302 to `/`
                }
            );

            if (res.status === 200) {
                if (onLogin) onLogin();

                if (redirectTo) {
                    if (navigate) {
                        navigate(redirectTo); // Preferred: client-side routing
                    } else {
                        window.location.href = redirectTo; // Fallback: full reload
                    }
                } else {
                    window.location.reload(); // Default reload if no redirect path
                }
            } else {
                setError('Invalid credentials.');
            }
        } catch (err) {
            console.error('Login error:', err); // always do this
            if (err.response) {
                console.error('Error status:', err.response.status);
                console.error('Error data:', err.response.data);
            } else {
                console.error('No response received:', err.message);
            }
            setError('Login failed.');
        } finally {
            setLoading(false);
        }
    }, [onLogin, redirectTo, navigate]);

    return { login, loading, error };
}
