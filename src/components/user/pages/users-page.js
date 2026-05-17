import React, { useState } from "react";

import { useUsers } from "../useUsers";

import logger from "../../../logger";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faPlus,
    faEye,
    faPen,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import UserProfileEditor from "./user-profile-editor";
import {
    useRumpusModal,
    RumpusModal,
    Tooltip,
    TruncatedCell,
    ChipInput,
    CHIP_COLOR_PALETTE
} from "../../ui";

/**
 * -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------
 */
function formatDate(epochOrString) {

    if (!epochOrString) {
        return "—";
    }

    const date =
        new Date(
            Number(epochOrString)
        );

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toDateString();
}

/**
 * -----------------------------------------------------------------------------
 * UsersPage
 * -----------------------------------------------------------------------------
 */

export default function UsersPage() {

    const {
        users,
        loading,
        error,
    } = useUsers();

    logger.debug(
        "[UsersPage] render",
        {
            usersCount:
                users?.length,

            loading,
            error,
        }
    );

    const { activeModal, openModal, closeModal } = useRumpusModal();
    const userProfileEditorModalId = "user-profile-editor-modal";
    const userProfileEditorModalIsOpen = activeModal === userProfileEditorModalId;
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(true);

    /**
     * -------------------------------------------------------------------------
     * Actions
     * -------------------------------------------------------------------------
     */

    const handleViewUser = (id) => {

        logger.debug(
            "[UsersPage] view user clicked",
            id
        );
        setSelectedUserId(id);
        setIsReadOnly(true);
        openModal(userProfileEditorModalId)
    };

    const handleUpdateUser = (id) => {

        logger.debug(
            "[UsersPage] update user clicked",
            id
        );
        setSelectedUserId(id);
        setIsReadOnly(false);
        openModal(userProfileEditorModalId)
    };

    const handleDeleteUser = (
        user
    ) => {

        logger.debug(
            "[UsersPage] delete user clicked",
            user
        );

        /**
         * TODO:
         * Open delete confirmation modal
         */
    };

    /**
     * -------------------------------------------------------------------------
     * Loading
     * -------------------------------------------------------------------------
     */

    if (loading) {

        return (
            <div className="m-6">
                Loading users...
            </div>
        );
    }

    /**
     * -------------------------------------------------------------------------
     * Error
     * -------------------------------------------------------------------------
     */

    if (error) {

        return (
            <div
                className="
                    m-6
                    notification
                    is-danger
                    is-light
                "
            >
                Failed to load users:
                {" "}
                {error.message}
            </div>
        );
    }

    /**
     * -------------------------------------------------------------------------
     * Render
     * -------------------------------------------------------------------------
     */

    return (
        <>

            {/* -----------------------------------------------------------------
                HEADER / CONTROLS
            ------------------------------------------------------------------ */}

            <div className="m-6">

                <div
                    className="
                        level
                        mb-4
                    "
                >

                    <div className="level-left">

                        <div className="level-item">

                            <h1 className="title is-3">
                                Users
                            </h1>

                        </div>

                    </div>

                    <div className="level-right">

                        <div className="level-item">

                            <button
                                className="
                                    button
                                    is-primary
                                "
                            >
                                <span className="icon">

                                    <FontAwesomeIcon
                                        icon={faPlus}
                                    />

                                </span>

                                <span>
                                    Add User
                                </span>

                            </button>

                        </div>

                    </div>

                </div>

                <div className="columns">

                    <div
                        className="
                            column
                            is-one-third
                        "
                    >

                        <input
                            className="input"
                            type="text"
                            placeholder="Search users..."
                        />

                    </div>

                </div>

            </div>

            {/* -----------------------------------------------------------------
                TABLE
            ------------------------------------------------------------------ */}

            <div className="table-container">

                <table
                    className="
                        table
                        is-hoverable
                        is-fullwidth
                        is-bordered
                        m-6
                    "
                >

                    <thead>

                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Created</th>
                            <th>ID</th>
                            <th>View</th>
                            <th>Delete</th>
                            <th>Update</th>
                        </tr>

                    </thead>

                    <tbody>

                        {
                            users.map(
                                (
                                    user,
                                    index
                                ) => (
                                    <tr
                                        key={
                                            user.id
                                        }
                                    >

                                        {/* INDEX */}

                                        <th>
                                            {
                                                index + 1
                                            }
                                        </th>

                                        {/* USERNAME */}

                                        <td>
                                            {
                                                user.username
                                            }
                                        </td>

                                        {/* EMAIL */}

                                        <td>
                                            {
                                                user.email
                                            }
                                        </td>

                                        {/* ROLES */}
                                        <td>
                                            {
                                                user.roles?.length ? (
                                                    <ChipInput
                                                        editable
                                                        addable
                                                        removable
                                                        placeholder="Add role..."
                                                        assignColors
                                                        colorPalette={CHIP_COLOR_PALETTE}
                                                        items={
                                                            user.roles.map((role) => ({
                                                                label: role,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    "—"
                                                )
                                            }
                                        </td>
                                        {/* CREATED */}

                                        <td
                                            title={
                                                user.createdAt
                                            }
                                        >

                                            {
                                                formatDate(
                                                    user.createdAtTimestamp
                                                )
                                            }

                                        </td>

                                        {/* ID */}
                                        <td>
                                            <Tooltip
                                                copyable
                                                rotatable
                                                copyText={user.id}
                                                text={user.id}
                                            >
                                                <TruncatedCell
                                                    value={user.id}
                                                />
                                            </Tooltip>
                                        </td>

                                        {/* VIEW */}

                                        <td>

                                            <Tooltip text={"View user"}>
                                                <button
                                                    className="
                                                    button
                                                    is-small
                                                    is-info
                                                    is-light
                                                "
                                                    onClick={() =>
                                                        handleViewUser(user.id)
                                                    }
                                                >

                                                    <span className="icon">

                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                        />

                                                    </span>

                                                </button>
                                            </Tooltip>

                                        </td>

                                        {/* DELETE */}

                                        <td>

                                            <Tooltip text={"Delete user"}>
                                                <button
                                                    className="
                                                    button
                                                    is-small
                                                    is-danger
                                                    is-light
                                                "
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user
                                                        )
                                                    }
                                                >

                                                    <span className="icon">

                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />

                                                    </span>

                                                </button>
                                            </Tooltip>

                                        </td>

                                        {/* UPDATE */}

                                        <td>

                                            <Tooltip text={"Update user"}>
                                                <button
                                                    className="
                                                    button
                                                    is-small
                                                    is-warning
                                                    is-light
                                                "
                                                    onClick={() =>
                                                        handleUpdateUser(user.id)
                                                    }
                                                >

                                                    <span className="icon">

                                                        <FontAwesomeIcon
                                                            icon={faPen}
                                                        />

                                                    </span>

                                                </button>
                                            </Tooltip>

                                        </td>

                                    </tr>
                                )
                            )
                        }

                    </tbody>

                    <tfoot>

                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Created</th>
                            <th>ID</th>
                            <th>View</th>
                            <th>Delete</th>
                            <th>Update</th>
                        </tr>

                    </tfoot>

                </table>

            </div>

            <RumpusModal
                isOpen={userProfileEditorModalIsOpen}
                onRequestClose={() => {
                    setSelectedUserId('');
                    closeModal(userProfileEditorModalId);
                }}
                title="Font Settings"
                draggable
                maxWidth="800px"
            >
                {isReadOnly ?
                    <UserProfileEditor
                        readonly
                        userId={selectedUserId}
                    /> :
                    <UserProfileEditor
                        userId={selectedUserId}
                    />
                }

            </RumpusModal>

        </>
    );
}