import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import { EMPTY } from '../common';
import { isModalActive, modal_style, setModalActive, setModalInactive } from '../modal_manager';
import OAuth2ButtonGroup from '../oauth2';
import { useLogin } from '../hooks/use_login';
import Spinner from '../ui/spinning_wheel';
import { useAuth } from '../auth_context';

/**
 * LoginModal is a reusable login component that shows a modal login form.
 * 
 * - Uses `useLogin()` hook for form-based login logic.
 * - Integrates `react-router-dom` navigation via `useNavigate()`.
 * - Displays a login button that toggles the modal open/closed.
 * - Supports OAuth2 login buttons via `OAuth2ButtonGroup`.
 * - Automatically closes on successful login.
 * 
 * @param {string} [redirectTo="/"] - Path to redirect to after successful login.
 * @returns {JSX.Element|null}
 */
export default function LoginModal({ redirectTo = "/" }) {
    // Local form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    // console.log(isAuthenticated);

    // Modal open/close state
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // React Router navigation instance
    const navigate = useNavigate();

    // Hook for login request logic
    const { login, loading, error } = useLogin({
        redirectTo,
        navigate,
        onLogin: () => {
            refreshAuth();
            setModalIsOpen(false);
            setModalInactive();
        }
    });

    /** Open modal if it's not already active */
    function openModal() {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    }

    /** Close modal and reset form */
    function closeModal() {
        setModalIsOpen(false);
        setModalInactive();
        clearInput();
    }

    /** Clear form fields */
    function clearInput() {
        setUsername(EMPTY);
        setPassword(EMPTY);
    }

    /** Submit login form and trigger login logic */
    async function handleSubmit(e) {
        e.preventDefault();
        await login(username, password);
    }

    // Show loading indicator while auth status is being resolved
    if (isLoading || isAuthenticated === undefined) {
        return (
            <progress className="progress is-small is-primary" max="100">Loading...</progress>
        );
    }

    // If already logged in, don’t render the login button/modal
    if (isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Button to open login modal */}
            <a onClick={openModal} className="loginBtn button is-light">
                Login
            </a>

            {/* Modal Content */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Login Modal"
            >
                <div className="modal-content">
                    <form onSubmit={handleSubmit} className="box">
                        {/* OAuth2 Provider Buttons */}
                        <OAuth2ButtonGroup
                            providers={['google']}
                            customEndpoints={{ google: '/auth/google/authorize' }}
                        />

                        {/* Username Field */}
                        <div className="field">
                            <label className="label">Username</label>
                            <div className="control has-icons-left">
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="e.g. coolguy"
                                    className="input"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                                <span className="icon is-small is-left">
                                    <i className="fa fa-envelope"></i>
                                </span>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="field">
                            <label className="label">Password</label>
                            <div className="control has-icons-left">
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="*******"
                                    className="input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <span className="icon is-small is-left">
                                    <i className="fa fa-lock"></i>
                                </span>
                            </div>
                        </div>

                        {/* Error message if login fails */}
                        {error && <p className="has-text-danger">{error}</p>}

                        {/* Submit/Login button */}
                        <div className="field">
                            <button
                                id="loginSubmit"
                                type="submit"
                                className="button is-success"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Spinner size="16px" thickness="2px" color="#fff" />
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
