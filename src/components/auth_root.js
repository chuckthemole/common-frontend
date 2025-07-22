import React from 'react';
import { AuthProvider } from './auth_context';

export default function AuthRoot({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}
