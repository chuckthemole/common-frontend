import { getNamedApi } from "../client/api";

export const createClient = (apiName) => getNamedApi(apiName);

export async function apiRequest({
    request,
    onSuccess,
    onError,
    onFinally,
}) {

    try {

        const response =
            await request();

        return onSuccess
            ? onSuccess(response)
            : response;

    } catch (error) {

        onError?.(error);

        throw error;

    } finally {

        onFinally?.();
    }
}

export function buildEndpoint(
    endpoint,
    params = {}
) {

    return Object.entries(params)
        .reduce(
            (result, [key, value]) =>
                result.replace(
                    `:${key}`,
                    encodeURIComponent(value)
                ),
            endpoint
        );
}