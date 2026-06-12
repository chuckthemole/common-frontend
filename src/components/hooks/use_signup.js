import { useCallback, useState } from 'react';
import { getApi } from '../../api/client/api';
import qs from 'qs';
import { useCreateUser } from '../user/hooks/useCreateUser';
import logger from '../../logger';

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
export function useSignup({
    onSignup,
    redirectTo = null,
    navigate = null
} = {}) {

    const {
        createUser,
        loading,
        error,
    } = useCreateUser();

    const signup = useCallback(
        async (
            username,
            email,
            password
        ) => {

            const session =
                await createUser({
                    username,
                    email,
                    password,
                });

            if (!session.success) {
                logger.error(
                    "[useSignup] signup() failed",
                    {
                        error: session.error,
                    }
                );
                return;
            }

            onSignup?.(session.data);

            if (redirectTo) {

                navigate
                    ? navigate(redirectTo)
                    : window.location.assign(
                        redirectTo
                    );

                return;
            }

            window.location.reload();

        },
        [
            createUser,
            onSignup,
            redirectTo,
            navigate,
        ]
    );

    return { signup, loading, error };
}
