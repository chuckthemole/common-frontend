import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * -----------------------------------------------------------------------------
 * ObjectEditor (Schema-driven version)
 * -----------------------------------------------------------------------------
 *
 * Generic recursive object editor.
 *
 * DESIGN GOAL:
 *  - fieldSchema is the single source of truth
 *  - no competing include/exclude/readonly systems
 *  - deterministic rendering rules
 *
 * -----------------------------------------------------------------------------
 *
 * Example fieldSchema:
 *
 * const fieldSchema = {
 *   "email": {
 *     label: "Email Address",
 *     order: 1,
 *     visible: true,
 *     readonly: false
 *   },
 *   "profile.bio": {
 *     label: "Bio",
 *     order: 2,
 *     visible: true,
 *     readonly: true
 *   }
 * };
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
    fieldSchema = {},
    maxDepth = 10,
}) {
    /**
     * -------------------------------------------------------------------------
     * DEV SAFETY: prevent mixed configuration modes
     * -------------------------------------------------------------------------
     */

    if (process.env.NODE_ENV !== "production") {
        // These used to exist — we now explicitly forbid them
        const legacyPropsUsed =
            "excludedFields" in arguments[0] ||
            "includedFields" in arguments[0] ||
            "readonlyFields" in arguments[0];

        if (legacyPropsUsed) {
            throw new Error(
                "ObjectEditor: includedFields, excludedFields, and readonlyFields " +
                "are deprecated. Use fieldSchema exclusively."
            );
        }
    }

    /**
     * -------------------------------------------------------------------------
     * Helpers
     * -------------------------------------------------------------------------
     */

    const isObject = (val) =>
        val !== null && typeof val === "object" && !Array.isArray(val);

    const isPrimitive = (val) =>
        val == null || ["string", "number", "boolean"].includes(typeof val);

    /**
     * Safe deep clone update
     */
    const setNestedValue = (obj, path, nextValue) => {
        const clone = structuredClone(obj ?? {});

        let current = clone;

        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];

            if (!(key in current) || !isObject(current[key])) {
                current[key] = {};
            }

            current = current[key];
        }

        current[path[path.length - 1]] = nextValue;

        return clone;
    };

    /**
     * -------------------------------------------------------------------------
     * Schema resolution (CORE OF NEW DESIGN)
     * -------------------------------------------------------------------------
     */

    const getFieldConfig = (fieldPath) => {
        const flatKey = fieldPath.join(".");

        return (
            fieldSchema?.[flatKey] ||
            fieldSchema?.[fieldPath[fieldPath.length - 1]] ||
            {}
        );
    };

    const isVisible = (config) => config.visible !== false;
    const isReadonly = (config) => config.readonly === true;

    const getLabel = (key, fieldPath, config) =>
        config.label ?? key;

    /**
     * -------------------------------------------------------------------------
     * Ordering
     * -------------------------------------------------------------------------
     */

    const getOrderedEntries = (node, path = []) => {
        const entries = Object.entries(node || {});

        return entries.sort(([keyA], [keyB]) => {
            const a = getFieldConfig([...path, keyA]).order ?? Number.MAX_SAFE_INTEGER;
            const b = getFieldConfig([...path, keyB]).order ?? Number.MAX_SAFE_INTEGER;
            return a - b;
        });
    };

    /**
     * -------------------------------------------------------------------------
     * Recursive renderer
     * -------------------------------------------------------------------------
     */

    const renderNode = (node, path = [], depth = 0) => {
        if (depth > maxDepth || node == null || !isObject(node)) {
            return null;
        }

        return getOrderedEntries(node, path).map(([key, fieldValue]) => {
            const fieldPath = [...path, key];
            const fieldName = fieldPath.join(".");

            const config = getFieldConfig(fieldPath);

            if (!isVisible(config)) {
                return null;
            }

            const readonly = isReadonly(config);
            const label = getLabel(key, fieldPath, config);

            /**
             * -----------------------------------------------------------------
             * Arrays (simple JSON view for now)
             * -----------------------------------------------------------------
             */
            if (Array.isArray(fieldValue)) {
                return (
                    <div key={fieldName} className="box">
                        <h3 className="title is-6">{label}</h3>
                        <pre>{JSON.stringify(fieldValue, null, 2)}</pre>
                    </div>
                );
            }

            /**
             * -----------------------------------------------------------------
             * Nested object
             * -----------------------------------------------------------------
             */
            if (isObject(fieldValue)) {

                const shouldRenderContainer = config.renderContainer === true;
                if (!shouldRenderContainer) {
                    return (
                        <React.Fragment key={fieldName}>
                            {renderNode(
                                fieldValue,
                                fieldPath,
                                depth + 1
                            )}
                        </React.Fragment>
                    );
                }

                return (
                    <div key={fieldName} className="box">
                        <h3 className="title is-6">
                            {label}
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
             * -----------------------------------------------------------------
             * Boolean field
             * -----------------------------------------------------------------
             */
            if (typeof fieldValue === "boolean") {
                return (
                    <div className="field" key={fieldName}>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={fieldValue}
                                disabled={readonly}
                                onChange={(e) => {
                                    const next = setNestedValue(
                                        fieldValue,
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
             * -----------------------------------------------------------------
             * Primitive field (string / number)
             * -----------------------------------------------------------------
             */
            return (
                <div className="field" key={fieldName}>
                    <label className="label">{label}</label>

                    <div className="control">
                        <input
                            className="input"
                            type={typeof fieldValue === "number" ? "number" : "text"}
                            value={fieldValue ?? ""}
                            disabled={readonly}
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

    const content = useMemo(() => renderNode(value), [value, fieldSchema]);

    return <div>{content}</div>;
}

ObjectEditor.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    fieldSchema: PropTypes.object,
    maxDepth: PropTypes.number,
};