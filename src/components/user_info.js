import React, { useState } from 'react';
import useSWR from 'swr';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';
import { getCommonPaths, isCurrentUserAuthenticated } from './common_requests';

import api from '../api';

const fetcher = (url, config) => api(url, config).then((res) => res.data);

/**
 * TODO: Am I using this? I don't think so. Maybe prune. - chuck
 */
export default function UserIcon({current_user_path}) {

    // const common_uri = CommonURI();
    const common_uri = getCommonPaths();
    const [is_user_authenticated, setIsUserAuthenticated] = useState(isCurrentUserAuthenticated());
    // const [is_user_authenticated_common, setIsUserAuthenticatedCommon] = useState(isCurrentUserAuthenticatedCommon());
    // const [common_uri, setCommonURI] = useState(<CommonURI />);
    
    console.log("common_uri: ");
    console.log(common_uri);
    // console.log("current_user_path: " + common_uri.create_user_path);
    // console.log("* * current_user_path: " + common_uri.current_user_info_path);
    // console.log("is_user_authenticated: " + JSON.stringify(is_user_authenticated));
    // console.log("is_user_authenticated_common: " + JSON.stringify(is_user_authenticated_common));

    if(!is_user_authenticated.isAuthenticated) {
        console.log('User is not authenticated!');
        return (<></>);
    } else if(common_uri === undefined || common_uri.common_paths === undefined || common_uri.common_paths.CurrentUserInfoPath === undefined) {
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
        const { data, error, isLoading } = useSWR(
            // current_user_path,
            common_uri.common_paths.CurrentUserInfoPath,
            fetcher
        );

        if (error) return (
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

        if(isLoading) return (
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
        
        // if (!data) return <p>Loading</p>;

        if (!data) return(
            <div className='container m-6'>
                <progress className="progress is-small is-primary" max="100">15%</progress>
            </div>
        )
        
        return (
            <>
                <div className="navbar-item">
                    <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={
                            "Username: " + data.username +
                            "<br />Email: " + data.email
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