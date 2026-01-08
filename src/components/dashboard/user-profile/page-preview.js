import React, { useRef } from "react";
import SectionRenderer from "./section-renderer";

export default function PagePreview({ page }) {
    const containerRef = useRef(null);
    const ThemeLayout = THEME_LAYOUTS[page.theme] || DefaultLayout;

    return (
        <div
            ref={containerRef}
            className={`user-profile-preview theme-${page.theme}`}
        >
            <ThemeLayout page={page} containerRef={containerRef} />
        </div>
    );
}



/* ---------- Theme Layout Registry ---------- */

const THEME_LAYOUTS = {
    modern: ModernLayout,
    minimal: MinimalLayout,
    portfolio: PortfolioLayout,
};

/* ---------- Layouts ---------- */

function DefaultLayout({ page }) {
    return (
        <>
            <Nav page={page} />
            <Sections page={page} />
        </>
    );
}

function ModernLayout({ page, containerRef }) {
    return (
        <>
            <Nav page={page} containerRef={containerRef} />
            <main className="layout-modern">
                <Sections page={page} />
            </main>
        </>
    );
}

function MinimalLayout({ page, containerRef }) {
    return (
        <main className="layout-minimal">
            <Sections page={page} />
        </main>
    );
}

function PortfolioLayout({ page, containerRef }) {
    return (
        <div className="layout-portfolio">
            <aside className="sidebar">
                <HomeOnly page={page} />
                <Nav page={page} containerRef={containerRef} vertical />
            </aside>
            <main className="content">
                <Sections page={page} skip={["home"]} />
            </main>
        </div>
    );
}

/* ---------- Shared Pieces ---------- */

function Nav({ page, containerRef, vertical = false }) {
    const handleClick = (e, id) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container) return;

        const target = container.querySelector(`#${id}`);
        if (!target) return;

        target.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <nav className={`navbar tabs ${vertical ? "is-vertical" : "is-centered"} mb-5`}>
            <ul>
                {page.sections
                    .filter((s) => s.enabled)
                    .map((s) => (
                        <li key={s.id} >
                            <a href={`#${s.id}`} onClick={(e) => handleClick(e, s.id)}>
                                {/* Use the editable title if it exists */}
                                {s.title || s.type}
                            </a>
                        </li>
                    ))}
            </ul>
        </nav>
    );
}

function Sections({ page, skip = [] }) {
    return page.sections
        .filter((s) => s.enabled && !skip.includes(s.id))
        .map((s) => (
            <section key={s.id} id={s.id} className={`section-${s.type}`}>
                <SectionRenderer section={s} />
            </section>
        ));
}

function HomeOnly({ page }) {
    const home = page.sections.find((s) => s.id === "home" && s.enabled);
    return home ? (
        <section className="section-home">
            <SectionRenderer section={home} />
        </section>
    ) : null;
}
