import { useContext } from "react";
import RolesContext from "./roles-context";

export default function useRolesDefinitions() {
    const context = useContext(RolesContext);

    if (!context) {
        throw new Error(
            "useRolesDefinitions must be used within a RolesProvider."
        );
    }

    return context;
}