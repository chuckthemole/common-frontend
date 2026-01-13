import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * PortalContainer
 *
 * Creates a dedicated DOM node for rendering portal content.
 * Automatically appends to `document.body` and removes on unmount.
 *
 * Usage:
 * <PortalContainer>
 *   {(container) => container && <YourComponent portalTarget={container} />}
 * </PortalContainer>
 */
export default function PortalContainer({ id, children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        // Create a div to act as portal root
        const el = document.createElement("div");
        if (id) el.id = id;
        el.style.position = "absolute"; // optional, allows positioning
        el.style.top = "0";
        el.style.left = "0";
        el.style.width = "100%"; // optional, can override in dropdowns
        el.style.height = "0";   // optional
        el.style.zIndex = "11000"; // default z-index for dropdowns

        document.body.appendChild(el);
        setContainer(el);

        return () => {
            document.body.removeChild(el);
        };
    }, [id]);

    // Render children and pass container reference
    return children(container);
}
