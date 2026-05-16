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
 *  - included fields (whitelist mode)
 *  - readonly support
 *  - schema-driven labels
 *  - schema-driven ordering
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
    includedFields = null,
    readonlyFields = [],
    maxDepth = 10,
    fieldSchema = {},
}) {

    /**
     * -------------------------------------------------------------------------
     * Helpers
     * -------------------------------------------------------------------------
     */

    const isPrimitive = (value) => {
        return (
            value == null ||
            ["string", "number", "boolean"].includes(typeof value)
        );
    };

    const setNestedValue = (obj, path, nextValue) => {
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
     * Field Visibility Logic
     * -------------------------------------------------------------------------
     */

    const isFieldVisible = (key, fieldPath) => {

        const flatKey = fieldPath.join(".");

        /**
         * Whitelist mode
         */
        if (includedFields && includedFields.length > 0) {
            return (
                includedFields.includes(key) ||
                includedFields.includes(flatKey)
            );
        }

        /**
         * Legacy exclusion mode
         */
        if (excludedFields.includes(key)) {
            return false;
        }

        return true;
    };

    /**
     * -------------------------------------------------------------------------
     * Schema-driven ordering (IMPORTANT FIX)
     * -------------------------------------------------------------------------
     *
     * Ensures:
     *  - fieldSchema order is respected
     *  - object-only keys still appear after schema fields
     */
    const getOrderedEntries = (node, path = []) => {

        const keys = Object.keys(node || {});

        const flatSchemaKeys = Object.keys(fieldSchema || {});

        const resolveOrderIndex = (key, fullPath) => {
            const flatKey = [...fullPath, key].join(".");

            const schemaEntry =
                fieldSchema?.[key] ||
                fieldSchema?.[flatKey];

            if (!schemaEntry) return Number.MAX_SAFE_INTEGER;

            return schemaEntry.order ?? Number.MAX_SAFE_INTEGER;
        };

        return keys
            .map((key) => ({
                key,
                value: node[key],
                order: resolveOrderIndex(key, path),
            }))
            .sort((a, b) => a.order - b.order)
            .map(({ key, value }) => [key, value]);
    };

    /**
     * -------------------------------------------------------------------------
     * Label Resolver (NEW)
     * -------------------------------------------------------------------------
     */

    const getLabel = (key, fieldPath) => {

        const flatKey = fieldPath.join(".");

        return (
            fieldSchema?.[key]?.label ||
            fieldSchema?.[flatKey]?.label ||
            key
        );
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

        if (depth > maxDepth || node == null) {
            return null;
        }

        return getOrderedEntries(node).map(([key, fieldValue]) => {

            const fieldPath = [...path, key];
            const fieldName = fieldPath.join(".");

            /**
             * Visibility check
             */
            if (!isFieldVisible(key, fieldPath)) {
                return null;
            }

            const isReadonly = readonlyFields.includes(fieldName);
            const label = getLabel(key, fieldPath);

            /**
             * Arrays
             */
            if (Array.isArray(fieldValue)) {
                return (
                    <div key={fieldName} className="box">
                        <h3 className="title is-6">{label}</h3>
                        <div className="content">
                            <pre>
                                {JSON.stringify(fieldValue, null, 2)}
                            </pre>
                        </div>
                    </div>
                );
            }

            /**
             * Nested object
             */
            if (fieldValue && typeof fieldValue === "object") {
                return (
                    <div key={fieldName} className="box">
                        <h3 className="title is-6">{label}</h3>
                        {renderNode(fieldValue, fieldPath, depth + 1)}
                    </div>
                );
            }

            /**
             * Boolean field
             */
            if (typeof fieldValue === "boolean") {
                return (
                    <div className="field" key={fieldName}>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={fieldValue}
                                disabled={isReadonly}
                                onChange={(e) => {
                                    const next = setNestedValue(
                                        value,
                                        fieldPath,
                                        e.target.checked
                                    );
                                    onChange?.(next);
                                }}
                            />

                            <span style={{ marginLeft: "0.5rem" }}>
                                {label}
                            </span>
                        </label>
                    </div>
                );
            }

            /**
             * Primitive input (string / number)
             */
            return (
                <div className="field" key={fieldName}>
                    <label className="label">
                        {label}
                    </label>

                    <div className="control">
                        <input
                            className="input"
                            type={
                                typeof fieldValue === "number"
                                    ? "number"
                                    : "text"
                            }
                            value={fieldValue ?? ""}
                            disabled={isReadonly}
                            onChange={(e) => {
                                const nextValue =
                                    typeof fieldValue === "number"
                                        ? Number(e.target.value)
                                        : e.target.value;

                                const next = setNestedValue(
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
        });
    };

    /**
     * -------------------------------------------------------------------------
     * Render
     * -------------------------------------------------------------------------
     */

    const content = useMemo(() => {
        return renderNode(value);
    }, [
        value,
        includedFields,
        excludedFields,
        readonlyFields,
        fieldSchema,
    ]);

    return <div>{content}</div>;
}

ObjectEditor.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,

    excludedFields: PropTypes.arrayOf(PropTypes.string),
    includedFields: PropTypes.arrayOf(PropTypes.string),

    readonlyFields: PropTypes.arrayOf(PropTypes.string),
    maxDepth: PropTypes.number,

    fieldSchema: PropTypes.object,
};