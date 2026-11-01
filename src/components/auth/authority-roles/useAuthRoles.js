import { useContext } from "react";

import AuthRolesContext from "./auth-roles-context";

export default function useAuthRoles() {
    const context = useContext(AuthRolesContext);

    if (!context) {
        throw new Error(
            "useAuthRoles must be used within an AuthRolesProvider"
        );
    }

    return context;
}