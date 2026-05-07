import { useContext } from 'react';

import RetentionContext from './retention-context';

export default function useRetention() {
    const context =
        useContext(RetentionContext);

    if (!context) {
        throw new Error(
            'useRetention must be used within RetentionProvider'
        );
    }

    return context;
}