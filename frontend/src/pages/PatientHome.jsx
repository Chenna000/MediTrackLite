import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/PatientHome.css';

const PatientHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  let timeout;

  //  Fetch user info securely using session cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/auth/me', {
          withCredentials: true
        });
        if (res.data.role !== 'PATIENT') {
          navigate('/login');
        } else {
          setUser(res.data);
        }
      } catch (err) {
        console.error('User session invalid or expired', err);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  //  Auto logout after 5 minutes of inactivity
  const resetInactivityTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      handleLogout(true);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    resetInactivityTimer();

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => window.history.go(1);

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      clearTimeout(timeout);
      window.onpopstate = null;
    };
  }, []);

  // Handle logout
  const handleLogout = async (auto = false) => {
    try {
      await axios.post('http://localhost:8080/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      if (auto) alert('Session expired due to inactivity');
      navigate('/login');
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/change-password', {
        oldPassword,
        newPassword
      }, { withCredentials: true });

      setSuccess('Password changed successfully');
      handleCloseChangePassword();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to change password');
    }
  };

  const handleCloseProfile = () => setShowProfile(false);
  const handleOpenChangePassword = () => {
    setShowChangePassword(true);
    setError('');
    setSuccess('');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };
  const handleCloseChangePassword = () => setShowChangePassword(false);

  return (
    <div className="patient-container">
      <div className="patient-card">
        <h2>Welcome, Patient</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <button className="logout-btn" onClick={() => handleLogout(false)}>Logout</button>
        <button className="profile-btn" onClick={() => setShowProfile(true)} style={{ marginLeft: '10px' }}>
          👤 Profile
        </button>
        <button className="change-password-btn" onClick={handleOpenChangePassword} style={{ marginLeft: '10px',marginTop: '10px' }}>
          Change Password
        </button>
      </div>

      {showProfile && (
        <div className="profile-modal">
          <div className="profile-content">
            <button onClick={handleCloseProfile} style={{ float: 'right' }}>X</button>
            <h3>Profile</h3>
            {user ? (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        </div>
      )}

      {showChangePassword && (
  <div className="modal-overlay" onClick={handleCloseChangePassword}>
    <div className="modal-container" onClick={e => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={handleCloseChangePassword} aria-label="Close">
        &times;
      </button>
      <h3>Change Password</h3>

      {error && <p className="modal-error">{error}</p>}
      {success && <p className="modal-success">{success}</p>}

      <form onSubmit={handleChangePassword} className="modal-form">
        <label>
          Old Password
          <input
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="modal-submit-btn">
          Change Password
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default PatientHome;
