import React from 'react';
// import './Spinner.scss';

const Spinner = ({ size = '40px', color = '#00d1b2', thickness = '4px', className = '' }) => {
    const spinnerStyle = {
        width: size,
        height: size,
        borderWidth: thickness,
        borderTopColor: color,
    };

    return (
        <div className={`rumpus-spinner ${className}`} style={spinnerStyle}></div>
    );
};

export default Spinner;
