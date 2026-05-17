import React from "react";
import { useUsers } from "../useUsers";
import logger from "../../../logger";

// import UserModal from "../UserModal";
// import UserDelete from "../UserDelete";
// import UpdateUser from "../UpdateUser";
// import SignupModal from "../SignupModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

/**
 * Helper: safely format date
 */
function formatDate(epochOrString) {
    if (!epochOrString) return "—";

    const date = new Date(Number(epochOrString));
    if (isNaN(date.getTime())) return "—";

    return date.toDateString();
}

export default function UsersPage() {
    const { users, loading, error } = useUsers();

    logger.debug("[UsersPage] render", {
        usersCount: users?.length,
        loading,
        error,
    });

    if (loading) {
        return <div className="m-6">Loading users...</div>;
    }

    if (error) {
        return (
            <div className="m-6 has-text-danger">
                Failed to load users: {error.message}
            </div>
        );
    }

    return (
        <>
            {/* HEADER / CONTROLS */}
            <div className="m-6">
                <div className="columns">
                    <input
                        className="column is-one-third input"
                        type="text"
                        placeholder="Search users..."
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="table-container">
                <table className="table is-hoverable is-fullwidth is-bordered m-6">
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
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <th>{index + 1}</th>

                                {/* USERNAME */}
                                <td>{user.username}</td>

                                {/* EMAIL */}
                                <td>{user.email}</td>

                                {/* ROLES (from mapper) */}
                                <td>
                                    {user.roles?.length
                                        ? user.roles.join(", ")
                                        : "—"}
                                </td>

                                {/* CREATED DATE */}
                                <td title={user.createdAt}>
                                    {formatDate(user.createdAtTimestamp)}
                                </td>

                                {/* ID */}
                                <td>{user.id}</td>

                                {/* ACTIONS */}
                                <td>
                                    {/* <UserModal user_id={user.id} /> */}
                                </td>

                                <td>
                                    {/* <UserDelete
                                        user_username={user.username}
                                        user_id={user.id}
                                    /> */}
                                </td>

                                <td>
                                    {/* <UpdateUser
                                        user_id={user.id}
                                        userDetails={{
                                            username: user.username,
                                            enabled: user.enabled,
                                            roles: user.roles,
                                        }}
                                        user_email={user.email}
                                        metaData={{
                                            creationTime:
                                                user.createdAtTimestamp,
                                            aboutMe: user.aboutMe,
                                            photoLink: user.photoLink,
                                        }}
                                    /> */}
                                </td>
                            </tr>
                        ))}
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

            {/* ADD USER */}
            <div className="container m-4">
                {/* <SignupModal
                    btn={
                        <span>
                            <FontAwesomeIcon icon={faPlus} />
                            &nbsp;&nbsp;Add new user
                        </span>
                    }
                    create_user_path="/api/users"
                /> */}
            </div>
        </>
    );
}