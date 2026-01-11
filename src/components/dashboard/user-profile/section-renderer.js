import React from "react";

export default function SectionRenderer({ section }) {
    return (
        <div className={`section-content section-${section.type}`}>
            {/* Section title conditionally rendered */}
            {section.showTitle && section.title && (
                <h2 className="section-header">{section.title}</h2>
            )}

            {section.type === "home" && (
                <div className="has-text-centered">
                    {section.data.profileImage && (
                        <img
                            src={section.data.profileImage}
                            alt=""
                            style={{ borderRadius: "50%", maxWidth: "150px" }}
                        />
                    )}
                    <h1 className="title">{section.data.name || "Your Name"}</h1>
                    <p className="subtitle">{section.data.tagline}</p>
                </div>
            )}

            {section.type === "about" && (
                <div
                    className="content"
                    dangerouslySetInnerHTML={{
                        __html: section.data.content || "<p>Your bio goes here…</p>",
                    }}
                />
            )}

            {section.type === "projects" && (
                <ProjectsRenderer data={section.data} />
            )}

            {section.type === "contact" && (
                <p>
                    Contact:{" "}
                    <a href={`mailto:${section.data.email}`}>
                        {section.data.email}
                    </a>
                </p>
            )}
        </div>
    );
}

function ProjectsRenderer({ data }) {
    const {
        items = [],
        layout = "grid",
        itemsPerPage = 3,
    } = data;

    const [page, setPage] = React.useState(0);

    const maxPage = Math.max(
        0,
        Math.ceil(items.length / itemsPerPage) - 1
    );

    const visibleItems = items;

    if (layout === "grid") {
        return (
            <div className="columns is-multiline">
                {items.map(renderProject)}
            </div>
        );
    }

    return (
        <div className="projects-carousel">
            <button
                className="carousel-arrow left"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                aria-label="Previous projects"
            >
                ←
            </button>

            <div className="carousel-viewport">
                <div className="carousel-track columns"
                    style={{
                        transform: `translateX(-${page * 100}%)`
                    }}>
                    {visibleItems.map(renderProject)}
                </div>
            </div>

            <button
                className="carousel-arrow right"
                disabled={page === maxPage}
                onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                aria-label="Next projects"
            >
                →
            </button>
        </div>
    );
}

function renderProject(p, i) {
    return (
        <div key={i} className="column is-4">
            <div className="box">
                <strong>{p.title || "Untitled Project"}</strong>
                <br />
                {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer">
                        {p.link}
                    </a>
                )}
            </div>
        </div>
    );
}
