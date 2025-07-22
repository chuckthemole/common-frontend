import React, { useEffect, useState } from 'react';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';
import { getPathsFromBasePath, isCurrentUserAuthenticated, currentUserInfo, getCurrentBasePath } from './common_requests';
import BasePath from './base_path';

export default function UserIcon() {

    const base_path = BasePath();
    const [base_path_current_user_info, setBasePathCurrentUserInfo] = useState(''); // the current user info path
    const user_info = currentUserInfo({get_user_info_path: base_path_current_user_info}); // the current user info
    const is_user_authenticated = isCurrentUserAuthenticated(); // is the current user authenticated

    if(!is_user_authenticated.isAuthenticated) { // no icon to display if user is not authenticated
        return (<></>);
    } else if(
        base_path === undefined ||
        base_path.BASE_PATH === undefined ||
        base_path.BASE_PATH_CHILD_LIST === undefined ||
        base_path.BASE_PATH_CHILD_LIST.common_paths === undefined ||
        base_path.BASE_PATH_CHILD_LIST.common_paths.CurrentUserInfo === undefined) {

        console.log('Error finding user icon!');
        return(
            <>
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html={
                        "Error finding user!"
                    }
                    data-tooltip-place="bottom"
                >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </a>
                <ReactTooltip id="my-tooltip" />
            </>
        );
    } else {

        if(base_path_current_user_info === '') {
            setBasePathCurrentUserInfo(base_path.BASE_PATH + base_path.BASE_PATH_CHILD_LIST.common_paths.CurrentUserInfo);
        }

        if (user_info.isError) {
            return (
                <>
                    <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={
                            "Error finding user!"
                        }
                        data-tooltip-place="bottom"
                    >
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                    </a>
                    <ReactTooltip id="my-tooltip" />
                </>
            )
        }

        if(user_info.isLoading) {
            return (
                <>
                    <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={
                            "Loading..."
                        }
                        data-tooltip-place="bottom"
                    >
                        <FontAwesomeIcon icon={faUser} />
                    </a>
                    <ReactTooltip id="my-tooltip" />
                </>
            );
        }

        if(!user_info.user_info) {
            return(
                <div className='container m-6'>
                    <progress className="progress is-small is-primary" max="100">15%</progress>
                </div>
            )
        }

        if(user_info.user_info === undefined && user_info.isError === undefined) {
            console.log('Error finding user icon... user_info and error is undefined!');
            return(
                <>
                    <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={
                            "Error finding user!"
                        }
                        data-tooltip-place="bottom"
                    >
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                    </a>
                    <ReactTooltip id="my-tooltip" />
                </>
            );
        }
        
        return (
            <>
                <div className="navbar-item">
                    <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={
                            "Username: " + user_info.user_info.username +
                            "<br />Email: " + user_info.user_info.email
                        }
                        data-tooltip-place="bottom"
                    >
                        ◕‿‿◕
                    </a>
                    <ReactTooltip id="my-tooltip" />
                </div>
            </>
        );
    }
}