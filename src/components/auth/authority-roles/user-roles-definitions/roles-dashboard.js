
import React, { useMemo, useState } from "react";

import useRolesDefinitions from "./useRolesDefinitions";

import logger from "../../../../logger";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faPlus,
    faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

import { useSort } from "../../../hooks/use-sort";

import {
    ComponentLoading,
    RumpusModal,
    Tooltip,
    TruncatedCell,
    useRumpusModal,
} from "../../../ui";


/**
 * -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------
 */

/**
 * Normalize role names consistently before comparing or saving.
 *
 * Examples:
 * "Role Admin"    -> "ROLE_ADMIN"
 * "role_developer" -> "ROLE_DEVELOPER"
 */
const normalizeRole = (role) =>
    role.trim().toUpperCase().replace(/\s+/g, "_");


/**
 * Extract a readable message from an API or application error.
 */
const getErrorMessage = (error, fallback = "An unexpected error occurred.") => {
    if (!error) {
        return fallback;
    }

    if (typeof error === "string") {
        return error;
    }

    return error.message || fallback;
};


/**
 * Compare role values for client-side sorting.
 */
const compareRoles = (a, b, key) => {
    const valueA = a?.[key];
    const valueB = b?.[key];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;

    if (typeof valueA === "number" && typeof valueB === "number") {
        return valueA - valueB;
    }

    return String(valueA).localeCompare(String(valueB), undefined, {
        numeric: true,
        sensitivity: "base",
    });
};


/**
 * -----------------------------------------------------------------------------
 * RolesDashboard
 * -----------------------------------------------------------------------------
 */

