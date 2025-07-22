import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { getApi } from '../api';

export async function loader({ params }) {
    const api = getApi();
    try {
        const response = await api.get(`/api/profile/${params.user_name}`);
        return response.data;
    } catch (error) {
        const err = new Error('Failed to load profile.');
        err.status = error.response?.status || 500;
        err.info = error.response?.data || null;
        throw err;
    }
}

export default function Landing() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero is-primary is-fullheight-with-navbar">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title is-size-1">Your Name</h1>
                        <h2 className="subtitle is-size-4">Software Engineer | Developer | Designer</h2>
                        <div className="buttons is-centered mt-4">
                            <a className="button is-light" href="#projects">View Projects</a>
                            <a className="button is-info" href="#contact">Contact Me</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section" id="about">
                <div className="container content">
                    <h3 className="title is-3">About Me</h3>
                    <p>
                        I'm a passionate software engineer with experience in building web applications using modern tools like React, Node.js, Java, and more.
                        I enjoy turning complex problems into simple, beautiful, and intuitive designs.
                    </p>
                </div>
            </section>

            {/* Projects Section */}
            <section className="section has-background-light" id="projects">
                <div className="container">
                    <h3 className="title is-3">Projects</h3>
                    <div className="columns is-multiline">
                        {/* Sample Project Card */}
                        <div className="column is-one-third">
                            <div className="card">
                                <div className="card-content">
                                    <p className="title is-5">Project Title</p>
                                    <p className="subtitle is-6">A short description of what the project is and what technologies were used.</p>
                                </div>
                                <footer className="card-footer">
                                    <a href="https://github.com/your-github/project" className="card-footer-item" target="_blank" rel="noopener noreferrer">GitHub</a>
                                </footer>
                            </div>
                        </div>

                        {/* Add more project cards here */}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section" id="contact">
                <div className="container has-text-centered">
                    <h3 className="title is-3">Get In Touch</h3>
                    <p>If you'd like to connect or collaborate, feel free to reach out.</p>
                    <div className="buttons is-centered mt-4">
                        <a href="mailto:your@email.com" className="button is-primary">
                            <FontAwesomeIcon icon={faEnvelope} />&nbsp; Email
                        </a>
                        <a href="https://github.com/your-github" target="_blank" className="button is-dark" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faGithub} />&nbsp; GitHub
                        </a>
                        <a href="https://linkedin.com/in/your-linkedin" target="_blank" className="button is-link" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faLinkedin} />&nbsp; LinkedIn
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer has-background-white">
                <div className="content has-text-centered">
                    <p>
                        &copy; {new Date().getFullYear()} Your Name. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
