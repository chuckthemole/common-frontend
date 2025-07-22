import React, { useState } from 'react';

/**
 * Right now this is just a simple component that takes in json data and prints it pretty
 * TODO: make this component more robust, adding more json helper functions
 */
export default function Json({json_data}) {

    // create function for printing json data pretty
    function prettyPrintJson(json_data) {
        return JSON.stringify(json_data, null, 2);
    }
    
    return (
        <>
            <pre>{prettyPrintJson(json_data)}</pre>
        </>
    );
}