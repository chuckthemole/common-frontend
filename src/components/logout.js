import React, { useState } from 'react';
import { isCurrentUserAuthenticated } from './common_requests';
import { getApi } from '../api';
import Spinner from './ui/spinning_wheel';
import { useAuthStatus } from './hooks/use_auth_status';

export default function Logout() {

    const { isLoading, isAuthenticated, refetch } = useAuthStatus();

    function handleSubmit(e) {
        e.preventDefault();

        const api = getApi(); // configured axios instance

        api.post(
            '/auth/logout', // TODO: this path should be abstracted
        ).then(res => {
            if (res.status === 200) {
                window.location.reload();
            } else {
                console.error('Logout failed');
            }
        }).catch(err => {
            console.error('Logout failed', err);
        });
    }

    const logout = (
        <form onSubmit={handleSubmit}>
            <button className="logoutBtn button is-danger" type="submit" value="Sign Out">
                Sign Out
            </button>
        </form>
    );

    // const is_user_authenticated = isCurrentUserAuthenticated();
    console.log(isAuthenticated);
    if (isLoading || isAuthenticated.isLoading) {
        return (
            <Spinner size="20px" thickness="2px" color="#333" />
        );
    }
    return isAuthenticated.authenticated ? logout : <></>;
}