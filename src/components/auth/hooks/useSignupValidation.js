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