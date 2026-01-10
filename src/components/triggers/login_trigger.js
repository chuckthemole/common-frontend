import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EMPTY } from "../common";
import { useLogin } from "../hooks/use_login";
import Spinner from "../ui/loaders/spinning_wheel";
import { useAuth } from "../auth_context";
import { LoginFields } from "../auth/login_fields";
import { RumpusModal } from "../ui/modal";
import { useRumpusModal } from "../ui/modal/use-rumpus-modal";

/**
 * LoginTrigger
 *
 * - Handles login either via modal or redirect
 * - Supports different trigger types: button | link | text
 * - Uses RumpusModal + useRumpusModal for modal mode
 */
export default function LoginTrigger({
    mode = "modal",                 // "modal" | "redirect"
    triggerType = "button",         // "button" | "link" | "text"
    triggerLabel = "Login",
    triggerClassName = "",
    redirectTo = "/",
    loginRoute = "/login",
    oauthProviders = ["google"],
    disabled = false,
    onOpen,
    onClose,
}) {
    const [username, setUsername] = useState(EMPTY);
    const [password, setPassword] = useState(EMPTY);

    const navigate = useNavigate();
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    const { activeModal, openModal, closeModal } = useRumpusModal();

    const modalId = "login-trigger-modal";
    const isOpen = activeModal === modalId;

    const { login, loading, error } = useLogin({
        redirectTo,
        navigate,
        onLogin: () => {
            refreshAuth();
            closeModal(modalId);
            clearInput();
        },
    });

    const clearInput = () => {
        setUsername(EMPTY);
        setPassword(EMPTY);
    };

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
            navigate(loginRoute);
        }
    };

    const handleClose = () => {
        closeModal(modalId);
        clearInput();
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
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
                        href={mode === "redirect" ? loginRoute : "#"}
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
                    title="Login"
                    maxWidth="480px"
                    draggable
                >
                    <form onSubmit={handleSubmit} className="">
                        <LoginFields
                            username={username}
                            password={password}
                            setUsername={setUsername}
                            setPassword={setPassword}
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
