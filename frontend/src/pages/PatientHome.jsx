import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/PatientHome.css';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

const STATUS_LIST = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const PatientHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookForm, setBookForm] = useState({
    doctorEmail: '',
    doctorName: '',
    slot: '',
    phoneNo: '',
    problemDescription: '',
  });
  const [bookMsg, setBookMsg] = useState('');

  // Profile & Password modal state
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setError] = useState('');
  const [passwordSuccess, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  let timeout;

  // Fetch logged-in user details
  const fetchUser = async () => {
    try {
      const res = await API.get('/api/auth/me', { withCredentials: true });
      if (res.data.role !== 'PATIENT') navigate('/login');
      setUser(res.data);
      fetchAppointments(res.data.email);
    } catch (err) {
      console.error('User session invalid or expired', err);
      navigate('/login');
    }
  };

  const fetchAppointments = async (email) => {
    try {
      const res = await API.get('/appointments/patient', {
        params: { email },
      });
      const sorted = res.data.sort(
        (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
      );
      setAppointments(sorted);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  // Fetch specializations when date is selected
  useEffect(() => {
    if (!date) {
      setSpecializations([]);
      setSelectedSpecialization('');
      setDoctors([]);
      setBookForm((prev) => ({
        ...prev,
        doctorEmail: '',
        doctorName: '',
        slot: '',
      }));
      return;
    }
    API.get('/appointments/specializations')
      .then((res) => setSpecializations(res.data))
      .catch(() => setSpecializations([]));
    setSelectedSpecialization('');
    setDoctors([]);
    setBookForm((prev) => ({
      ...prev,
      doctorEmail: '',
      doctorName: '',
      slot: '',
    }));
  }, [date]);

  // Fetch doctors when specialization is selected
  useEffect(() => {
    if (!date || !selectedSpecialization) {
      setDoctors([]);
      setBookForm((prev) => ({
        ...prev,
        doctorEmail: '',
        doctorName: '',
        slot: '',
      }));
      return;
    }
    API.get('/appointments/doctorsdata', {
      params: { specialization: selectedSpecialization, date },
    })
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]));
    setBookForm((prev) => ({
      ...prev,
      doctorEmail: '',
      doctorName: '',
      slot: '',
    }));
  }, [date, selectedSpecialization]);

  // Fetch slots when doctor is selected
  useEffect(() => {
    if (!date || !bookForm.doctorEmail) return setSlots([]);
    API.get('/appointments/available-slots', {
      params: { date, doctorEmail: bookForm.doctorEmail },
    })
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]));
  }, [date, bookForm.doctorEmail]);

  // Booking handler
  const handleBook = async (e) => {
    e.preventDefault();
    setBookMsg('');
    const { doctorEmail, doctorName, slot, phoneNo, problemDescription } = bookForm;
    if (!date || !selectedSpecialization || !doctorEmail || !slot || !problemDescription.trim()) {
      setBookMsg('All fields are required.');
      return;
    }

    try {
      const res = await API.post('/appointments', {
        doctorEmail,
        doctorName,
        slot,
        phoneNo,
        problemDescription,
        appointmentDate: date,
        specialization: selectedSpecialization,
        patientEmail: user.email,
      });
      setBookMsg(res.data);
      fetchAppointments(user.email);
      setDate('');
      setSelectedSpecialization('');
      setBookForm({
        doctorEmail: '',
        doctorName: '',
        slot: '',
        phoneNo: '',
        problemDescription: '',
      });
    } catch (err) {
      setBookMsg(err.response?.data || 'Something went wrong. Please try again.');
    }
  };

  // Inactivity logout & back prevention
  useEffect(() => {
    fetchUser();

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout(true);
        alert('Logged out due to inactivity.');
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => window.history.go(1);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timeout);
      window.onpopstate = null;
    };
    // eslint-disable-next-line
  }, []);

  const handleLogout = async (auto = false) => {
    try {
      await API.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout failed');
    } finally {
      if (auto) alert('Session expired due to inactivity');
      navigate('/login');
    }
  };

  const handleProfileClick = async () => {
    setShowProfile(true);
    try {
      const res = await API.get('/api/auth/profile');
      setProfile(res.data);
    } catch (err) {
      setProfileError('Failed to fetch profile');
    }
  };

  const handleOpenChangePassword = () => {
    setShowChangePassword(true);
    setError('');
    setSuccess('');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Password change handler
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
      await API.post(
        '/api/auth/change-password',
        { oldPassword, newPassword }
      );
      setSuccess('Password changed successfully. Redirecting to login...');
      setShowChangePassword(false);
      alert('Password changed successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to change password');
    }
  };

  const handleCloseChangePassword = () => setShowChangePassword(false);

  // Filter appointments by selected status
  const filteredAppointments = appointments.filter(appt =>
    selectedStatus === 'ALL' ? true : appt.status === selectedStatus
  );

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-title">Welcome - Mr. {user?.name}</div>
        <div className="navbar-buttons">
          <button onClick={handleProfileClick}>Profile</button>
          <button onClick={handleOpenChangePassword}>Change Password</button>
          <button onClick={() => handleLogout(false)}>Logout</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="patient-container">
        {/* Left: Booking Section */}
        <div className="booking-section">
          <h2>Book Appointment</h2>
          <form onSubmit={handleBook} className="booking-form">
            <div className="form-row">
              <label>Date:</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>Specialization:</label>
              <select
                value={selectedSpecialization}
                onChange={e => setSelectedSpecialization(e.target.value)}
                required
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Doctor:</label>
              <select
                value={
                  bookForm.doctorEmail && bookForm.doctorName
                    ? `${bookForm.doctorEmail}|${bookForm.doctorName}`
                    : ''
                }
                onChange={(e) => {
                  const [email, name] = e.target.value.split('|');
                  setBookForm((prev) => ({
                    ...prev,
                    doctorEmail: email,
                    doctorName: name,
                    slot: '',
                  }));
                }}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.email} value={`${doc.email}|${doc.name}`}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Slot:</label>
              <select
                value={bookForm.slot}
                onChange={(e) => setBookForm((prev) => ({ ...prev, slot: e.target.value }))}
                required
              >
                <option value="">Select Slot</option>
                {slots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Phone No:</label>
              <input
                type="tel"
                value={bookForm.phoneNo}
                onChange={(e) => setBookForm((prev) => ({ ...prev, phoneNo: e.target.value }))}
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit phone number"
                required
              />
            </div>

            <div className="form-row">
              <label>Problem Description:</label>
              <textarea
                maxLength={200}
                value={bookForm.problemDescription}
                onChange={(e) => setBookForm((prev) => ({ ...prev, problemDescription: e.target.value }))}
                required
              />
            </div>

            <button type="submit">Book</button>
          </form>
          {bookMsg && (
            <p className={bookMsg.toLowerCase().includes('success') || bookMsg.toLowerCase().includes('booked') ? 'modal-success' : 'modal-error'}>
              {bookMsg}
            </p>
          )}
        </div>

        {/* Right: Appointments Section */}
        <div className="appointments-section">
          <h3>My Appointments</h3>
          <div className="status-tabs">
            {STATUS_LIST.map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={selectedStatus === tab.value ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {filteredAppointments.length === 0 ? (
            <p>No appointments{selectedStatus !== 'ALL' ? ` with status "${selectedStatus}"` : ''}.</p>
          ) : (
            <ul className="appointment-list">
              {[...filteredAppointments]
                .sort((a, b) => {
                  const dateTimeA = new Date(`${a.appointmentDate} ${a.slot}`);
                  const dateTimeB = new Date(`${b.appointmentDate} ${b.slot}`);
                  return dateTimeB - dateTimeA;
                })
                .map((appt) => (
                  <li key={appt.id} className="appointment-card">
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                    <p><strong>Time:</strong> {appt.slot}</p>
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Status:</strong> {appt.status}</p>
                    {appt.status !== '' && (
                      <button onClick={() => navigate(`/print/${appt.id}`)}> View & Print</button>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="profile-modal">
          <div className="profile-content">
            <button onClick={() => setShowProfile(false)} style={{ float: 'right' }}>X</button>
            <h3>Profile</h3>
            {profileError && <p style={{ color: 'red' }}>{profileError}</p>}
            {profile && (
              <>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowChangePassword(false)}>&times;</button>
            <h3>Change Password</h3>
            {passwordError && <p className="modal-error">{passwordError}</p>}
            {passwordSuccess && <p className="modal-success">{passwordSuccess}</p>}

            <form onSubmit={handleChangePassword} className="modal-form">
              <label>
                Old Password
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              </label>
              <label>
                New Password
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </label>
              <label>
                Confirm New Password
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
              </label>
              <button type="submit" className="modal-submit-btn">Change Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHome;