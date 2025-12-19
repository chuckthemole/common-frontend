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

import { useLogin } from '../hooks/use_login';
import Spinner from '../ui/loaders/spinning_wheel';
import { useAuth } from '../auth_context';
import { LoginFields } from '../auth/login_fields';

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
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const navigate = useNavigate();
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();

    const { login, loading, error } = useLogin({
        redirectTo,
        navigate,
        onLogin: () => {
            refreshAuth();
            closeModal();
        }
    });

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
    };

    const handleTriggerClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        if (mode === "modal") {
            e.preventDefault();
            openModal();
        } else {
            navigate(loginRoute);
        }
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
        const commonProps = {
            onClick: handleTriggerClick,
            "aria-disabled": disabled,
        };

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
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="modal-content"
                    style={modal_style}
                    contentLabel="Login"
                >
                    <form onSubmit={handleSubmit} className="box">
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
                </Modal>
            )}
        </>
    );
}
