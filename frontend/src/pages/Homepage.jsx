import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import './../css/HomePage.css';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <div className="homepage-container">
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
        <Link to="/"><img src="images/meditracklogo.png" alt="Health Illustration" /></Link> 
        </div>

        {/* Hamburger icon visible only on mobile */}
        <button className="hamburger" onClick={toggleMenu}>
          &#9776;
        </button>

        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>


      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MediTrack Lite</h1>
          <p>Track your prescriptions and appointments with ease & security.</p>
          <a href="/register" className="cta-button">Get Started</a>
        </div>
        <div className="hero-image">
         
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Core Features</h2>
        <div className="features">
          <div className="feature-card">
            <h3>Role-Based Access</h3>
            <p>Separate dashboards for Doctors & Patients, with secure login.</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Scheduling</h3>
            <p>Book, view, and manage appointments instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Prescription Tracker</h3>
            <p>Access past prescriptions anytime from your account.</p>
          </div>
        </div>
      </section>

    {/* How MediTrack Helps You – Stylish Cards */}
<section className="meditrack-help-section">
  <h2 className="section-title">How MediTrack Helps You</h2>
  <div className="help-cards">
    <div className="help-card">
      <img src="https://cdn-icons-png.flaticon.com/512/295/295128.png" alt="Book Appointments" />
      <h3>📅 Book Appointments</h3>
      <p>Choose from available slots and consult verified doctors quickly.</p>
    </div>
    <div className="help-card">
      <img src="https://cdn-icons-png.flaticon.com/512/4697/4697246.png" alt="Track Prescriptions" />
      <h3>💊 Track Prescriptions</h3>
      <p>Instant access to your medical prescriptions — organized and secure.</p>
    </div>
    <div className="help-card">
      <img src="https://cdn-icons-png.flaticon.com/512/3460/3460320.png" alt="Secure Data" />
      <h3>🔒 Secure Health Data</h3>
      <p>Your personal health records are protected with top-grade encryption.</p>
    </div>
  </div>
</section>

{/* How It Works - Enhanced */}
<section className="how-it-works-enhanced">
  <h2 className="section-title">How It Works</h2>
  <div className="how-steps">
    <div className="how-step-card">
      <span className="step-number">1</span>
      <h4>Register</h4>
      <p>Create your account as a Doctor or Patient with a valid email.</p>
    </div>
    <div className="how-step-card">
      <span className="step-number">2</span>
      <h4>Login</h4>
      <p>Access your dashboard securely and start using features tailored to your role.</p>
    </div>
    <div className="how-step-card">
      <span className="step-number">3</span>
      <h4>Manage Health</h4>
      <p>Patients can book appointments and view prescriptions. Doctors manage visits and reports.</p>
    </div>
  </div>
</section>


      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq">
          <div className="faq-item">
            <h4>Is MediTrack Lite free to use?</h4>
            <p>Yes, it’s completely free for patients. Doctors can sign up as well.</p>
          </div>
          <div className="faq-item">
            <h4>How secure is my data?</h4>
            <p>We use modern security protocols including encryption and session control.</p>
          </div>
          <div className="faq-item">
            <h4>Can I reschedule appointments?</h4>
            <p>Yes! Patients can request a new time if available.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials">
          <div className="testimonial-card">
            <p>“MediTrack Lite helped me book appointments for my parents easily!”</p>
            <h4>– Priya, Daughter</h4>
          </div>
          <div className="testimonial-card">
            <p>“I love how I can track my patient’s history without digging papers.”</p>
            <h4>– Dr. Arjun Rao</h4>
          </div>
          <div className="testimonial-card">
            <p>“The interface is simple and clean. Perfect for elders too.”</p>
            <h4>– Ravi, Patient</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <p>© 2025 MediTrack Lite | Made with ❤️ for healthcare</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
