import React from 'react';
import { AuthProvider } from './auth-provider';

export default function AuthRoot({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}
