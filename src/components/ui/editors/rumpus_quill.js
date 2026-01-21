import React, { useRef, forwardRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/**
 * A wrapper around ReactQuill that provides default values for modules, formats, and placeholder.
 */
const RumpusQuill = forwardRef(function RumpusQuill(
    {
        modules,
        formats,
        placeholder,
        readOnly = false,
        value,
        setValue,
    },
    ref
) {
    // Use the forwarded ref if provided, otherwise create an internal ref
    const internalRef = useRef(null);
    const quillRef = ref || internalRef;

    const defaultPlaceholder = "Compose an epic...";

    const defaultModules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
        ],
    };

    const defaultFormats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
    ];

    return (
        <div style={{ background: "white" }}>
            <ReactQuill
                theme="snow"
                ref={quillRef}
                value={value}
                onChange={setValue}
                readOnly={readOnly}
                placeholder={placeholder ?? defaultPlaceholder}
                modules={modules ?? defaultModules}
                formats={formats ?? defaultFormats}
            />
        </div>
    );
});

export default RumpusQuill;
