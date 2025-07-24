import React from "react";

const DashboardTemplate = ({ layout = [] }) => {
    return (
        <div className="container mt-5">
            {layout.map((row, rowIndex) => (
                <div className="columns is-multiline is-flex is-align-items-stretch mb-4" key={`row-${rowIndex}`}>
                    {row.map((item, colIndex) => {
                        const colSpan = item.colSpan || 4;
                        const height = item.rowSpan ? 200 * item.rowSpan : 200; // each "row" = 200px

                        return (
                            <div className={`column is-${colSpan}`} key={`col-${colIndex}`}>
                                <div className="box" style={{ height }}>
                                    {item.component}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default DashboardTemplate;
