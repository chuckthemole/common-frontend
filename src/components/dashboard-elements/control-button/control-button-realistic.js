import React from "react";
import { ControlButtonBase } from "./base";
import "./styles/realistic.css";

/**
 * Realistic-style control button
 */
export default function ControlButtonRealistic(props) {
    return <ControlButtonBase {...props} className="realistic-btn" />;
}
