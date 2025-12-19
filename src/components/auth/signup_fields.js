import React from 'react';
import Spinner from '../ui/loaders/spinning_wheel';

/**
 * SignupFields
 *
 * Presentational signup form fields.
 * Meant to be used inside SignupTrigger / SignupModal.
 *
 * Props:
 * - username (string)
 * - email (string)
 * - password (string)
 * - confirmPassword (string) [optional, but recommended]
 * - setUsername (fn)
 * - setEmail (fn)
 * - setPassword (fn)
 * - setConfirmPassword (fn)
 * - error (string | null)
 * - loading (boolean)
 * - oauthProviders (array) [reserved for future use]
 */
export function SignupFields({
    username,
    email,
    password,
    confirmPassword,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    error,
    loading,
    oauthProviders = [],
}) {
    return (
        <>
            {/* Username */}
            <div className="field">
                <label className="label">Username</label>
                <div className="control has-icons-left">
                    <input
                        type="text"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
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
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <span className="icon is-small is-left">
                        <i className="fa fa-lock" />
                    </span>
                </div>
            </div>

            {/* Confirm Password (optional but recommended) */}
            {setConfirmPassword && (
                <div className="field">
                    <label className="label">Confirm Password</label>
                    <div className="control has-icons-left">
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <span className="icon is-small is-left">
                            <i className="fa fa-lock" />
                        </span>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="has-text-danger mb-3">
                    {error}
                </p>
            )}

            {/* Submit */}
            <div className="field">
                <div className="control">
                    <button
                        type="submit"
                        className="button is-success is-fullwidth"
                        disabled={loading}
                    >
                        {loading ? (
                            <Spinner size="16px" thickness="2px" color="#fff" />
                        ) : (
                            'Create account'
                        )}
                    </button>
                </div>
            </div>

            {/* OAuth2 buttons intentionally omitted here
                Keep this component pure and reusable.
                OAuth can live above/below this form if needed. */}
        </>
    );
}
