import React, { useState } from "react";
import logger from "../../../logger";
import { JsonEditor as Editor } from "json-edit-react";

/**
 * JsonEditor component
 *
 * Props:
 * - initialData: object - initial JSON data to render
 * - onSave: function - callback triggered when the "Save Changes" button is clicked
 */
export default function JsonEditor({
    initialData = {},
    onSave,
    title = 'JSON Editor'
}) {
    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);

    // Handle JSON changes
    const handleChange = (updatedData) => {
        try {
            if (typeof updatedData !== "object" || updatedData === null) {
                throw new Error("Invalid JSON data provided");
            }
            setData(updatedData);
            setError(null);
            logger.debug("JsonEditor: Data updated", updatedData);
        } catch (err) {
            logger.error("JsonEditor: Error updating data", err);
            setError(err.message);
        }
    };

    // Handle save button click
    const handleSave = () => {
        try {
            logger.debug("JsonEditor: Saving JSON", data);
            if (onSave) onSave(data);
        } catch (err) {
            logger.error("JsonEditor: Error on save", err);
            setError(err.message);
        }
    };

    return (
        <div className="box has-background-dark has-text-white p-5">
            <h2 className="title is-4 has-text-white">{title}</h2>

            {error && (
                <div className="notification is-danger is-light">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <Editor
                data={data}
                onChange={handleChange}
                editable={true}
                style={{ minHeight: "300px", backgroundColor: "#ffffffff" }}
            />

            <button
                onClick={handleSave}
                className="button is-link is-medium mt-4"
            >
                Save Changes
            </button>
        </div>
    );
}
