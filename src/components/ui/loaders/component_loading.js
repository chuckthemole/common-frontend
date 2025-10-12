import React, { useEffect, useState } from "react";

/**
 * ComponentLoading
 *
 * A creative and flexible loading component supporting:
 *  - Text-based loading
 *  - Indeterminate animated bars
 *  - Real progress (0–100%)
 *  - Fun variants (pulse, wave, rainbow)
 *
 * Props:
 * - type: "progress" | "text" (default: "progress")
 * - color: string | string[]  (e.g. "is-info" or ["is-info", "is-danger"])
 * - size: "small" | "medium" | "large" (default: "medium")
 * - message: Text for "text" type (default: "Loading...")
 * - progress: number | null (null = indeterminate mode)
 * - bars: number (default: 4)
 * - variant: "default" | "pulse" | "wave" | "rainbow" (default: "default")
 */
const ComponentLoading = ({
    type = "progress",
    color = "is-info",
    size = "medium",
    message = "Loading...",
    progress = null,
    bars = 4,
    variant = "rainbow",
}) => {
    /** Normalize color(s) for Bulma compatibility */
    const normalizeColor = (c) => (c.startsWith("is-") ? c : `is-${c}`);
    const colorList = Array.isArray(color)
        ? color.map(normalizeColor)
        : [normalizeColor(color)];

    /** TEXT MODE **/
    if (type === "text") {
        return (
            <div
                style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#4a4a4a",
                    textAlign: "center",
                }}
            >
                {message}
                <span className="loading-dots">...</span>
            </div>
        );
    }

    /** ANIMATED PLACEHOLDER BAR **/
    const AnimatedProgress = ({ color, size, delay = 0 }) => {
        const [fakeValue, setFakeValue] = useState(0);

        useEffect(() => {
            const interval = setInterval(() => {
                setFakeValue((v) => (v >= 100 ? 0 : v + 5));
            }, 120);
            return () => clearInterval(interval);
        }, []);

        // Choose visual style based on variant
        const styles = {
            default: {},
            pulse: {
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${delay}s`,
            },
            wave: {
                animation: "wave 1.5s ease-in-out infinite",
                animationDelay: `${delay}s`,
            },
            rainbow: {
                background:
                    "linear-gradient(90deg, #ff3860, #ffdd57, #23d160, #3273dc, #b86bff)",
                backgroundSize: "400% 100%",
                animation: "rainbowMove 3s linear infinite",
                height:
                    size === "large" ? "1.25rem" : size === "small" ? "0.5rem" : "0.75rem",
                borderRadius: "6px",
                border: "none",
            },
        };

        // rainbow variant doesn’t use <progress>, it’s a styled div
        if (variant === "rainbow") {
            return <div style={{ ...styles.rainbow }} />;
        }

        return (
            <progress
                className={`progress ${normalizeColor(color)} is-${size}`}
                value={fakeValue}
                max="100"
                style={{
                    transition: "width 0.3s ease",
                    ...styles[variant],
                }}
            >
                Loading
            </progress>
        );
    };

    /** REAL PROGRESS BAR **/
    const RealProgress = ({ color, size, value }) => (
        <progress
            className={`progress ${normalizeColor(color)} is-${size}`}
            value={Math.min(Math.max(value, 0), 100)}
            max="100"
        >
            {value}%
        </progress>
    );

    /** RENDER LOGIC **/
    if (type === "progress") {
        if (typeof progress === "number") {
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <RealProgress color={colorList[0]} size={size} value={progress} />
                </div>
            );
        }

        // Animated placeholder bars
        const placeholderBars = Array.from({ length: bars }).map((_, idx) => {
            const c = colorList[idx % colorList.length];
            return (
                <AnimatedProgress
                    key={idx}
                    color={c}
                    size={size === "large" ? "medium" : size}
                    delay={idx * 0.2}
                />
            );
        });

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    position: "relative",
                }}
            >
                {placeholderBars}
            </div>
        );
    }

    return null;
};

/** Add CSS animations globally (or import them into your global stylesheet) */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scaleY(0.95); }
  50% { opacity: 1; transform: scaleY(1); }
}

@keyframes wave {
  0% { transform: translateX(-10%); opacity: 0.6; }
  50% { transform: translateX(10%); opacity: 1; }
  100% { transform: translateX(-10%); opacity: 0.6; }
}

@keyframes rainbowMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.loading-dots::after {
  content: "";
  animation: dots 1.5s steps(5, end) infinite;
}

@keyframes dots {
  0%, 20% { content: ""; }
  40% { content: "."; }
  60% { content: ".."; }
  80%, 100% { content: "..."; }
}
`;
document.head.appendChild(styleSheet);

export default ComponentLoading;
