import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import PropTypes from "prop-types";

import useCurrentUser from "../current-user/useCurrentUser";

import logger, {
    useScopedLogger,
} from "../../../logger";

import {
    ComponentLoading,
    ObjectEditor,
} from "../../ui";

import {
    getNestedValue,
    setNestedValue,
    buildFormStateFromSchema
} from "../../../utils";

/**
 * -----------------------------------------------------------------------------
 * Default Profile Field Configuration
 * -----------------------------------------------------------------------------
 *
 * Field schema drives:
 * - visibility
 * - readonly behavior
 * - labels
 * - future validation
 * - future formatting
 * - permissions
 *
 * -----------------------------------------------------------------------------
 */

export const DEFAULT_PROFILE_FIELDS = [
    /**
     * -------------------------------------------------------------------------
     * Core identity (top of form)
     * -------------------------------------------------------------------------
     */

    {
        key: "username",
        label: "Username",
        order: 1,
    },

    {
        key: "email",
        label: "Email",
        type: "email",
        order: 2,
    },

    /**
     * -------------------------------------------------------------------------
     * System identifiers
     * -------------------------------------------------------------------------
     */

    {
        key: "id",
        label: "User ID",
        readonly: true,
        order: 3,
    },

    /**
     * -------------------------------------------------------------------------
     * Permissions / roles (admin-only context)
     * -------------------------------------------------------------------------
     */

    {
        key: "userDetails.authorities",
        label: "Roles",
        readonly: true,
        adminOnly: true,
        order: 4,
    },

    /**
     * -------------------------------------------------------------------------
     * System metadata (hidden from UI)
     * -------------------------------------------------------------------------
     */

    {
        key: "createdAt",
        label: "Created",
        readonly: true,
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "updatedAt",
        label: "Last Updated",
        readonly: true,
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "password",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "token",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "permissions",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },
];

/**
 * -----------------------------------------------------------------------------
 * UserProfilePage
 * -----------------------------------------------------------------------------
 *
 * Generic editable user profile page.
 *
 * Responsibilities:
 * - hydrate editable user state
 * - render schema-driven form fields
 * - manage save/reset lifecycle
 * - support field visibility and permissions
 *
 * -----------------------------------------------------------------------------
 */
