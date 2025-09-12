import { useState, useEffect } from "react";

const defaultColors = {
    primary: "#8A4D76",
    link: "#FA7C91",
    background: "#ffffff",
    text: "#363636"
};

export function useColorSettings() {
    const [colors, setColors] = useState({
        primary: localStorage.getItem("primaryColor") || defaultColors.primary,
        link: localStorage.getItem("linkColor") || defaultColors.link,
        background: localStorage.getItem("backgroundColor") || defaultColors.background,
        text: localStorage.getItem("textColor") || defaultColors.text
    });

    const applyColors = (colorValues) => {
        Object.entries(colorValues).forEach(([key, value]) => {
            if (value) {
                document.documentElement.style.setProperty(`--${key}-color`, value);
            }
        });
    };

    // Apply colors whenever `colors` changes
    useEffect(() => {
        applyColors(colors);
        Object.entries(colors).forEach(([key, value]) => {
            localStorage.setItem(`${key}Color`, value);
        });
    }, [colors]);

    // Global initializer (call from App.js)
    const initColors = () => {
        const storedColors = {
            primary: localStorage.getItem("primaryColor"),
            link: localStorage.getItem("linkColor"),
            background: localStorage.getItem("backgroundColor"),
            text: localStorage.getItem("textColor")
        };
        applyColors(storedColors);
    };

    return { colors, setColors, initColors };
}
