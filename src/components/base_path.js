import React, { useState, useEffect } from 'react';

import { getPathsFromBasePath, getCurrentBasePath } from './common_requests';

export const BASE_PATH = 'BASE_PATH';
export const BASE_PATH_CHILD_LIST = 'BASE_PATH_CHILD_LIST';

/**
 * Get the current base path and the list of paths accociated with the current base path
 * 
 * @returns the current base path and the list of paths accociated with the current base path
 */
export default function BasePath() {

    const current_base_path = getCurrentBasePath(); // the current base path
    const [base_path, setBasePath] = useState('/'); // the current base path as a state, default is '/'
    const base_path_child_list = getPathsFromBasePath(base_path); // this list of paths accociated with the current base path

    useEffect(() => { // set the base path when the current_base_path hook changes
        if(current_base_path.current_base_path !== undefined && current_base_path.current_base_path.path !== undefined) {
            setBasePath(current_base_path.current_base_path.path);
        }
    }, [current_base_path]);

    if(base_path_child_list !== undefined) {
        return ({BASE_PATH: base_path, BASE_PATH_CHILD_LIST: base_path_child_list});
    } else {
        return ({BASE_PATH: undefined, BASE_PATH_CHILD_LIST: undefined});
    }
}