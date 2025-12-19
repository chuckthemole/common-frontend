import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import { EMPTY } from '../common';
import { isModalActive, modal_style, setModalActive, setModalInactive } from '../modal_manager';
import OAuth2ButtonGroup from '../oauth2';
import { useLogin } from '../hooks/use_login';
import Spinner from '../ui/loaders/spinning_wheel';
import { useAuth } from '../auth_context';
import logger from '../../logger';

/**
 * LoginModal
 *
 * Reusable login component with:
 * - Form-based login
 * - OAuth2 login
 * - Trigger button
 * - Redirect after successful login
 *
 * Props:
 * - redirectTo (string): path to redirect after login, default "/"
 * - buttonClassName (string): optional CSS class for trigger button, default "is-primary"
 * - buttonText (string): optional trigger button text, default "Login"
 * - oauthProviders (array): optional OAuth providers, default ["google"]
 */
export default function LoginModal({
    redirectTo = "/",
    buttonClassName = "is-primary",
    buttonText = "Login",
    oauthProviders = ["google"]
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { isLoading, isAuthenticated, refreshAuth } = useAuth();
    const navigate = useNavigate();

    const { login, loading, error } = useLogin({
        redirectTo,
        navigate,
        onLogin: () => {
            refreshAuth();
            setModalIsOpen(false);
            setModalInactive();
        }
    });

    const openModal = () => {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setModalInactive();
        clearInput();
    };

    const clearInput = () => {
        setUsername(EMPTY);
        setPassword(EMPTY);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    };

    if (isLoading || isAuthenticated === undefined) {
        return <progress className="progress is-small is-primary" max="100">Loading...</progress>;
    }

    if (isAuthenticated) return null;

    return (
        <>
            {/* Trigger button with customizable text and style */}
            <button onClick={openModal} className={`loginBtn button ${buttonClassName}`}>
                {buttonText}
            </button>

            {/* Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Login Modal"
            >
                <div className="modal-content">
                    <form onSubmit={handleSubmit} className="box">
                        {/* Username */}
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

                        {/* Password */}
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

                        {/* Error */}
                        {error && <p className="has-text-danger">{error}</p>}

                        {/* Submit + OAuth2 buttons inline */}
                        <div className="field is-flex is-align-items-center is-justify-content-space-between flex-wrap">
                            {/* Submit Button */}
                            <div className="control mb-2">
                                <button
                                    id="loginSubmit"
                                    type="submit"
                                    className="button is-success"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size="16px" thickness="2px" color="#fff" /> : 'Submit'}
                                </button>
                            </div>

                            {/* OAuth2 Buttons */}
                            <div className="control mb-2">
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
                            </div>
                        </div>

                    </form>
                </div>
            </Modal>
        </>
    );
}
