import { useContext } from "react";

import RolesAssignmentContext from "./roles-assignment-context";

export default function useRolesAssignment() {
    const context = useContext(RolesAssignmentContext);

    if (!context) {
        throw new Error(
            "useRolesAssignment must be used within an AuthRolesProvider"
        );
    }

    return context;
}