export default function RolesDashboard() {

    /**
     * -------------------------------------------------------------------------
     * Sorting
     * -------------------------------------------------------------------------
     */

    const {
        sortConfig,
        toggleSort,
        isSortedBy,
        sortIndicator,
    } = useSort("AUTHORITY", "asc");


    /**
     * -------------------------------------------------------------------------
     * Role Definitions
     * -------------------------------------------------------------------------
     */

    const {
        roles = [],
        rolesLoading,
        loading,
        rolesError,
        mutationLoading,
        mutationError,
        refreshRoles,
        createRole,
    } = useRolesDefinitions();

    const isLoading = rolesLoading ?? loading ?? false;

    logger.debug(
        "[RolesDashboard] render",
        {
            rolesCount: roles?.length,
            isLoading,
            rolesError,
            mutationLoading,
        }
    );


    /**
     * -------------------------------------------------------------------------
     * Local State
     * -------------------------------------------------------------------------
     */

    const [search, setSearch] = useState("");
    const [newRole, setNewRole] = useState("");
    const [createError, setCreateError] = useState("");
    const [isCreatingRole, setIsCreatingRole] = useState(false);


    /**
     * -------------------------------------------------------------------------
     * Modal
     * -------------------------------------------------------------------------
     */

    const { activeModal, openModal, closeModal } = useRumpusModal();

    const createRoleModalId = "create-role-modal";

    const createRoleModalIsOpen =
        activeModal === createRoleModalId;


    /**
     * -------------------------------------------------------------------------
     * Filtering and Sorting
     * -------------------------------------------------------------------------
     */

    const filteredRoles = useMemo(() => {

        const searchTerm = search.trim().toLowerCase();

        let result = [...roles];

        // Filter by authority, ID, or status.
        if (searchTerm) {
            result = result.filter((role) => {
                const authority = role.authority ?? "";
                const id = role.id?.toString() ?? "";
                const status = role.status ?? "";

                return (
                    authority.toLowerCase().includes(searchTerm) ||
                    id.toLowerCase().includes(searchTerm) ||
                    status.toLowerCase().includes(searchTerm)
                );
            });
        }

        // Sort locally using the selected column.
        const sortKey = {
            AUTHORITY: "authority",
            ID: "id",
            STATUS: "status",
        }[sortConfig.key];

        if (sortKey) {
            result.sort((a, b) =>
                compareRoles(a, b, sortKey)
            );

            if (sortConfig.direction.toLowerCase() === "desc") {
                result.reverse();
            }
        }

        return result;

    }, [roles, search, sortConfig]);


    /**
     * -------------------------------------------------------------------------
     * Actions
     * -------------------------------------------------------------------------
     */

    const handleOpenCreateRole = () => {

        logger.debug("[RolesDashboard] open create role modal");

        setNewRole("");
        setCreateError("");

        openModal(createRoleModalId);
    };


    const handleCloseCreateRole = () => {

        logger.debug("[RolesDashboard] close create role modal");

        setNewRole("");
        setCreateError("");

        closeModal(createRoleModalId);
    };


    const handleRefreshRoles = async () => {

        logger.debug("[RolesDashboard] refresh roles clicked");

        try {
            await refreshRoles?.();
        } catch (error) {
            logger.error(
                "[RolesDashboard] failed to refresh roles",
                error
            );
        }
    };


    const handleCreateRole = async (event) => {

        event.preventDefault();

        setCreateError("");

        const roleName = normalizeRole(newRole);

        if (!roleName) {
            setCreateError("Please enter a role name.");
            return;
        }

        // Prevent duplicate role definitions.
        const alreadyExists = roles.some(
            (role) =>
                role.authority?.toUpperCase() === roleName
        );

        if (alreadyExists) {
            setCreateError("This role already exists.");
            return;
        }

        logger.debug(
            "[RolesDashboard] creating role",
            { authority: roleName }
        );

        try {

            setIsCreatingRole(true);

            await createRole({ authority: roleName });

            logger.info(
                "[RolesDashboard] role created successfully",
                { authority: roleName }
            );

            handleCloseCreateRole();

        } catch (error) {

            logger.error(
                "[RolesDashboard] failed to create role",
                error
            );

            setCreateError(
                getErrorMessage(error, "Failed to create role.")
            );

        } finally {

            setIsCreatingRole(false);

        }
    };


    /**
     * -------------------------------------------------------------------------
     * Table Header
     * -------------------------------------------------------------------------
     */

    const tableHeader = (
        <tr>
            <th>#</th>

            <th
                onClick={() => toggleSort("AUTHORITY")}
                style={{ cursor: "pointer" }}
            >
                Authority{" "}
                {isSortedBy("AUTHORITY") &&
                    sortIndicator("AUTHORITY")}
            </th>

            <th
                onClick={() => toggleSort("ID")}
                style={{ cursor: "pointer" }}
            >
                ID{" "}
                {isSortedBy("ID") &&
                    sortIndicator("ID")}
            </th>

            <th
                onClick={() => toggleSort("STATUS")}
                style={{ cursor: "pointer" }}
            >
                Status{" "}
                {isSortedBy("STATUS") &&
                    sortIndicator("STATUS")}
            </th>

            <th>Type</th>
        </tr>
    );


    /**
     * -------------------------------------------------------------------------
     * Table Content
     * -------------------------------------------------------------------------
     */

    const tableContent = isLoading ? (

        <ComponentLoading />

    ) : (

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
                    {tableHeader}
                </thead>

                <tbody>

                    {filteredRoles.length === 0 ? (

                        <tr>
                            <td
                                colSpan={5}
                                className="has-text-centered"
                            >
                                {search.trim()
                                    ? "No matching roles found."
                                    : "No roles have been created yet."
                                }
                            </td>
                        </tr>

                    ) : (

                        filteredRoles.map((role, index) => (

                            <tr key={role.id ?? role.authority}>

                                {/* INDEX */}

                                <th>
                                    {index + 1}
                                </th>


                                {/* AUTHORITY */}

                                <td>
                                    <Tooltip
                                        copyable
                                        rotatable
                                        copyText={role.authority}
                                        text={role.authority}
                                    >
                                        <code>
                                            {role.authority}
                                        </code>
                                    </Tooltip>
                                </td>


                                {/* ID */}

                                <td>
                                    <Tooltip
                                        copyable
                                        rotatable
                                        copyText={String(role.id)}
                                        text={String(role.id)}
                                    >
                                        <TruncatedCell
                                            value={String(role.id)}
                                        />
                                    </Tooltip>
                                </td>


                                {/* STATUS */}

                                <td>
                                    {role.status ?? "—"}
                                </td>


                                {/* TYPE */}

                                <td>
                                    <span className="tag is-light">
                                        Application role
                                    </span>
                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

                <tfoot>
                    {tableHeader}
                </tfoot>

            </table>

        </div>

    );


    /**
     * -------------------------------------------------------------------------
     * Error Messages
     * -------------------------------------------------------------------------
     */

    const rolesErrorMessage = getErrorMessage(
        rolesError,
        "Failed to load application roles."
    );

    const mutationErrorMessage = getErrorMessage(
        mutationError,
        ""
    );


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

                <div className="level mb-4">

                    <div className="level-left">

                        <div className="level-item">

                            <div>
                                <h1 className="title is-3">
                                    Application Roles
                                </h1>

                                <p className="subtitle is-6">
                                    Manage the roles available throughout
                                    the application.
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="level-right">

                        <div className="level-item">

                            <button
                                className="button is-light"
                                onClick={handleRefreshRoles}
                                disabled={isLoading}
                            >
                                <span className="icon">
                                    <FontAwesomeIcon
                                        icon={faRotateRight}
                                    />
                                </span>

                                <span>
                                    Refresh Roles
                                </span>
                            </button>

                        </div>


                        <div className="level-item">

                            <button
                                className="button is-primary"
                                onClick={handleOpenCreateRole}
                            >
                                <span className="icon">
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                    />
                                </span>

                                <span>
                                    Add Role
                                </span>
                            </button>

                        </div>

                    </div>

                </div>


                {/* -----------------------------------------------------------------
                    SEARCH / SUMMARY
                ------------------------------------------------------------------ */}

                <div className="columns is-vcentered">

                    <div className="column is-one-third">

                        <input
                            className="input"
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                    <div className="column">

                        <span className="has-text-grey">
                            Showing {filteredRoles.length} of {roles.length} roles
                        </span>

                    </div>

                </div>


                {/* -----------------------------------------------------------------
                    ERRORS
                ------------------------------------------------------------------ */}

                {rolesError && (

                    <div className="notification is-danger is-light">

                        <strong>Failed to load roles:</strong>{" "}
                        {rolesErrorMessage}

                        <button
                            className="button is-small is-danger is-light ml-3"
                            onClick={handleRefreshRoles}
                            disabled={isLoading}
                        >
                            Retry
                        </button>

                    </div>

                )}

                {mutationError && (

                    <div className="notification is-danger is-light">
                        {mutationErrorMessage}
                    </div>

                )}

            </div>


            {/* -----------------------------------------------------------------
                TABLE
            ------------------------------------------------------------------ */}

            {tableContent}


            {/* -----------------------------------------------------------------
                CREATE ROLE MODAL
            ------------------------------------------------------------------ */}

            <RumpusModal
                isOpen={createRoleModalIsOpen}
                onRequestClose={handleCloseCreateRole}
                title="Create Application Role"
                draggable
                maxWidth="500px"
            >

                <form onSubmit={handleCreateRole}>

                    <div className="field">

                        <label
                            className="label"
                            htmlFor="new-role-authority"
                        >
                            Role name
                        </label>

                        <div className="control">

                            <input
                                id="new-role-authority"
                                className="input"
                                type="text"
                                value={newRole}
                                onChange={(event) =>
                                    setNewRole(event.target.value)
                                }
                                placeholder="ROLE_DEVELOPER"
                                maxLength={100}
                                disabled={isCreatingRole || mutationLoading}
                                autoFocus
                            />

                        </div>

                        <p className="help">
                            Use descriptive names such as ROLE_ADMIN
                            or ROLE_DEVELOPER.
                        </p>

                    </div>


                    {createError && (

                        <div
                            className="notification is-danger is-light"
                            role="alert"
                        >
                            {createError}
                        </div>

                    )}


                    <div className="field is-grouped is-justify-content-flex-end">

                        <div className="control">

                            <button
                                type="button"
                                className="button is-light"
                                onClick={handleCloseCreateRole}
                                disabled={isCreatingRole || mutationLoading}
                            >
                                Cancel
                            </button>

                        </div>

                        <div className="control">

                            <button
                                type="submit"
                                className="button is-primary"
                                disabled={
                                    isCreatingRole ||
                                    mutationLoading ||
                                    !newRole.trim()
                                }
                            >
                                {isCreatingRole || mutationLoading
                                    ? "Creating..."
                                    : "Create Role"
                                }
                            </button>

                        </div>

                    </div>

                </form>

            </RumpusModal>

        </>

    );
}
