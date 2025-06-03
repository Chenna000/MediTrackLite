import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./../css/Homepage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="https://cdn-icons-png.flaticon.com/512/3771/3771518.png" alt="logo" />
            MediTrack Lite
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item"><a className="nav-link" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" onClick={() => navigate('/login')}>Login</a></li>
              <li className="nav-item"><a className="nav-link" onClick={() => navigate('/register')}>Register</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Quote Section */}
      <div className="quote">
        <h2>"Empowering healthcare with technology – fast, secure, and reliable!"</h2>
        <p className="mt-3">Your health in your hands, simplified for everyone</p>
      </div>

      {/* Feature Cards */}
      <div className="card-container container">
        <div className="info-card">
          <h5>For Patients</h5>
          <p>Easy appointment tracking, secure data, and real-time updates. Designed for all literacy levels with intuitive icons and simple language.</p>
        </div>
        <div className="info-card">
          <h5>For Doctors</h5>
          <p>Instant access to patient data, secure login, and efficient workflow management. Spend more time with patients, less with paperwork.</p>
        </div>
        {/* <div className="info-card">
          <h5>Simple Interface</h5>
          <p>User-friendly UI tailored for everyone – from rural patients to tech-savvy professionals. Available in multiple languages.</p>
        </div> */}
      </div>

      {/* About Us */}
      <div className="footer-section" id="about">
        <h3>About Us</h3>
        <p>
          MediTrack Lite is a healthcare platform that bridges the gap between patients and doctors by offering an easy-to-use,
          secure system to manage health data, appointments, and communication. Our mission is to make healthcare management
          accessible to everyone, regardless of technical literacy.
        </p>
      </div>

      {/* Contact Us */}
      <div className="footer-section" id="contact">
        <h3>Contact Us</h3>
        <p>Email: support@meditrack.local</p>
        <p>Phone: +91-6281185068</p>
        <p>Address: 123 MediTrack Street, Bangalore, India</p>
      </div>

      {/* Social Footer */}
      <div className="social-footer">
        <p>Follow Us:</p>
        <a href="https://github.com/your-profile" target="_blank" rel="noopener noreferrer"><i className="bi bi-github"></i></a>
        <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin"></i></a>
        <a href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer"><i className="bi bi-twitter"></i></a>
        <p className="mt-3">&copy; 2025 MediTrack Lite. All rights reserved.</p>
      </div>
    </div>
  );
};

export default HomePage;