import * as React from 'react';
import { useRouteError } from "react-router-dom";

export class ErrorType {
    static DEFAULT = new ErrorType('DEFAULT', 'Something went wrong!');
    static NOT_FOUND = new ErrorType('NOT_FOUND', 'Page not found.');
    static UNAUTHORIZED = new ErrorType('UNAUTHORIZED', 'Unauthorized.');
    static FORBIDDEN = new ErrorType('FORBIDDEN', 'Forbidden.');
    static BAD_REQUEST = new ErrorType('BAD_REQUEST', 'Bad request.');
    static SERVER_ERROR = new ErrorType('SERVER_ERROR', 'Server error.');
    static SERVICE_UNAVAILABLE = new ErrorType('SERVICE_UNAVAILABLE', 'Service unavailable.');
    static GATEWAY_TIMEOUT = new ErrorType('GATEWAY_TIMEOUT', 'Gateway timeout.');
    static UNKNOWN = new ErrorType('UNKNOWN', 'Unknown error.');

    constructor(statusText, message) {
        this.statusText = statusText;
        this.message = message;
    }

    toString() {
        return `ErrorType.${this.statusText}: ${this.message}`;
    }
}

/**
 * TODO: this should not be in Error. Maybe make an SWR helper component?
 * Function to render a component from SWR data
 * 
 * @param {*} data The data from SWR
 * @param {*} error The error from SWR
 * @param {*} render_content The content to render
 * @param {*} error_message The error message to display if there is an error or no data
 * @returns the content to render or an error message or a loading bar
 */
export function RenderFromSWR(data, error, render_content, error_message) {
    if (error) {
        console.log(error);
        return(
            <div className='columns is-centered has-text-centered'>
                <div className='column is-half notification is-warning'>
                    <p>{error_message}</p>
                </div>
            </div>
        )
    }
    if (!data) {
        return(
            <div className='container m-6'>
                <progress className="progress is-small is-primary" max="100">15%</progress>
                <progress className="progress is-danger" max="100">30%</progress>
                <progress className="progress is-medium is-dark" max="100">45%</progress>
                <progress className="progress is-large is-info" max="100">60%</progress>
            </div>
        )
    }
    return render_content;
}

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id='error_page' className="is-flex is-justify-content-center is-align-items-center">
            <div className="has-text-centered">
                <h1 className="is-size-1 has-text-weight-bold has-text-primary">Error finding user</h1>
                <p className="is-size-5 has-text-weight-medium"> <span className="has-text-danger">Opps!</span> Page not found.</p>
                <p className="is-size-6 mb-2">
                    The page you’re looking for doesn’t exist.
                </p>
                {/* <p>
                    <i>{error.statusText || error.message}</i>
                </p> */}
                <a href="/" className="button is-primary">Go Home</a>
            </div>
        </div>
    );
}