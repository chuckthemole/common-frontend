const React = require('react');
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * TODO: this needs to be built out more. Maybe an abstract Form object instead of this at all?
 * @param {*} param0 
 * @returns 
 */
export default function RumpusQuillForm({quill}) {

    // return a form using the rumpus quill component
    return (
        <form>
            <div className='field'>
                <label className='label'>Title</label>
                <div className='control'>
                    <input className='input' type='text' placeholder='Title' />
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