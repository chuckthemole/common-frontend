import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import PropTypes from "prop-types";

import useCurrentUser from "../current-user/useCurrentUser";
import { useUser } from "../useUser";

import logger, {
    useScopedLogger,
} from "../../../logger";

import {
    ComponentLoading,
    ObjectEditor,
} from "../../ui";

import {
    buildFormStateFromSchema,
} from "../../../utils";

import {
    DEFAULT_PROFILE_FIELDS,
} from "../schemas";

/**
 * -----------------------------------------------------------------------------
 * UserProfileEditor
 * -----------------------------------------------------------------------------
 *
 * Generic schema-driven user profile viewer/editor.
 *
 * Features:
 *  - current user OR arbitrary user
 *  - readonly mode
 *  - admin-aware field visibility
 *  - schema-driven rendering
 *  - reset/save lifecycle
 *
 * -----------------------------------------------------------------------------
 */

export default function UserProfileEditor({
    user: providedUser = null,
    userId = null,
    readonly = false,
    title = "Profile",
    fields = DEFAULT_PROFILE_FIELDS,
    onSave,
}) {

    const SCOPED_LOGGER =
        useScopedLogger(
            "UserProfileEditor",
            logger
        );

    /**
     * -------------------------------------------------------------------------
     * Current User Context
     * -------------------------------------------------------------------------
     */

    const {
        user: currentUser,
        isLoading: currentUserLoading,
        refreshUser,
        isAdmin,
    } = useCurrentUser();

    /**
     * -------------------------------------------------------------------------
     * User Hook
     * -------------------------------------------------------------------------
     */
    const shouldFetchExternalUser = Boolean(userId) && !providedUser;
    const {
        user: externalUserResult,
        loading: externalUserResultLoading,
        error: externalUserResultError,
        refreshUser: externalRefreshUser
    } = useUser(
        userId,
        {
            enabled:
                shouldFetchExternalUser,
        }
    );

    SCOPED_LOGGER.debug("userId", userId);

    /**
     * -------------------------------------------------------------------------
     * Resolve Editable User
     * -------------------------------------------------------------------------
     */

    const editableUser = useMemo(() => {

        if (providedUser) {
            return providedUser;
        }

        if (userId) {
            return externalUserResult;
        }

        return (
            currentUser?.user ||
            currentUser
        );

    }, [
        providedUser,
        userId,
        externalUserResult,
        currentUser,
    ]);

    const isLoading =
        currentUserLoading ||
        externalUserResultLoading;

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
     * Resolved Schema
     * -------------------------------------------------------------------------
     */

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

            if (
                field.adminOnly &&
                !isAdmin
            ) {

                schema[field.key] = {
                    ...field,
                    visible: false,
                };

                continue;
            }

            /**
             * -------------------------------------------------------------
             * Dynamic visibility
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

                    readonly:
                        readonly ||
                        field.readonly,
                };

                continue;
            }

            /**
             * -------------------------------------------------------------
             * Standard field
             * -------------------------------------------------------------
             */

            schema[field.key] = {
                ...field,

                visible:
                    field.visible !== false,

                readonly:
                    readonly ||
                    field.readonly,
            };
        }

        SCOPED_LOGGER.debug(
            "Resolved schema",
            schema
        );

        return schema;

    }, [
        fields,
        currentUser,
        editableUser,
        isAdmin,
        readonly,
    ]);

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
            "Hydrating form",
            editableUser
        );

        setFormState(
            buildFormStateFromSchema(
                editableUser,
                resolvedFieldSchema
            )
        );

    }, [
        editableUser,
        resolvedFieldSchema,
    ]);

    /**
     * -------------------------------------------------------------------------
     * Save
     * -------------------------------------------------------------------------
     */

    const handleSave = async (
        e
    ) => {

        e.preventDefault();

        if (readonly) {

            SCOPED_LOGGER.warn(
                "Attempted save in readonly mode"
            );

            return;
        }

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
     * Reset
     * -------------------------------------------------------------------------
     */

    const resetForm = () => {

        if (!editableUser) {
            return;
        }

        SCOPED_LOGGER.debug(
            "Resetting form"
        );

        setFormState(
            buildFormStateFromSchema(
                editableUser,
                resolvedFieldSchema
            )
        );
    };

    /**
     * -------------------------------------------------------------------------
     * Change Detection
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
                JSON.stringify(editableUser) !==
                JSON.stringify(formState)
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
            "Loading profile"
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
                {title}
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
                    fieldSchema={
                        resolvedFieldSchema
                    }
                />

                {
                    !readonly && (
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
                    )
                }

            </form>

        </div>
    );
}

UserProfileEditor.propTypes = {

    /**
     * Explicit user object.
     */
    user: PropTypes.object,

    /**
     * Arbitrary user id.
     * Future hook support.
     */
    userId: PropTypes.string,

    /**
     * Readonly mode.
     */
    readonly: PropTypes.bool,

    /**
     * Title override.
     */
    title: PropTypes.string,

    /**
     * Save handler.
     */
    onSave: PropTypes.func,

    /**
     * Schema fields.
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