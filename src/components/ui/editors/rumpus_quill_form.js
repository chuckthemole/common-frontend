const React = require('react');
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * RumpusQuillForm
 * 
 * A wrapper around a ReactQuill editor that renders a form.
 * 
 * Props:
 * - quill: the ReactQuill component or wrapper to render.
 * - children: optional, if provided will replace the default form.
 * - titlePlaceholder: optional, default 'Title' (for backward compatibility).
 */
export default function RumpusQuillForm({
    quill,
    children,
    titlePlaceholder = 'Title'
}) {
    // If children are provided, render them instead of the default form
    if (children) return <div className="rumpus-quill-form">{children}</div>;

    // Default form (for backward compatibility)
    return (
        <form className="rumpus-quill-form">
            <div className='field'>
                <label className='label'>{titlePlaceholder}</label>
                <div className='control'>
                    <input className='input' type='text' placeholder={titlePlaceholder} />
                </div>
            </div>
            <div className='field'>
                <label className='label'>Body</label>
                <div className='control'>
                    {quill}
                </div>
            </div>
            <div className='field'>
                <div className='control'>
                    <button className='button is-link'>Submit</button>
                </div>
            </div>
        </form>
    );
}
