import React, { useState, useRef } from "react";
import { getApi } from "../../api";
import logger from "../../logger";
import { RumpusQuill, RumpusQuillForm } from "../ui";
import { useNotionUsers } from "../hooks/notion/use_notion_users";

/**
 * BugReportForm
 * Creates a Notion-compatible bug report payload and posts it to the given endpoint.
 *
 * Expected Notion-style payload:
 * {
 *   "properties": {
 *     "Title": { "title": [{ "text": { "content": "<title>" } }] },
 *     "Short Description": { "rich_text": [{ "text": { "content": "<body>" } }] },
 *     "Priority": { "select": { "name": "High" } },
 *     "State": { "select": { "name": "In Progress" } },
 *     "Start Date": { "date": { "start": "2025-10-07" } },
 *     "Due Date": { "date": { "start": "2025-10-10" } },
 *     "Assigned To": { "people": [{ "id": "<uuid>" }] },
 *     "Actual Effort (Hrs)": { "number": 2 },
 *     "Estimated Effort (Hrs)": { "number": 3 }
 *   }
 * }
 */
export default function BugReportForm({
    endpoint,
    onSuccess,
    titlePlaceholder = "Title",
    bodyPlaceholder = "Describe the bug...",
    fields = [],
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { users, loading: usersLoading, error: usersError } = useNotionUsers('consoleIntegration');


    const extraState = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || "";
        return acc;
    }, {});
    const [extraFields, setExtraFields] = useState(extraState);

    const editorRef = useRef(null);

    const handleChangeExtra = (name, value) => {
        setExtraFields((prev) => ({ ...prev, [name]: value }));
    };

    const buildNotionPayload = () => {
        const properties = {
            Title: {
                title: [{ text: { content: title } }],
            },
            "Short Description": {
                rich_text: [{ text: { content: body } }],
            },
        };

        for (const [key, value] of Object.entries(extraFields)) {
            const fieldDef = fields.find((f) => f.name === key);
            if (!value) continue;

            const notionKey = fieldDef?.notionName || key;

            switch (fieldDef?.notionType) {
                case "select":
                    properties[notionKey] = { select: { name: value } };
                    break;
                case "multi_select":
                    properties[notionKey] = { multi_select: value.map((v) => ({ name: v })) };
                    break;
                case "date":
                    properties[notionKey] = { date: { start: value } };
                    break;
                case "number":
                    properties[notionKey] = { number: Number(value) };
                    break;
                case "people":
                    properties[notionKey] = { people: [{ id: value }] };
                    break;
                default:
                    properties[notionKey] = {
                        rich_text: [{ text: { content: value.toString() } }],
                    };
            }
        }

        return { properties };
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const api = getApi();
            const payload = buildNotionPayload();

            logger.debug("Submitting bug report payload:", payload);
            logger.debug("Final Notion payload:", JSON.stringify(payload, null, 2));
            const res = await api.post(endpoint, payload);
            logger.debug("Form submitted successfully", res.data);

            // Reset form
            setTitle("");
            setBody("");
            setExtraFields(extraState);
            if (editorRef.current) editorRef.current.getEditor().setContents("");

            if (onSuccess) onSuccess(res.data);
        } catch (err) {
            logger.error("Failed to submit form:", err.message);
            if (err.response) {
                logger.debug("API error response:", {
                    status: err.response.status,
                    data: err.response.data,
                });
            }
            setError("Failed to submit form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <RumpusQuillForm>
            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="field">
                    <label className="label">{titlePlaceholder}</label>
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            placeholder={titlePlaceholder}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="field">
                    <label className="label">Body</label>
                    <div className="control">
                        <RumpusQuill
                            value={body}
                            setValue={setBody}
                            editor_ref={editorRef}
                            placeholder={bodyPlaceholder}
                        />
                    </div>
                </div>

                {/* Extra Fields */}
                {fields.map((field) => {
                    const value = extraFields[field.name];
                    const handleChange = (e) => handleChangeExtra(field.name, e.target.value);

                    // Handle Notion "people" type (Assigned To field)
                    if (field.notionType === "people") {
                        return (
                            <div className="field" key={field.name}>
                                <label className="label">{field.label}</label>
                                <div className="control">
                                    {usersLoading ? (
                                        <p>Loading users...</p>
                                    ) : usersError ? (
                                        <p className="help is-danger">Failed to load users.</p>
                                    ) : (
                                        <div className="select is-fullwidth">
                                            <select value={value} onChange={handleChange}>
                                                <option value="">Select a user...</option>
                                                {users.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Handle standard select fields (priority, state, etc.)
                    if (field.type === "select" && Array.isArray(field.options)) {
                        return (
                            <div className="field" key={field.name}>
                                <label className="label">{field.label}</label>
                                <div className="control">
                                    <div className="select is-fullwidth">
                                        <select value={value} onChange={handleChange}>
                                            <option value="">Select...</option>
                                            {field.options.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Handle multi-select fields
                    if (field.notionType === "multi_select" && Array.isArray(field.options)) {
                        return (
                            <div className="field" key={field.name}>
                                <label className="label">{field.label}</label>
                                <div className="control">
                                    <div className="select is-multiple is-fullwidth">
                                        <select
                                            multiple
                                            value={value}
                                            onChange={(e) =>
                                                handleChangeExtra(
                                                    field.name,
                                                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                                                )
                                            }
                                        >
                                            {field.options.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Default: simple text/number/date/etc.
                    return (
                        <div className="field" key={field.name}>
                            <label className="label">{field.label}</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type={field.type || "text"}
                                    placeholder={field.placeholder || ""}
                                    value={value}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    );
                })}


                {/* Submit */}
                <div className="field">
                    <div className="control">
                        <button className="button is-link" type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                {error && <p className="help is-danger">{error}</p>}
            </form>
        </RumpusQuillForm>
    );
}
