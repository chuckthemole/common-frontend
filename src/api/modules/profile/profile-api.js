import { createApiInitializer } from "../../core/create-api-instance";
import { createProfileApi } from "./create-profile-api";

const {
    initialize,
    get,
} = createApiInitializer({
    createApi: createProfileApi,
    label: "Profile",
});

export const initializeProfileApi = initialize;
export const getProfileApi = get;