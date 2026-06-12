import {
    useMemo,
} from "react";

/**
 * -----------------------------------------------------------------------------
 * useSignupValidation
 * -----------------------------------------------------------------------------
 *
 * Client-side validation for signup forms.
 *
 * Returns:
 *
 * {
 *     errors: {
 *         username,
 *         email,
 *         password,
 *         confirmPassword,
 *     },
 *     isValid,
 *     hasErrors,
 * }
 *
 * -----------------------------------------------------------------------------
 */

export function useSignupValidation({
    username,
    email,
    password,
    confirmPassword,
}) {

    const errors = useMemo(() => {

        const nextErrors = {};

        /**
         * ---------------------------------------------------------------------
         * Username
         * ---------------------------------------------------------------------
         */

        if (!username?.trim()) {

            nextErrors.username =
                "Username is required";

        } else if (
            username.trim().length < 3
        ) {

            nextErrors.username =
                "Username must be at least 3 characters";

        } else if (
            username.length > 50
        ) {

            nextErrors.username =
                "Username cannot exceed 50 characters";
        }

        /**
         * ---------------------------------------------------------------------
         * Email
         * ---------------------------------------------------------------------
         */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email?.trim()) {

            nextErrors.email =
                "Email is required";

        } else if (
            !emailRegex.test(email)
        ) {

            nextErrors.email =
                "Please enter a valid email address";
        }

        /**
         * ---------------------------------------------------------------------
         * Password
         * ---------------------------------------------------------------------
         */

        if (!password) {

            nextErrors.password =
                "Password is required";

        } else if (
            password.length < 8
        ) {

            nextErrors.password =
                "Password must be at least 8 characters";
        }

        /**
         * ---------------------------------------------------------------------
         * Confirm Password
         * ---------------------------------------------------------------------
         */

        if (
            confirmPassword !== undefined
        ) {

            if (!confirmPassword) {

                nextErrors.confirmPassword =
                    "Please confirm your password";

            } else if (
                password !== confirmPassword
            ) {

                nextErrors.confirmPassword =
                    "Passwords do not match";
            }
        }

        return nextErrors;

    }, [
        username,
        email,
        password,
        confirmPassword,
    ]);

    const hasErrors =
        Object.keys(errors).length > 0;

    return {
        errors,
        hasErrors,
        isValid: !hasErrors,
    };
}