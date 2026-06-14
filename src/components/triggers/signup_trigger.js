import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EMPTY } from "../common";
import Spinner from "../ui/loaders/spinning_wheel";
import { useAuth } from "../auth";
import { useSignup } from "../hooks/use_signup";
import UserCreationForm from "../user/forms/user-creation-form";
import ModalTrigger from "./modal-trigger";

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
     * Modal ID for the signup trigger.
     */
    const modalId = "signup-trigger-modal";

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
        navigate(signupRoute);
    };

    /**
     * Handle the close event.
     */
    const handleClose = () => {
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

    const returnComponent = () => {
        if (mode === "modal") {
            return (

                <ModalTrigger
                    modalId={modalId}
                    title="Sign Up"
                    triggerType={triggerType}
                    triggerLabel={triggerLabel}
                    triggerClassName={triggerClassName}
                    disabled={disabled}
                    onOpen={onOpen}
                    onClose={onClose}
                >
                    <UserCreationForm
                        loading={loading}
                        error={error}
                        oauthProviders={oauthProviders}
                        onSubmit={handleSubmit}
                        resetKey={resetInput}
                    />
                </ModalTrigger>
            );
        } else { // TODO: Implement the non-modal case, I have not tested it yet.
            return (
                <button
                    type="button"
                    className={triggerClassName || "button is-primary"}
                    disabled={disabled}
                    onClick={(e) => handleTriggerClick(e)}
                >
                    {triggerLabel}
                </button>
            );
        }
    };

    return (
        returnComponent()
    );
}
