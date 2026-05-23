import { createCrudApi } from "../../core/create-crud-api";

import {
    mapUser,
    mapUsers,
} from "./map-user";

export const createUserApi =
    createCrudApi({
        resourceName: "User",

        mapOne: mapUser,
        mapMany: mapUsers,

        aliases: {
            getById: "getUser",
            getAll: "getAllUsers",
            create: "createUser",
            update: "updateUser",
            remove: "removeUser",
        },
    });