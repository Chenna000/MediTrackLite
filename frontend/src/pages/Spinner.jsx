// src/components/SpinnerWithText.jsx
import React from 'react';
import './../css/Spinner.css';

const Spinner = ({ message = 'Loading...' }) => (
  <div className="spinner-overlay">
    <div className="spinner"></div>
    <p className="spinner-text">{message}</p>
  </div>
);

export default Spinner;
