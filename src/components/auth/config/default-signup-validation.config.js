/**
 * -----------------------------------------------------------------------------
 * Signup Validation Configuration
 * -----------------------------------------------------------------------------
 *
 * Client applications may override any of these settings.
 *
 * -----------------------------------------------------------------------------
 */

export const DEFAULT_SIGNUP_VALIDATION_CONFIG = {

    username: {
        required: true,

        minLength: 3,
        maxLength: 50,

        messages: {
            required:
                "Username is required",

            minLength:
                "Username must be at least 3 characters",

            maxLength:
                "Username cannot exceed 50 characters",
        },
    },

    email: {
        required: true,

        regex:
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

        messages: {
            required:
                "Email is required",

            invalid:
                "Please enter a valid email address",
        },
    },

    password: {
        required: true,

        minLength: 8,

        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
        requireSpecialCharacter: false,

        messages: {
            required:
                "Password is required",

            minLength:
                "Password must be at least 8 characters",

            uppercase:
                "Password must contain an uppercase letter",

            lowercase:
                "Password must contain a lowercase letter",

            number:
                "Password must contain a number",

            specialCharacter:
                "Password must contain a special character",
        },
    },

    confirmPassword: {
        enabled: true,
        required: true,

        messages: {
            required:
                "Please confirm your password",

            mismatch:
                "Passwords do not match",
        },
    },
};