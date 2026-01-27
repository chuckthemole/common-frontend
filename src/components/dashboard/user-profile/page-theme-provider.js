import React from "react";

export function PageThemeProvider({
    colorSettings,
    fontSettings,
    children
}) {
    const style = {
        ...(colorSettings &&
            Object.fromEntries(
                Object.entries(colorSettings).map(([k, v]) => [`--color-${k}`, v])
            )),
        ...(fontSettings?.body && { "--font-body": fontSettings.body }),
        ...(fontSettings?.heading && { "--font-heading": fontSettings.heading }),
    };

    return (
        <div className="page-theme-scope" style={style}>
            {children}
        </div>
    );
}
