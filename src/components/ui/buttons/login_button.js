// components/LoginButton.jsx
import React from 'react';
import { setModalActive, isModalActive } from '../../modal_manager';

export default function LoginButton({ label = "Login", className = "button is-light" }) {
    return (
        <button
            onClick={() => {
                if (!isModalActive()) {
                    setModalActive();
                }
            }}
            className={className}
        >
            {label}
        </button>
    );
}
