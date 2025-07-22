import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { isCurrentUserAuthenticated, getCurrentUserAuthorities } from './common_requests';
import BasePath from './base_path';

export default function Admin() {
    const base_path = BasePath();
    const [fullPath, setFullPath] = useState('');
    const isUserAuth = isCurrentUserAuthenticated();
    const { BASE_PATH, BASE_PATH_CHILD_LIST } = base_path;

    useEffect(() => {
        if (
            BASE_PATH_CHILD_LIST?.common_paths?.CurrentUserInfo &&
            !fullPath
        ) {
            setFullPath(BASE_PATH + BASE_PATH_CHILD_LIST.common_paths.CurrentUserInfo);
        }
    }, [base_path]);

    const {
        authorities,
        isLoading: isAuthoritiesLoading,
        error: authoritiesError
    } = getCurrentUserAuthorities({ get_user_auth_path: fullPath });

    if (isUserAuth?.isLoading || isAuthoritiesLoading) return <></>;
    if (isUserAuth?.isError || authoritiesError) return <></>;

    const isAdmin = authorities.includes('ROLE_ADMIN');

    return isUserAuth?.isAuthenticated && isAdmin ? (
        <Link to="/admin" className="adminBtn button is-info"><strong>Admin</strong></Link>
    ) : (
        <></>
    );
}
