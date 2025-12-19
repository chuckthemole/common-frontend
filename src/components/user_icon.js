import React, { useEffect, useState } from 'react';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';

import {
    getPathsFromBasePath,
    isCurrentUserAuthenticated,
    currentUserInfo,
    getCurrentBasePath
} from './common_requests';

import BasePath from './base_path';
import logger from '../logger';

export default function UserIcon() {
    const base_path = BasePath();
    const [basePathCurrentUserInfo, setBasePathCurrentUserInfo] = useState('');

    const user_info = currentUserInfo({
        get_user_info_path: basePathCurrentUserInfo
    });

    const is_user_authenticated = isCurrentUserAuthenticated();

    /**
     * Resolve CurrentUserInfo path once base_path is available
     */
    useEffect(() => {
        if (
            basePathCurrentUserInfo === '' &&
            base_path?.BASE_PATH &&
            base_path?.BASE_PATH_CHILD_LIST?.common_paths?.CurrentUserInfo
        ) {
            const path =
                base_path.BASE_PATH +
                base_path.BASE_PATH_CHILD_LIST.common_paths.CurrentUserInfo;

            logger.debug('Resolved CurrentUserInfo path', { path });
            setBasePathCurrentUserInfo(path);
        }
    }, [base_path, basePathCurrentUserInfo]);

    /**
     * Not authenticated → no icon
     */
    if (!is_user_authenticated.isAuthenticated) {
        logger.debug('User not authenticated, hiding UserIcon');
        return null;
    }

    /**
     * Base path misconfiguration
     */
    if (
        !base_path ||
        !base_path.BASE_PATH ||
        !base_path.BASE_PATH_CHILD_LIST?.common_paths?.CurrentUserInfo
    ) {
        logger.error('UserIcon: Missing base path configuration', { base_path });

        return (
            <>
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html="Error finding user!"
                    data-tooltip-place="bottom"
                >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </a>
                <ReactTooltip id="my-tooltip" />
            </>
        );
    }

    /**
     * User info error
     */
    if (user_info.isError) {
        logger.error('UserIcon: Error fetching user info', user_info.error);

        return (
            <>
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html="Error finding user!"
                    data-tooltip-place="bottom"
                >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </a>
                <ReactTooltip id="my-tooltip" />
            </>
        );
    }

    /**
     * Loading state
     */
    if (user_info.isLoading) {
        logger.debug('UserIcon: Loading user info');

        return (
            <>
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html="Loading..."
                    data-tooltip-place="bottom"
                >
                    <FontAwesomeIcon icon={faUser} />
                </a>
                <ReactTooltip id="my-tooltip" />
            </>
        );
    }

    /**
     * No user data yet
     */
    if (!user_info.user_info) {
        logger.warn('UserIcon: user_info missing but no error/loading state');

        return (
            <div className="container m-6">
                <progress
                    className="progress is-small is-primary"
                    max="100"
                >
                    Loading…
                </progress>
            </div>
        );
    }

    /**
     * Render user icon
     */
    logger.debug('UserIcon: Rendering user info', {
        username: user_info.user_info.username
    });

    return (
        <div className="navbar-item">
            <a
                data-tooltip-id="my-tooltip"
                data-tooltip-html={
                    `Username: ${user_info.user_info.username}<br />` +
                    `Email: ${user_info.user_info.email}`
                }
                data-tooltip-place="bottom"
            >
                ◕‿‿◕
            </a>
            <ReactTooltip id="my-tooltip" />
        </div>
    );
}
