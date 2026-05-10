import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * -----------------------------------------------------------------------------
 * TransitionRender
 * -----------------------------------------------------------------------------
 *
 * Controls:
 *  - delayed mount
 *  - entrance animations (fade / slide / scale)
 *
 * This is a lightweight alternative to framer-motion.
 *
 * Good for:
 *  - page transitions
 *  - modal entry animations
 *  - dashboard UI polish
 * -----------------------------------------------------------------------------
 */

const TRANSITIONS = {
    fade: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },

    slideUp: {
        from: {
            opacity: 0,
            transform: "translateY(10px)",
        },
        to: {
            opacity: 1,
            transform: "translateY(0px)",
        },
    },

    scale: {
        from: {
            opacity: 0,
            transform: "scale(0.98)",
        },
        to: {
            opacity: 1,
            transform: "scale(1)",
        },
    },
};

export default function TransitionRender({
    children,
    delay = 0,
    duration = 200,
    type = "fade",
    easing = "ease",
}) {
    const [mounted, setMounted] =
        useState(false);

    const [visible, setVisible] =
        useState(false);

    /**
     * Step 1: delay mount
     */
    useEffect(() => {
        const t = setTimeout(() => {
            setMounted(true);
        }, delay);

        return () => clearTimeout(t);
    }, [delay]);

    /**
     * Step 2: trigger animation
     */
    useEffect(() => {
        if (mounted) {
            requestAnimationFrame(() => {
                setVisible(true);
            });
        }
    }, [mounted]);

    if (!mounted) return null;

    const transition = TRANSITIONS[type] || TRANSITIONS.fade;

    return (
        <div
            style={{
                transition: `all ${duration}ms ${easing}`,
                ...transition.from,
                ...(visible ? transition.to : {}),
            }}
        >
            {children}
        </div>
    );
}

TransitionRender.propTypes = {
    children: PropTypes.node,
    delay: PropTypes.number,
    duration: PropTypes.number,
    type: PropTypes.oneOf([
        "fade",
        "slideUp",
        "scale",
    ]),
    easing: PropTypes.string,
};