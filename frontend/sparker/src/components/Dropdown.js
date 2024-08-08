// Dropdown.js
import React from 'react';

const Dropdown = ({ options }) => {
    return (
        <div className="dropdown">
            {options.map((option, index) => (
  <button key={index} className="dropdown-button" onClick={option.action}>
    {option.label}
  </button>
))}
        </div>
    );
};

export default Dropdown;
