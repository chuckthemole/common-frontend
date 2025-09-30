const React = require('react');
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * A wrapper around ReactQuill that provides default values for modules, formats, and placeholder.
 * 
 * @param {Object} modules - The modules to pass to ReactQuill. Defaults to a toolbar with basic formatting options.
 * @param {Array} formats - The formats to pass to ReactQuill. Defaults to basic formatting options.
 * @param {String} placeholder - The placeholder to pass to ReactQuill. Defaults to 'Compose an epic...'.
 * @param {String} value - The value to pass to ReactQuill. Defaults to ''.
 * @param {Function} setValue - The setValue function to pass to ReactQuill. Defaults to a function that does nothing.
 * @param {Object} editor_ref - The editor_ref to pass to ReactQuill. Defaults to null.
 * @returns {ReactElement} A ReactElement that wraps ReactQuill.
 * 
 * To clear the editor, call editor_ref.current.getEditor().setContents('').
 */
export default function RumpusQuill({modules, formats, placeholder, value, setValue, editor_ref}) {

    const default_placeholder = 'Compose an epic...';

    const default_modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
        ],
    };
    
    const default_formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    let quill = React.createElement(

        // type
        'div',

        // props
        {
            style: {
                background: "white"
            }
        },

        // children
        <ReactQuill
            theme='snow'
            value={value}
            onChange={setValue}
            ref={editor_ref}
            placeholder={placeholder !== undefined ? placeholder : default_placeholder}
            modules={modules !== undefined ? modules : default_modules}
            formats={formats !== undefined ? formats : default_formats}
        />
    );

    return (<>{quill}</>);
}