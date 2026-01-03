import React from "react";

import SectionRenderer from './section-renderer';

export default function PagePreview({ page }) {
    return (
        <div className={`user-profile-preview theme-${page.theme}`}>
            <nav className="tabs is-centered mb-5">
                <ul>
                    {page.sections
                        .filter((s) => s.enabled)
                        .map((s) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`}>{s.type}</a>
                            </li>
                        ))}
                </ul>
            </nav>

            {page.sections
                .filter((s) => s.enabled)
                .map((s) => (
                    <section key={s.id} id={s.id} className={s.type}>
                        <SectionRenderer section={s} />
                    </section>
                ))}
        </div>
    );
}
