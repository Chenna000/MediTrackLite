import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/DoctorHome.css';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

const DoctorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [toast, setToast] = useState('');

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeoutRef = useRef(null);

  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleLogout(true);
      alert('Session expired due to inactivity');
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
      clearTimeout(timeoutRef.current);
      window.onpopstate = null;
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/api/auth/me');
        if (res.data.role !== 'DOCTOR') {
          navigate('/login');
        } else {
          setUser(res.data);
          //document.title = `Doctor - ${res.data.name}`;
          loadAppointments(res.data.email);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const loadAppointments = async (email) => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        API.get('/appointments/doctor/pending', { params: { email } }),
        API.get('/appointments/doctor/accepted', { params: { email } }),
      ]);
      setPending(pendingRes.data);
      setAccepted(acceptedRes.data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, null, { params: { status } });
      setToast(`Appointment ${status.toLowerCase()} successfully.`);
      loadAppointments(user.email);
    } catch (err) {
      console.error('Status update error:', err);
      setToast('Failed to update status.');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleProfileClick = async () => {
    setShowProfile(true);
    if (!profile && !profileError) {
      try {
        const res = await API.get('/api/auth/profile');
        if (typeof res.data === 'string') setProfileError(res.data);
        else setProfile(res.data);
      } catch (err) {
        console.error(err);
        setProfileError('Failed to fetch profile');
      }
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword || !confirmNewPassword) return setError('All fields required.');
    if (newPassword !== confirmNewPassword) return setError('Passwords do not match.');

    try {
      await API.post('/api/auth/change-password', { oldPassword, newPassword });
      setSuccess('Password changed. Please login again.');
      handleCloseChangePassword();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to change password');
    }
  };

  const handleLogout = async (auto = false) => {
    try {
      await API.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      if (auto) alert('Session expired');
      navigate('/login');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="doctor-container">
      <div className="navbar">
        <div>Welcome Dr. {user?.name}</div>
        <div className="nav-actions">
          <button onClick={handleProfileClick}>👤 Profile</button>
          <button onClick={handleOpenChangePassword}>🔒 Change Password</button>
          <button onClick={() => handleLogout(false)}>🚪 Logout</button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

    <div className="appointments-container">
      <div className="appointments-section">
        <h3>🕒 Pending Appointments</h3>
        {pending.length === 0 ? (
  <p>No pending appointments.</p>
) : (
  [...pending]
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.appointmentDate} ${a.slot}`);
      const dateTimeB = new Date(`${b.appointmentDate} ${b.slot}`);
      return dateTimeB - dateTimeA;
    })
    .map((a) => (
      <div key={a.id} className="appt-card">
        <p><strong>{a.appointmentDate} @ {a.slot}</strong></p>
        <p>Appointment ID: {a.id}</p>
        <p>Patient: {a.patientEmail.split("@")[0]}</p>
        <p>Reason: {a.problemDescription}</p>
        <button onClick={() => handleStatus(a.id, 'ACCEPTED')}>✔ Accept</button>
        <button className="reject-btn" onClick={() => handleStatus(a.id, 'REJECTED')}>✘ Reject</button>
      </div>
    ))
)}
      </div>

      <div className="appointments-section">
        <h3>✅ Accepted Appointments</h3>
        {accepted.length === 0 ? (
  <p>No accepted appointments.</p>
) : (
  [...accepted]
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.appointmentDate} ${a.slot}`);
      const dateTimeB = new Date(`${b.appointmentDate} ${b.slot}`);
      return dateTimeB - dateTimeA;
    })
    .map((a) => (
      <div key={a.id} className="appt-card accepted">
        <p><strong>{a.appointmentDate} @ {a.slot}</strong></p>
        <p>Patient: {a.patientEmail.split("@")[0]}</p>
        <button onClick={() => navigate(`/print/${a.id}`)}>🖨️ Print</button>
      </div>
    ))
)}
      </div>
      </div>

      {showProfile && (
        <div className="profile-modal">
          <div className="profile-content">
            <button onClick={handleCloseProfile}>X</button>
            <h3>Profile</h3>
            {profileError && <p className="modal-error">{profileError}</p>}
            {profile ? (
              <>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </>
            ) : <p>Loading...</p>}
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="modal-overlay" onClick={handleCloseChangePassword}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseChangePassword}>&times;</button>
            <h3>Change Password</h3>
            {error && <p className="modal-error">{error}</p>}
            {success && <p className="modal-success">{success}</p>}
            <form onSubmit={handleChangePassword}>
              <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
              <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <input type="password" placeholder="Confirm Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
              <button type="submit" className="modal-submit-btn">Update Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHome;
