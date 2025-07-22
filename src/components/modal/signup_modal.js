import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import { EMPTY } from '../common';
import { isModalActive, modal_style, setModalActive, setModalInactive } from '../modal_manager';
import { isCurrentUserAuthenticated } from '../common_requests';
import { useSignup } from '../hooks/use_signup';
import { useAuth } from '../auth_context';
import Spinner from '../ui/spinning_wheel';

/**
 * SignupModal shows a modal form for user registration.
 * 
 * - Uses `useSignup` hook to post credentials to backend.
 * - Automatically closes and optionally redirects on success.
 * - Will not display if user is already authenticated.
 * 
 * @param {JSX.Element|string} [btn] - Optional custom button text or element
 * @param {string} [redirectTo="/"] - Path to redirect after signup
 * @returns {JSX.Element|null}
 */
export default function SignupModal({ btn, redirectTo = "/" }) {
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    // const is_user_authenticated = isCurrentUserAuthenticated();

    const { signup, loading, error } = useSignup({
        redirectTo,
        navigate,
        onSignup: () => {
            setModalIsOpen(false);
            setModalInactive();
            clearInput();
        }
    });

    function openModal() {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    }

    function closeModal() {
        setModalIsOpen(false);
        setModalInactive();
        clearInput();
    }

    function clearInput() {
        setUsername(EMPTY);
        setEmail(EMPTY);
        setPassword(EMPTY);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        await signup(username, email, password);
    }

    // Show loading indicator while auth status is being resolved
    if (isLoading || isAuthenticated === undefined) {
        return (
            <progress className="progress is-small is-primary" max="100">Loading...</progress>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Trigger Button */}
            <a onClick={openModal} className="signupBtn button is-light is-success">
                {btn || <span>Sign up</span>}
            </a>

            {/* Modal Form */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Signup Modal"
            >
                <div className="modal-content">
                    <form onSubmit={handleSubmit} className="box">
                        {/* Username */}
                        <div className="field">
                            <label className="label">Username</label>
                            <div className="control has-icons-left">
                                <input
                                    type="text"
                                    className="input"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                                <span className="icon is-small is-left">
                                    <i className="fa fa-user" />
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="field">
                            <label className="label">Email</label>
                            <div className="control has-icons-left">
                                <input
                                    type="email"
                                    className="input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <span className="icon is-small is-left">
                                    <i className="fa fa-envelope" />
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="field">
                            <label className="label">Password</label>
                            <div className="control has-icons-left">
                                <input
                                    type="password"
                                    className="input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <span className="icon is-small is-left">
                                    <i className="fa fa-lock" />
                                </span>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && <p className="has-text-danger">{error}</p>}

                        {/* Submit Button */}
                        <div className="field">
                            <button
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
