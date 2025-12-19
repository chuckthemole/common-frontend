import React from "react";
import OAuth2ButtonGroup from "../oauth2";
import Spinner from "../ui/loaders/spinning_wheel";

export function LoginFields({
    username,
    password,
    setUsername,
    setPassword,
    error,
    loading,
    oauthProviders = ["google"],
}) {
    return (
        <>
            {/* Username */}
            <div className="field">
                <label className="label">Username</label>
                <input
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            {/* Password */}
            <div className="field">
                <label className="label">Password</label>
                <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {error && <p className="has-text-danger">{error}</p>}

            <div className="is-flex is-justify-content-space-between is-align-items-center">
                <button
                    type="submit"
                    className="button is-success"
                    disabled={loading}
                >
                    {loading ? <Spinner size="16px" /> : "Login"}
                </button>

                <OAuth2ButtonGroup providers={oauthProviders} />
            </div>
        </>
    );
}
