import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EMPTY } from "../common";
import Spinner from "../ui/loaders/spinning_wheel";
import { useAuth } from "../auth_context";
import { useSignup } from "../hooks/use_signup";
import { SignupFields } from "../auth/signup_fields";
import { RumpusModal } from "../ui/modal";
import { useRumpusModal } from "../ui/modal/use-rumpus-modal";

/**
 * SignupTrigger
 *
 * - Trigger button / link / text that opens signup modal or redirects
 * - Uses RumpusModal + useRumpusModal in modal mode
 */
export default function SignupTrigger({
    mode = "modal",                 // "modal" | "redirect"
    triggerType = "button",         // "button" | "link" | "text"
    triggerLabel = "Sign up",
    triggerClassName = "",
    redirectTo = "/",
    signupRoute = "/signup",
    oauthProviders = ["google"],
    disabled = false,
    onOpen,
    onClose,
}) {
    // --- Form state ---
    const [username, setUsername] = useState(EMPTY);
    const [password, setPassword] = useState(EMPTY);
    const [confirmPassword, setConfirmPassword] = useState(EMPTY);

    const navigate = useNavigate();
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    const { activeModal, openModal, closeModal } = useRumpusModal();
    const modalId = "signup-trigger-modal";
    const isOpen = activeModal === modalId;

    const { signup, loading, error } = useSignup({
        redirectTo,
        navigate,
        onSignup: () => {
            refreshAuth();
            closeModal(modalId);
            clearInput();
        },
    });

    const clearInput = () => {
        setUsername(EMPTY);
        setPassword(EMPTY);
        setConfirmPassword(EMPTY);
    };

    // --- Trigger behavior ---
    const handleTriggerClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        if (mode === "modal") {
            e.preventDefault();
            openModal(modalId);
            onOpen?.();
        } else {
            navigate(signupRoute);
        }
    };

    const handleClose = () => {
        closeModal(modalId);
        clearInput();
        onClose?.();
    };

    // --- Form submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(username, password, confirmPassword);
    };

    if (isLoading || isAuthenticated === undefined) {
        return <Spinner size="20px" thickness="2px" color="#333" />;
    }

    if (isAuthenticated) return null;

    const renderTrigger = () => {
        const commonProps = { onClick: handleTriggerClick, "aria-disabled": disabled };

        switch (triggerType) {
            case "link":
                return (
                    <a
                        href={mode === "redirect" ? signupRoute : "#"}
                        className={triggerClassName || "navbar-item"}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </a>
                );

            case "text":
                return (
                    <span
                        role="button"
                        tabIndex={0}
                        className={triggerClassName}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </span>
                );

            case "button":
            default:
                return (
                    <button
                        type="button"
                        className={triggerClassName || "button is-primary"}
                        disabled={disabled}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </button>
                );
        }
    };

    return (
        <>
            {renderTrigger()}

            {mode === "modal" && (
                <RumpusModal
                    isOpen={isOpen}
                    onRequestClose={handleClose}
                    title="Sign Up"
                    maxWidth="480px"
                    draggable
                >
                    <form onSubmit={handleSubmit} className="">
                        <SignupFields
                            username={username}
                            password={password}
                            confirmPassword={confirmPassword}
                            setUsername={setUsername}
                            setPassword={setPassword}
                            setConfirmPassword={setConfirmPassword}
                            error={error}
                            loading={loading}
                            oauthProviders={oauthProviders}
                        />
                    </form>
                </RumpusModal>
            )}
        </>
    );
}
