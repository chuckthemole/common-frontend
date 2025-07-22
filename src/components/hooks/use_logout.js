import { useCallback } from 'react';
import { getApi } from '../../api';

/**
 * Hook to log out the current user.
 *
 * @param {Object} options
 * @param {boolean} options.reload - Whether to reload the page after logout (default: true)
 * @param {Function} options.onLogout - Optional callback to run after successful logout (before reload)
 * @returns {Function} logout - A function to call to log out the user
 */
export function useLogout({ reload = true, onLogout } = {}) {
    return useCallback(async () => {
        try {
            const api = getApi();
            const res = await api.post(
                '/auth/logout', // TODO: Abstract this path later
                {
                    // maxRedirects: 0 // prevent axios from following 302 to `/`
                }
            );

            console.log(res);

            if (res.status === 200) {
                if (typeof onLogout === 'function') {
                    onLogout(); // You can now unset loading state or redirect here
                }

                if (reload) {
                    window.location.reload();
                }
            } else {
                console.error('Logout failed: bad status code');
            }
        } catch (err) {
            console.error('Logout failed', err);
        }
    }, [reload, onLogout]);
}
