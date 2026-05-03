import { useContext } from "react";
import CurrentUserContext from "./current-user-context";

export default function useCurrentUser() {
    const context = useContext(CurrentUserContext);

    if (!context) {
        throw new Error(
            "useCurrentUser must be used within a CurrentUserProvider"
        );
    }

    return context;
}