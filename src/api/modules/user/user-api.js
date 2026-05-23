import { createApiInitializer } from "../../core/create-api-instance";
import { createUserApi } from "./create-user-api";

const {
    initialize,
    get,
} = createApiInitializer({
    createApi: createUserApi,
    label: "User",
});

export const initializeUserApi = initialize;
export const getUserApi = get;