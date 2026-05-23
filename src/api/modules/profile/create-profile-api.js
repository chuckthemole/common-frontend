import { createCrudApi } from "../../core/create-crud-api";

import {
    mapProfile,
    mapProfiles,
} from "./map-profile";

export const createProfileApi =
    createCrudApi({
        resourceName: "Profile",

        mapOne: mapProfile,
        mapMany: mapProfiles,

        aliases: {
            getById: "getProfile",
            getAll: "getAllProfiles",
            create: "createProfile",
            update: "updateProfile",
            remove: "removeProfile",
        },
    });