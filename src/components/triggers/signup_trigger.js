import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import { EMPTY } from '../common';
import {
    isModalActive,
    modal_style,
    setModalActive,
    setModalInactive
} from '../modal_manager';

import Spinner from '../ui/loaders/spinning_wheel';
import { useAuth } from '../auth_context';
import { useSignup } from '../hooks/use_signup';
import { SignupFields } from '../auth/signup_fields';

/**
 * SignupTrigger
 *
 * Renders a trigger (button/link/text) that opens a signup modal
 * or redirects to a signup route, depending on configuration.
 *
 * This component is backend-safe: it accepts only serializable
 * configuration and never expects JSX from the server.
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

    // --- Modal state ---
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const navigate = useNavigate();
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();

    /**
     * Signup hook
     *
     * Assumes:
     *   signup(username, password, confirmPassword)
     * resolves on success and throws / sets error on failure
     */
    const { signup, loading, error } = useSignup({
        redirectTo,
        navigate,
        onSignup: () => {
            refreshAuth();
            closeModal();
        }
    });

    // --- Modal lifecycle ---
    const openModal = () => {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
            onOpen?.();
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setModalInactive();
        clearInput();
        onClose?.();
    };

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
            openModal();
        } else {
            navigate(signupRoute);
        }
    };

    // --- Form submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(username, password, confirmPassword);
    };

    // --- Auth loading states ---
    if (isLoading || isAuthenticated === undefined) {
        return <Spinner size="20px" thickness="2px" color="#333" />;
    }

    // Hide signup trigger if already authenticated
    if (isAuthenticated) return null;

    /**
     * Renders the trigger element based on triggerType
     * Keeps markup deterministic and backend-driven.
     */
    const renderTrigger = () => {
        const commonProps = {
            onClick: handleTriggerClick,
            "aria-disabled": disabled,
        };

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
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="modal-content"
                    style={modal_style}
                    contentLabel="Sign up"
                >
                    <form onSubmit={handleSubmit} className="box">
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
                </Modal>
            )}
        </>
    );
}
