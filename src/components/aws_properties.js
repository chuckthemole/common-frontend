import useSWR from 'swr';
import { common_fetcher } from './common_requests';

/**
 * TODO: this is in react but should maybe just be in common dir
 */
export function getAwsProperties(properties_path) {
    const { data, error, isLoading } = useSWR(
        properties_path,
        common_fetcher
    );

    return {
        properties_data: data,
        isLoading,
        isError: error
    }
}