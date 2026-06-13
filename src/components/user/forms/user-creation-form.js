import React, { useEffect, useState } from "react";

import { EMPTY } from "../../common";
import { SignupFields, useSignupValidation } from "../../auth";
import logger from "../../../logger";

export default function UserCreationForm({
    onSubmit,
    loading = false,
    error = null,
    oauthProviders = [],
    resetKey = null,
}) {
    const [username, setUsername] = useState(EMPTY);
    const [password, setPassword] = useState(EMPTY);
    const [email, setEmail] = useState(EMPTY);
    const [confirmPassword, setConfirmPassword] = useState(EMPTY);

    const {
        errors,
        isValid,
    } = useSignupValidation({
        username,
        email,
        password,
        confirmPassword,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await onSubmit({
            username,
            email,
            password,
        });
        if (!result) {
            logger.error("Failed to submit signup form");
            return;
        }

        logger.info("Successfully submitted signup form");
        clear();
    };

    const clear = () => {
        setUsername(EMPTY);
        setPassword(EMPTY);
        setEmail(EMPTY);
        setConfirmPassword(EMPTY);
    };

    useEffect(() => {
        clear();
    }, [resetKey]);

    return (
        <form onSubmit={handleSubmit}>
            <SignupFields
                username={username}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                setUsername={setUsername}
                setPassword={setPassword}
                setEmail={setEmail}
                setConfirmPassword={setConfirmPassword}
                error={error}
                loading={loading}
                oauthProviders={oauthProviders}
                validationErrors={errors}
                canSubmit={isValid}
            />
        </form>
    );
}