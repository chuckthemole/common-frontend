import React, { useEffect, useState } from 'react';
import { useFetcher } from 'react-router-dom';

import { USERNAME, PASSWORD, EMAIL, EMPTY, POST } from './common';

/**
 * TODO: rethink this component. Maybe move into common_requests.js?  An ease of use form wrapper for useFetcher would be nice. - chuck 2023-12-05
 * 
 * Uses react-router-dom's useFetcher hook to make a request. https://reactrouter.com/en/main/hooks/use-fetcher
 * 
 * @param {string} request_type - The type of request to make. (post, get, etc.)
 * @param {string} action - The action to take.
 * @param {string} fetcher_key - The fetcher_key to use. Can be empty.
 * @param {string} body - The body of the request. You should provide your own body (button, input, etc.).
 */
export default function CommonUseFetcher({request_type, action, onSubmit, fetcher_key, body}) {

    const fetcher = fetcher_key !== undefined ? useFetcher({key: {fetcher_key}}) : useFetcher();
    
    // useEffect(() => {
    //     if(fetcher !== undefined) {
    //         console.log(fetcher);
    //     } else {
    //         console.log('fetcher.data is undefined');
    //     }
    // }, [fetcher]);
    React.useEffect(() => {
        // fetcher.submit(data, options);
        fetcher.load(action);
      }, [fetcher]);

    if(request_type !== undefined && action !== undefined) {
        return (
            <fetcher.Form method={request_type} action={action}>
                {body}
            </fetcher.Form>
        );
    } else if(request_type !== undefined && onSubmit !== undefined) {
        return (
            <fetcher.Form method={request_type} onSubmit={onSubmit}>
                {body}
            </fetcher.Form>
        );
    }
    return <></>;
}