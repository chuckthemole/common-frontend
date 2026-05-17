import { getNamedApi } from "../client/api";

export const createClient = (apiName) => getNamedApi(apiName);