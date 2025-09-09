import React from "react";
import { ControlButtonBase } from "./base";
import "./styles/cartoon.css";

/**
 * Cartoon-style control button
 */
export default function ControlButtonCartoon(props) {
    return <ControlButtonBase {...props} className="cartoon-btn" />;
}
