import React, { useEffect, useState } from 'react';
const ReactDOM = require('react-dom/client');
import useSWR from 'swr';
import { common_fetcher } from './common_requests';

/**
 * This component is responsible for displaying the log page, given a log identifier.
 * 
 * @param {*} param0
 * @returns logs in a table view
 */
export default function Log({log_identifier}) {

    const [logs, setLogs] = useState([]);
    const {data, error} = useSWR(
        '/api/logs/' + log_identifier,
        common_fetcher
    );

    useEffect(() => {
        if(data !== undefined && data !== null && data !== '') {
            console.log(data);
            setLogs(data);
        }
    }, [data]);

    if (error) {
        console.log(error);
        return(
            <div className='columns is-centered has-text-centered'>
                <div className='column is-half notification is-warning'>
                    <p>An error occurred getting the log with identifier: {log_identifier}</p>
                </div>
            </div>
        )
    }

    if (!data || !logs) return(
        <div className='container m-6'>
            <progress className="progress is-small is-primary" max="100">15%</progress>
            <progress className="progress is-danger" max="100">30%</progress>
            <progress className="progress is-medium is-dark" max="100">45%</progress>
            <progress className="progress is-large is-info" max="100">60%</progress>
        </div>
    )

    return (
        <>
            {/* TODO: work on search filter <div className='m-6'>
                <Dropdown className='columns' title={'Search filter'} dropdown_items={search_filter} />
                <div className='columns'><input className="column is-one-third input" type="text" placeholder={get_selected()}></input></div>
            </div> */}

            <div className='table-container'>
                <table className="table is-hoverable is-fullwidth is-bordered m-6">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <abbr title="User Name">User</abbr>
                            </th>
                            <th>
                                <abbr title="User Name">ID</abbr>
                            </th>
                            <th>
                                <abbr title="Password">Action</abbr>
                                </th>
                            <th>
                                <abbr title="User Authorizations">Time</abbr>
                            </th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>#</th>
                            <th>
                                <abbr title="User Name">User</abbr>
                            </th>
                            <th>
                                <abbr title="User Name">ID</abbr>
                            </th>
                            <th>
                                <abbr title="Password">Action</abbr>
                                </th>
                            <th>
                                <abbr title="User Authorizations">Time</abbr>
                            </th>
                        </tr>
                    </tfoot>
                    <tbody>
                        {logs.map(( log, index ) => (
                            <tr key={index}>
                                <th>{index + 1}</th>
                                <td>{log.username}</td>
                                <td>{log.userId}</td>
                                <td>{log.action}</td>
                                <td>{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}