import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EMPTY } from "../common";
import Spinner from "../ui/loaders/spinning_wheel";
import { useAuth } from "../auth";
import { useSignup } from "../hooks/use_signup";
import { RumpusModal } from "../ui/modal";
import { useRumpusModal } from "../ui/modal/use-rumpus-modal";
import UserCreationForm from "../user/forms/user-creation-form";

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

    /**
     * Navigation hook for redirecting the user.
     */
    const navigate = useNavigate();

    /**
     * Authentication hook for managing the user's authentication state.
     */
    const {
        isLoading: isAuthLoading,
        isAuthenticated,
        refreshAuth,
    } = useAuth();

    /**
     * RumpusModal hook for managing the modal state.
     */
    const { activeModal, openModal, closeModal } = useRumpusModal();

    /**
     * Modal ID for the signup trigger.
     */
    const modalId = "signup-trigger-modal";

    /**
     * Whether the modal is open.
     */
    const isOpen = activeModal === modalId;

    /**
     * Reset input for the form.
     */
    const [resetInput, setResetInput] = useState(0);

    /**
     * Signup hook for handling the signup process.
     */
    const { signup, loading, error } = useSignup({
        redirectTo,
        navigate,
        onSignup: () => {
            refreshAuth();
            closeModal(modalId);
        },
    });

    /**
     * Handle the click event on the trigger.
     */
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

    /**
     * Handle the close event for the modal.
     */
    const handleClose = () => {
        closeModal(modalId);
        setResetInput(prev => prev + 1);
        onClose?.();
    };

    /**
     * Handle the submit event for the form.
     */
    const handleSubmit = async (data) => {
        const { username, email, password } = data;

        try {
            await signup(username, email, password);
            return true;
        } catch (err) {
            return false;
        }
    };

    if (isAuthLoading || isAuthenticated === undefined) {
        return <Spinner size="20px" thickness="2px" color="#333" />;
    }

    if (isAuthenticated) return null;

    /**
     * Render the trigger element based on its type.
     */
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
                    <UserCreationForm
                        loading={loading}
                        error={error}
                        oauthProviders={oauthProviders}
                        onSubmit={handleSubmit}
                        resetKey={resetInput}
                    />
                </RumpusModal>
            )}
        </>
    );
}
