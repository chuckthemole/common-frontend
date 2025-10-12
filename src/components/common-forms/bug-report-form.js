import React, { useState, useRef } from "react";
import { getApi } from "../../api";
import logger from "../../logger";
import RumpusQuill from "../ui/editors/rumpus_quill";
import RumpusQuillForm from "../ui/editors/rumpus_quill_form";
import { useNotionUsers } from "../hooks/notion/use_notion_users";
import ComponentLoading from "../ui/loaders/component_loading";
import notionUserFilters from "../../config/notion_user_filters.json";

logger.groupCollapsed("BugReportForm import check");
logger.debug("RumpusQuill:", RumpusQuill);
logger.debug("RumpusQuillForm:", RumpusQuillForm);
logger.debug("ComponentLoading:", ComponentLoading);
logger.debug("useNotionUsers:", useNotionUsers);
logger.debug("notionUserFilters:", notionUserFilters);
logger.groupEnd();

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

    /**
     * Fetch users from Notion and apply an optional filter.
     * In production, this should be wrapped in try/catch because 
     * a failed hook fetch could leave users undefined.
     */
    let filteredUsers = [];
    let usersLoading = false;
    let usersError = null;

    try {
        const result = useNotionUsers("consoleIntegration", {
            filterFn: (user) =>
                user.name &&
                !notionUserFilters.excludeNames.includes(user.name),
        });

        filteredUsers = result.filteredUsers ?? [];
        usersLoading = result.loading;
        usersError = result.error;
    } catch (hookError) {
        logger.error("[BugReportForm] Failed to initialize useNotionUsers hook:", hookError);
        usersError = hookError.message;
        filteredUsers = [];
    }

    // Build default state from provided extra fields
    const extraState = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || "";
        return acc;
    }, {});
    const [extraFields, setExtraFields] = useState(extraState);

    const editorRef = useRef(null);

    /** Handle any extra field updates dynamically */
    const handleChangeExtra = (name, value) => {
        setExtraFields((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Build a Notion-compatible payload from the current form values.
     * Logs detailed info about each transformation step.
     */
    const buildNotionPayload = () => {
        try {
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
                        properties[notionKey] = {
                            multi_select: value.map((v) => ({ name: v })),
                        };
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

            logger.debug("[BugReportForm] Payload built successfully:", properties);
            return { properties };
        } catch (err) {
            logger.error("[BugReportForm] Failed to build payload:", err);
            throw err;
        }
    };

    /**
     * Handle form submission — posts data to the provided endpoint.
     * Includes defensive logging and error handling for production use.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        logger.info("[BugReportForm] Submitting bug report...");

        try {
            const api = getApi();
            const payload = buildNotionPayload();

            logger.debug("[BugReportForm] Final Notion payload:", JSON.stringify(payload, null, 2));

            const res = await api.post(endpoint, payload);
            logger.info("[BugReportForm] Submission successful:", res.data);

            // Reset form
            setTitle("");
            setBody("");
            setExtraFields(extraState);
            if (editorRef.current?.getEditor) {
                editorRef.current.getEditor().setContents("");
            }

            if (onSuccess) onSuccess(res.data);
        } catch (err) {
            logger.error("[BugReportForm] Submission failed:", err);
            if (err.response) {
                logger.debug("[BugReportForm] API error response:", {
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
                {/* Title Field */}
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

                {/* Body Field */}
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

                {/* Dynamically Render Extra Fields */}
                {fields.map((field) => {
                    const value = extraFields[field.name];
                    const handleChange = (e) => handleChangeExtra(field.name, e.target.value);

                    try {
                        // Handle Notion "people" type (Assigned To)
                        if (field.notionType === "people") {
                            return (
                                <div className="field" key={field.name}>
                                    <label className="label">{field.label}</label>
                                    <div className="control">
                                        {usersLoading ? (
                                            <ComponentLoading type="single-progress" />
                                        ) : usersError ? (
                                            <p className="help is-danger">
                                                Failed to load users: {usersError}
                                            </p>
                                        ) : (
                                            <div className="select is-fullwidth">
                                                <select value={value} onChange={handleChange}>
                                                    <option value="">Select a user...</option>
                                                    {(filteredUsers || []).map((user) => (
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

                        // Standard select field
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

                        // Multi-select
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
                                                        Array.from(
                                                            e.target.selectedOptions,
                                                            (opt) => opt.value
                                                        )
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

                        // Default text/number/date/etc.
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
                    } catch (renderErr) {
                        logger.error(
                            `[BugReportForm] Failed to render field "${field.name}":`,
                            renderErr
                        );
                        return null;
                    }
                })}

                {/* Submit Button */}
                <div className="field">
                    <div className="control">
                        <button className="button is-link" type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                {/* Inline Error Display */}
                {error && <p className="help is-danger">{error}</p>}
            </form>
        </RumpusQuillForm>
    );
}
