import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerViewer = ({ specUrl }) => {
    return (
        <section className="section">
            <div className="container">
                <div className="box">
                    <h1 className="title is-3 has-text-centered">API Documentation</h1>
                    <SwaggerUI url={specUrl} />
                </div>
            </div>
        </section>
    );
};

export default SwaggerViewer;
