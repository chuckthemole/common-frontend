import {
    useMemo,
} from "react";

import { DEFAULT_SIGNUP_VALIDATION_CONFIG } from "../config/default-signup-validation.config";

/**
 * -----------------------------------------------------------------------------
 * useSignupValidation
 * -----------------------------------------------------------------------------
 *
 * Configuration-driven signup validation.
 *
 * -----------------------------------------------------------------------------
 */

export function useSignupValidation({

    username,
    email,
    password,
    confirmPassword,

    config = DEFAULT_SIGNUP_VALIDATION_CONFIG,

}) {

    const errors = useMemo(() => {

        const nextErrors = {};

        /**
         * ---------------------------------------------------------------------
         * Username
         * ---------------------------------------------------------------------
         */

        const usernameConfig =
            config.username;

        const trimmedUsername =
            username?.trim() ?? "";

        if (
            usernameConfig.required &&
            !trimmedUsername
        ) {

            nextErrors.username =
                usernameConfig.messages.required;

        } else if (
            trimmedUsername &&
            trimmedUsername.length <
            usernameConfig.minLength
        ) {

            nextErrors.username =
                usernameConfig.messages.minLength;

        } else if (
            trimmedUsername &&
            trimmedUsername.length >
            usernameConfig.maxLength
        ) {

            nextErrors.username =
                usernameConfig.messages.maxLength;
        }

        /**
         * ---------------------------------------------------------------------
         * Email
         * ---------------------------------------------------------------------
         */

        const emailConfig =
            config.email;

        const trimmedEmail =
            email?.trim() ?? "";

        if (
            emailConfig.required &&
            !trimmedEmail
        ) {

            nextErrors.email =
                emailConfig.messages.required;

        } else if (
            trimmedEmail &&
            !emailConfig.regex.test(trimmedEmail)
        ) {

            nextErrors.email =
                emailConfig.messages.invalid;
        }

        /**
         * ---------------------------------------------------------------------
         * Password
         * ---------------------------------------------------------------------
         */

        const passwordConfig =
            config.password;

        if (
            passwordConfig.required &&
            !password
        ) {

            nextErrors.password =
                passwordConfig.messages.required;

        } else if (
            password
        ) {

            if (
                password.length <
                passwordConfig.minLength
            ) {

                nextErrors.password =
                    passwordConfig.messages.minLength;
            }

            else if (
                passwordConfig.requireUppercase &&
                !/[A-Z]/.test(password)
            ) {

                nextErrors.password =
                    passwordConfig.messages.uppercase;
            }

            else if (
                passwordConfig.requireLowercase &&
                !/[a-z]/.test(password)
            ) {

                nextErrors.password =
                    passwordConfig.messages.lowercase;
            }

            else if (
                passwordConfig.requireNumber &&
                !/\d/.test(password)
            ) {

                nextErrors.password =
                    passwordConfig.messages.number;
            }

            else if (
                passwordConfig.requireSpecialCharacter &&
                !/[!@#$%^&*(),.?":{}|<>]/.test(password)
            ) {

                nextErrors.password =
                    passwordConfig.messages.specialCharacter;
            }
        }

        /**
         * ---------------------------------------------------------------------
         * Confirm Password
         * ---------------------------------------------------------------------
         */

        const confirmConfig =
            config.confirmPassword;

        if (
            confirmConfig.enabled
        ) {

            if (
                confirmConfig.required &&
                !confirmPassword
            ) {

                nextErrors.confirmPassword =
                    confirmConfig.messages.required;
            }

            else if (
                confirmPassword &&
                password !== confirmPassword
            ) {

                nextErrors.confirmPassword =
                    confirmConfig.messages.mismatch;
            }
        }

        return nextErrors;

    }, [
        username,
        email,
        password,
        confirmPassword,
        config,
    ]);

    const hasErrors =
        Object.keys(errors).length > 0;

    return {
        errors,
        hasErrors,
        isValid: !hasErrors,
    };
}

/**
 * -----------------------------------------------------------------------------
 * TODO (Future Architecture)
 * -----------------------------------------------------------------------------
 *
 * Current implementation uses a locally supplied configuration object.
 *
 * Long-term goal is for validation rules to be sourced from the backend so
 * that the server remains the single source of truth for authentication and
 * user creation requirements.
 *
 * Proposed Architecture:
 *
 *     Spring Boot
 *         └── /api/auth/config
 *                 ↓
 *         Validation Policy DTO
 *                 ↓
 *         React AuthConfigProvider
 *                 ↓
 *         useSignupValidation()
 *                 ↓
 *         SignupFields
 *
 * Benefits:
 *
 * 1. Prevent frontend/backend validation drift.
 *
 *    Example:
 *      - Frontend allows 8-character passwords.
 *      - Backend later requires 12 characters.
 *      - User submits valid-looking form and receives server error.
 *
 *    Shared configuration eliminates this problem.
 *
 * 2. Allow client-specific authentication policies.
 *
 *      Client A:
 *          username min length = 3
 *
 *      Client B:
 *          username min length = 8
 *          special characters required
 *
 *      Client C:
 *          email optional
 *
 *    No frontend code changes required.
 *
 * 3. Allow runtime configuration changes without redeploying the frontend.
 *
 * 4. Ensure validation messages and requirements remain synchronized across
 *    all authentication screens.
 *
 * Future work:
 *
 * - Create AuthenticationConfiguration DTO on backend.
 * - Expose GET /api/auth/config endpoint.
 * - Create useAuthConfig() hook.
 * - Cache configuration using context/provider.
 * - Fall back to DEFAULT_SIGNUP_VALIDATION_CONFIG when endpoint is unavailable.
 * - Consider server-provided validation messages for localization/i18n.
 *
 * -----------------------------------------------------------------------------
 */