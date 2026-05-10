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

import { ComponentLoading, ObjectEditor } from "../../ui";

/**
 * -----------------------------------------------------------------------------
 * UserProfilePage
 * -----------------------------------------------------------------------------
 */

export default function UserProfilePage({
    onSave,
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
            structuredClone(
                editableUser
            )
        );

    }, [editableUser]);

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

    if (isLoading || !formState) {

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
                    excludedFields={[
                        "password",
                        "token",
                        "roles",
                        "permissions",
                        "createdAt",
                        "updatedAt",
                    ]}
                    readonlyFields={[
                        "id",
                    ]}
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
                                    : "Save changes"
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
                            onClick={() =>
                                setFormState(
                                    structuredClone(
                                        editableUser
                                    )
                                )
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
    onSave: PropTypes.func,
};