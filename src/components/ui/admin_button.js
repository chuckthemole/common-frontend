import React, { useState } from 'react';
import { useLogout } from '../hooks/use_logout';
import { useNavigate } from 'react-router-dom';
import Spinner from './spinning_wheel';
import { useAuthStatus } from '../hooks/use_auth_status';
import { useAuth } from '../auth_context';
import { Link } from 'react-router-dom';

export default function AdminButton({
    children = "Admin",
    className = "",
    showSpinner = true,
    reload = false,
    redirectTo = null,
    ...props
}) {
    const { isAuthLoading, isAuthenticated, roles } = useAuth();

    console.log(roles);
    if (isAuthLoading || isAuthenticated === undefined) {
        return (
            <Spinner size="20px" thickness="2px" color="#333" />
        );
    }

    if (!isAuthenticated) {
        return (
            <></>
        );
    }

    if (roles.some(role => role.authority === 'ROLE_ADMIN')) {
        return (
            <Link to="/admin" className="adminBtn button is-info"><strong>Admin</strong></Link>
        );
    }

    return (
        <></>
    );
}
