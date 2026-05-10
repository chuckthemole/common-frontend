import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * -----------------------------------------------------------------------------
 * ObjectEditor
 * -----------------------------------------------------------------------------
 *
 * Generic recursive object editor.
 *
 * Features:
 *  - recursive nested object editing
 *  - controlled form state
 *  - deep updates
 *  - primitive-only rendering
 *  - field exclusion
 *  - readonly support
 *  - nested path labels
 *  - reusable across dashboards/admin/settings
 *
 * -----------------------------------------------------------------------------
 */

const DEFAULT_EXCLUDED_FIELDS = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "createdAt",
    "updatedAt",
    "__typename",
];

export default function ObjectEditor({
    value = {},
    onChange,
    excludedFields = DEFAULT_EXCLUDED_FIELDS,
    readonlyFields = [],
    maxDepth = 10,
}) {

    /**
     * -------------------------------------------------------------------------
     * Helpers
     * -------------------------------------------------------------------------
     */

    const isPrimitive = (value) => {
        return (
            value == null ||
            ["string", "number", "boolean"]
                .includes(typeof value)
        );
    };

    const isEditablePrimitive = (value) => {
        return (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        );
    };

    const setNestedValue = (
        obj,
        path,
        nextValue
    ) => {
        const clone = structuredClone(obj);

        let current = clone;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }

        current[path[path.length - 1]] = nextValue;

        return clone;
    };

    /**
     * -------------------------------------------------------------------------
     * Recursive Renderer
     * -------------------------------------------------------------------------
     */

    const renderNode = (
        node,
        path = [],
        depth = 0
    ) => {

        if (
            depth > maxDepth ||
            node == null
        ) {
            return null;
        }

        return Object.entries(node).map(
            ([key, fieldValue]) => {

                /**
                 * Excluded field
                 */
                if (
                    excludedFields.includes(key)
                ) {
                    return null;
                }

                const fieldPath = [
                    ...path,
                    key,
                ];

                const fieldName =
                    fieldPath.join(".");

                const isReadonly =
                    readonlyFields.includes(
                        fieldName
                    );

                /**
                 * Arrays
                 */
                if (
                    Array.isArray(fieldValue)
                ) {
                    return (
                        <div
                            key={fieldName}
                            className="box"
                        >
                            <h3 className="title is-6">
                                {key}
                            </h3>

                            <div className="content">
                                <pre>
                                    {JSON.stringify(
                                        fieldValue,
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </div>
                    );
                }

                /**
                 * Nested object
                 */
                if (
                    fieldValue &&
                    typeof fieldValue ===
                    "object"
                ) {
                    return (
                        <div
                            key={fieldName}
                            className="box"
                        >
                            <h3 className="title is-6">
                                {key}
                            </h3>

                            {renderNode(
                                fieldValue,
                                fieldPath,
                                depth + 1
                            )}
                        </div>
                    );
                }

                /**
                 * Skip unsupported primitives
                 */
                if (
                    !isPrimitive(fieldValue)
                ) {
                    return null;
                }

                /**
                 * Boolean field
                 */
                if (
                    typeof fieldValue ===
                    "boolean"
                ) {
                    return (
                        <div
                            className="field"
                            key={fieldName}
                        >
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={
                                        fieldValue
                                    }
                                    disabled={
                                        isReadonly
                                    }
                                    onChange={(e) => {
                                        const next =
                                            setNestedValue(
                                                value,
                                                fieldPath,
                                                e.target.checked
                                            );

                                        onChange?.(
                                            next
                                        );
                                    }}
                                />

                                <span
                                    style={{
                                        marginLeft:
                                            "0.5rem",
                                    }}
                                >
                                    {fieldName}
                                </span>
                            </label>
                        </div>
                    );
                }

                /**
                 * Primitive input
                 */
                return (
                    <div
                        className="field"
                        key={fieldName}
                    >
                        <label className="label">
                            {fieldName}
                        </label>

                        <div className="control">
                            <input
                                className="input"
                                type={
                                    typeof fieldValue ===
                                        "number"
                                        ? "number"
                                        : "text"
                                }
                                value={
                                    fieldValue ?? ""
                                }
                                disabled={
                                    isReadonly
                                }
                                onChange={(e) => {

                                    const nextValue =
                                        typeof fieldValue ===
                                            "number"
                                            ? Number(
                                                e.target.value
                                            )
                                            : e.target.value;

                                    const next =
                                        setNestedValue(
                                            value,
                                            fieldPath,
                                            nextValue
                                        );

                                    onChange?.(next);
                                }}
                            />
                        </div>
                    </div>
                );
            }
        );
    };

    /**
     * -------------------------------------------------------------------------
     * Render
     * -------------------------------------------------------------------------
     */

    const content = useMemo(() => {
        return renderNode(value);
    }, [value]);

    return (
        <div>
            {content}
        </div>
    );
}

ObjectEditor.propTypes = {
    value: PropTypes.object,

    onChange: PropTypes.func,

    excludedFields: PropTypes.arrayOf(
        PropTypes.string
    ),

    readonlyFields: PropTypes.arrayOf(
        PropTypes.string
    ),

    maxDepth: PropTypes.number,
};