import React from "react";

export default function SectionRenderer({ section }) {
    switch (section.type) {
        case "hero":
            return (
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
            );

        case "about":
            return (
                <div
                    className="content"
                    dangerouslySetInnerHTML={{
                        __html: section.data.content || "<p>Your bio goes here…</p>",
                    }}
                />
            );

        case "projects":
            return (
                <div className="columns is-multiline">
                    {section.data.items.map((p, i) => (
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
                    ))}
                </div>
            );

        case "contact":
            return (
                <p>
                    Contact:{" "}
                    <a href={`mailto:${section.data.email}`}>
                        {section.data.email}
                    </a>
                </p>
            );

        default:
            return null;
    }
}
