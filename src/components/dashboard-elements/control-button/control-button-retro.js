import React from "react";
import { ControlButtonBase } from "./base";
import "./styles/retro.css";

/**
 * Retro-style control button
 */
export default function ControlButtonRetro(props) {
    return <ControlButtonBase {...props} className="retro-btn" />;
}