export default function UserProfilePage({
    onSave,
    fields = DEFAULT_PROFILE_FIELDS,
}) {

    const SCOPED_LOGGER =
        useScopedLogger(
            "UserProfilePage",
            logger
        );

    /**
     * -------------------------------------------------------------------------
     * Current User
     * -------------------------------------------------------------------------
     */
    const {
        user: currentUser,
        isLoading,
        refreshUser,
        isAdmin,
    } = useCurrentUser();

    /**
     * -------------------------------------------------------------------------
     * Editable User
     * -------------------------------------------------------------------------
     */
    const editableUser =
        currentUser?.user ||
        currentUser;

    /**
     * -------------------------------------------------------------------------
     * Form State
     * -------------------------------------------------------------------------
     */
    const [formState, setFormState] =
        useState(null);

    const [isSaving, setIsSaving] =
        useState(false);

    /**
     * -------------------------------------------------------------------------
     * Hydrate Form
     * -------------------------------------------------------------------------
     */
    useEffect(() => {

        if (!editableUser) {
            return;
        }

        SCOPED_LOGGER.debug(
            "Hydrating profile form",
            editableUser
        );

        setFormState(
            buildFormStateFromSchema(editableUser, resolvedFieldSchema)
        );

    }, [editableUser]);

    const resolvedFieldSchema = useMemo(() => {
        const schema = {};

        for (const field of fields) {
            /**
             * -------------------------------------------------------------
             * Hidden fields
             * -------------------------------------------------------------
             */
            if (field.hidden) {
                schema[field.key] = {
                    ...field,
                    visible: false,
                };

                continue;
            }

            /**
             * -------------------------------------------------------------
             * Admin-only fields
             * -------------------------------------------------------------
             */
            if (field.adminOnly && !isAdmin) {
                schema[field.key] = {
                    ...field,
                    visible: false,
                };

                continue;
            }

            /**
             * -------------------------------------------------------------
             * Dynamic visibility predicate
             * -------------------------------------------------------------
             */
            if (typeof field.visible === "function") {
                schema[field.key] = {
                    ...field,
                    visible: field.visible({
                        currentUser,
                        editableUser,
                        formState,
                        isAdmin,
                    }),
                };

                continue;
            }

            /**
             * -------------------------------------------------------------
             * Normal visible field
             * -------------------------------------------------------------
             */
            schema[field.key] = {
                ...field,
                visible:
                    field.visible !== false,
            };
        }

        SCOPED_LOGGER.debug("schema completed", schema);
        return schema;

    }, [
        fields,
        currentUser,
        editableUser,
        formState,
        isAdmin,
    ]);

    const normalizedFieldSchema = useMemo(() => {
        const schema = {};

        for (const field of fields) {
            schema[field.key] = field;
        }

        return schema;
    }, [fields]);

    /**
     * -------------------------------------------------------------------------
     * Save
     * -------------------------------------------------------------------------
     */
    const handleSave = async (
        e
    ) => {

        e.preventDefault();

        try {

            setIsSaving(true);

            SCOPED_LOGGER.debug(
                "Saving profile",
                formState
            );

            await onSave?.(
                formState
            );

            await refreshUser?.();

        } catch (err) {

            SCOPED_LOGGER.error(
                "Failed to save profile",
                err
            );

        } finally {

            setIsSaving(false);
        }
    };

    /**
     * -------------------------------------------------------------------------
     * Reset Form
     * -------------------------------------------------------------------------
     */

    const resetForm = () => {

        if (!editableUser) {
            return;
        }

        SCOPED_LOGGER.debug(
            "Resetting profile form"
        );

        setFormState(
            buildFormStateFromSchema(editableUser, resolvedFieldSchema)
        );
    };

    /**
     * -------------------------------------------------------------------------
     * Has Changes
     * -------------------------------------------------------------------------
     */

    const hasChanges =
        useMemo(() => {

            if (
                !editableUser ||
                !formState
            ) {
                return false;
            }

            return (
                JSON.stringify(
                    editableUser
                ) !==
                JSON.stringify(
                    formState
                )
            );

        }, [
            editableUser,
            formState,
        ]);

    /**
     * -------------------------------------------------------------------------
     * Loading
     * -------------------------------------------------------------------------
     */

    if (
        isLoading ||
        !formState
    ) {

        SCOPED_LOGGER.debug(
            "Profile loading"
        );

        return (
            <ComponentLoading />
        );
    }

    /**
     * -------------------------------------------------------------------------
     * Render
     * -------------------------------------------------------------------------
     */

    return (
        <div
            className="container"
            style={{
                maxWidth: "800px",
            }}
        >

            <h1 className="title is-3">
                Profile
            </h1>

            <form
                onSubmit={
                    handleSave
                }
            >

                <ObjectEditor
                    value={formState}
                    onChange={
                        setFormState
                    }
                    fieldSchema={resolvedFieldSchema}
                />

                <div
                    className="field is-grouped mt-5"
                >

                    <div className="control">

                        <button
                            type="submit"
                            className="button is-primary"
                            disabled={
                                !hasChanges ||
                                isSaving
                            }
                        >
                            {
                                isSaving
                                    ? "Saving..."
                                    : "Save Changes"
                            }
                        </button>

                    </div>

                    <div className="control">

                        <button
                            type="button"
                            className="button is-light"
                            disabled={
                                !hasChanges ||
                                isSaving
                            }
                            onClick={
                                resetForm
                            }
                        >
                            Reset
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}

UserProfilePage.propTypes = {

    /**
     * Persist updated profile state.
     */
    onSave: PropTypes.func,

    /**
     * Field schema configuration.
     */
    fields: PropTypes.arrayOf(
        PropTypes.shape({

            key:
                PropTypes.string
                    .isRequired,

            label:
                PropTypes.string,

            type:
                PropTypes.string,

            readonly:
                PropTypes.bool,

            hidden:
                PropTypes.bool,

            adminOnly:
                PropTypes.bool,

            visible:
                PropTypes.oneOfType([
                    PropTypes.bool,
                    PropTypes.func,
                ]),
        })
    ),
};