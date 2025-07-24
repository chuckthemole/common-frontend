import React, { useState } from 'react';
import { useLogout } from '../hooks/use_logout';
import { useNavigate } from 'react-router-dom';
import Spinner from './spinning_wheel';
import { useAuthStatus } from '../hooks/use_auth_status';
import { useAuth } from '../auth_context';

export default function LogoutButton({
    children = "Sign Out",
    className = "",
    showSpinner = true,
    reload = false,
    redirectTo = null,
    ...props
}) {
    const { isAuthLoading, isAuthenticated, refreshAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const logout = useLogout({
        reload,
        onLogout: () => {
            refreshAuth();
            setIsLoading(false);
            if (redirectTo && !reload) {
                navigate(redirectTo);
            }
        }
    });

    const handleClick = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await logout();
        // If `reload === true`, page reloads and this line never runs
    };

    console.log(isAuthenticated);
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

    return (
        <button
            onClick={handleClick}
            className={`button is-danger ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading && showSpinner ? (
                <span className="spinner-inline">
                    <Spinner size="16px" thickness="2px" color="#fff" />
                </span>
            ) : (
                children
            )}
        </button>
    );
}
