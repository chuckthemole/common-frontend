import React from "react";

/**
 * Structured Error Types for consistent classification
 */
export class ErrorType {
    static DEFAULT = new ErrorType("DEFAULT", "Something went wrong!");
    static NOT_FOUND = new ErrorType("NOT_FOUND", "Page not found.");
    static UNAUTHORIZED = new ErrorType("UNAUTHORIZED", "Unauthorized.");
    static FORBIDDEN = new ErrorType("FORBIDDEN", "Forbidden.");
    static BAD_REQUEST = new ErrorType("BAD_REQUEST", "Bad request.");
    static SERVER_ERROR = new ErrorType("SERVER_ERROR", "Server error.");
    static SERVICE_UNAVAILABLE = new ErrorType("SERVICE_UNAVAILABLE", "Service unavailable.");
    static GATEWAY_TIMEOUT = new ErrorType("GATEWAY_TIMEOUT", "Gateway timeout.");
    static UNKNOWN = new ErrorType("UNKNOWN", "Unknown error.");

    constructor(statusText, message) {
        this.statusText = statusText;
        this.message = message;
    }

    toString() {
        return `ErrorType.${this.statusText}: ${this.message}`;
    }
}