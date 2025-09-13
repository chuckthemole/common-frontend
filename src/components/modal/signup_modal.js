import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import { EMPTY } from '../common';
import { isModalActive, modal_style, setModalActive, setModalInactive } from '../modal_manager';
import OAuth2ButtonGroup from '../oauth2';
import { useSignup } from '../hooks/use_signup';
import { useAuth } from '../auth_context';
import Spinner from '../ui/spinning_wheel';
import logger from '../../logger';

/**
 * SignupModal
 *
 * Reusable signup component with:
 * - Form-based signup
 * - Optional OAuth2 login buttons
 * - Trigger button with customizable text & style
 * - Redirect after successful signup
 *
 * Props:
 * - redirectTo (string): path to redirect after signup, default "/"
 * - buttonClassName (string): optional CSS class for trigger button, default "is-light is-success"
 * - buttonText (string|JSX.Element): optional trigger button text, default "Sign up"
 * - oauthProviders (array): optional OAuth providers, default ["google"]
 */
export default function SignupModal({
    redirectTo = "/",
    buttonClassName = "is-success",
    buttonText = "Sign up",
    oauthProviders = ["google"]
}) {
    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const { signup, loading, error } = useSignup({
        redirectTo,
        navigate,
        onSignup: () => {
            refreshAuth();
            setModalIsOpen(false);
            setModalInactive();
            clearInput();
        }
    });

    // Open modal if none active
    const openModal = () => {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    };

    // Close modal and reset inputs
    const closeModal = () => {
        setModalIsOpen(false);
        setModalInactive();
        clearInput();
    };

    const clearInput = () => {
        setUsername(EMPTY);
        setEmail(EMPTY);
        setPassword(EMPTY);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(username, email, password);
    };

    // Show loading while auth status is unresolved
    if (isLoading || isAuthenticated === undefined) {
        return <progress className="progress is-small is-primary" max="100">Loading...</progress>;
    }

    if (isAuthenticated) return null;

    return (
        <>
            {/* Trigger Button */}
            <button onClick={openModal} className={`signupBtn button ${buttonClassName}`}>
                {buttonText}
            </button>

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

                        {/* Submit + OAuth2 buttons inline */}
                        <div className="field is-flex is-align-items-center is-justify-content-space-between flex-wrap">
                            {/* Submit Button */}
                            <div className="control mb-2">
                                <button
                                    type="submit"
                                    className="button is-success"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size="16px" thickness="2px" color="#fff" /> : 'Submit'}
                                </button>
                            </div>

                            {/* TODO: NEED TO TEST AND WORK ON THIS OAuth2 Buttons */}
                            {/* <div className="control mb-2">
                                <OAuth2ButtonGroup
                                    providers={oauthProviders}
                                    layout="horizontal"
                                    size="medium"
                                    variant="filled"
                                    fullWidth={false}
                                    customEndpoints={{ google: '/auth/google/authorize' }}
                                    onAuthStart={() => logger.debug('OAuth started')}
                                    onAuthError={(err) => logger.error('OAuth error', err)}
                                />
                            </div> */}
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
