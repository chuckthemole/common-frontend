const React = require('react');
import { common_loader } from './common_requests';

/**
 * Loader for footer
 * 
 * @param {*} path path to GET footer
 * @returns 
 */
export function loader(path) {
    return common_loader(path);
}

/**
 * 
 * @param {string} footer_path
 * 
 * @returns {React.JSX.Element}
 */
export default function Footer({footer_path}) {

    const footer_loader = loader(footer_path);

    if (footer_loader.error) {
        return error_render();
    }

    if (!footer_loader.data) {
        return loading_render();
    }
   
    return (
        <div className='columns is-centered has-text-centered'>
            <div className='column is-half'>
                <div className="columns is-centered">
                    {footer_loader.data.columns.map(({items, title}) => (
                        <div className="column" key={title}>
                            <div>{title}</div>
                            {items.map(item => 
                                <div key={item}>
                                    <span>{item}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// return an error render
function error_render() {
    return(
        <div className='columns is-centered has-text-centered'>
            <div className='column is-half notification is-warning'>
                <p>An error occurred with footer</p>
            </div>
        </div>
    )
}

// return a loading render
function loading_render() {
    return(
        <div className='container m-6'>
            <progress className="progress is-small is-primary" max="100">15%</progress>
            <progress className="progress is-danger" max="100">30%</progress>
            <progress className="progress is-medium is-dark" max="100">45%</progress>
            <progress className="progress is-large is-info" max="100">60%</progress>
        </div>
    )
}