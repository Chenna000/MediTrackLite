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
  const [reportFile, setReportFile] = useState(null);

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
  const [activeTab, setActiveTab] = useState('book');
  let timeout;

  // Fetch logged-in user details
  const fetchUser = async () => {
    try {
      const res = await API.get('/api/auth/me');
      if (res.data.role !== 'PATIENT') navigate('/login');
      setUser(res.data);
      fetchAppointments(res.data.email);
    } catch (err) {
      console.error('Session expired', err);
      navigate('/login');
    }
  };

  const fetchAppointments = async (email) => {
    try {
      const res = await API.get('/appointments/patient', { params: { email } });
      const sorted = res.data.sort(
        (a, b) => new Date(`${b.appointmentDate} ${b.slot}`) - new Date(`${a.appointmentDate} ${a.slot}`)
      );
      setAppointments(sorted);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

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

  useEffect(() => {
    if (!date) {
      setSpecializations([]);
      setSelectedSpecialization('');
      setDoctors([]);
      setBookForm({ doctorEmail: '', doctorName: '', slot: '', phoneNo: '', problemDescription: '' });
      setSlots([]);
      return;
    }
    API.get('/appointments/specializations')
      .then((res) => setSpecializations(res.data))
      .catch(() => setSpecializations([]));
  }, [date]);

  useEffect(() => {
    if (!date || !selectedSpecialization) {
      setDoctors([]);
      setBookForm((prev) => ({
        ...prev,
        doctorEmail: '',
        doctorName: '',
        slot: '',
      }));
      setSlots([]);
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
    setSlots([]);
  }, [date, selectedSpecialization]);

  useEffect(() => {
    if (!date || !bookForm.doctorEmail) {
      setSlots([]);
      setBookForm((prev) => ({ ...prev, slot: '' }));
      return;
    }
    API.get('/appointments/available-slots', {
      params: { date, doctorEmail: bookForm.doctorEmail },
    })
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]));
    setBookForm((prev) => ({ ...prev, slot: '' }));
  }, [date, bookForm.doctorEmail]);

  // Booking handler with file upload
  const handleBook = async (e) => {
    e.preventDefault();
    setBookMsg('');
    const { doctorEmail, doctorName, slot, phoneNo, problemDescription } = bookForm;

    if (!date || !selectedSpecialization || !doctorEmail || !slot || !problemDescription.trim()) {
      setBookMsg('All fields are required.');
      return;
    }

    try {
      const formData = new FormData();
      const appointmentRequest = {
        doctorEmail,
        doctorName,
        slot,
        phoneNo,
        problemDescription,
        appointmentDate: date,
        specialization: selectedSpecialization,
        patientEmail: user.email,
      };
      formData.append('data', new Blob([JSON.stringify(appointmentRequest)], { type: 'application/json' }));
      if (reportFile) {
        formData.append('report', reportFile);
      }

      const res = await API.post('/appointments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      setReportFile(null);
    } catch (err) {
      setBookMsg(err.response?.data || 'Something went wrong.');
    }
  };

  const handleLogout = async (auto = false) => {
    try {
      await API.post('/api/auth/logout');
    } catch {}
    finally {
      if (auto) alert('Session expired');
      navigate('/login');
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
      await API.post('/api/auth/change-password', { oldPassword, newPassword });
      alert('Password changed successfully!');
      setShowChangePassword(false);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to change password.');
    }
  };

  const filteredAppointments = appointments.filter((appt) =>
    selectedStatus === 'ALL' ? true : appt.status === selectedStatus
  );

  // Download report handler for completed appointments
  const handleDownloadReport = (patientReportPath) => {
    if (!patientReportPath) return;
    window.open(`http://localhost:8080/files/download/${encodeURIComponent(patientReportPath)}`, '_blank');
  };

  return (
    <div className="patient-dashboard">
      <div className="left-box">
        <div className="profile-card">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="avatar" className="profile-avatar" />
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <p>{user?.role}</p>
        </div>
        <div className="button-group">
          <button onClick={() => setActiveTab('bookings')}>My Bookings</button>
          <button onClick={() => setActiveTab('book')}>Book Appointment</button>
          <button onClick={handleOpenChangePassword}>Change Password</button>
          <button className="red-button" onClick={() => handleLogout(false)}>Logout</button>
        </div>
      </div>

      <div className="right-box">
        {activeTab === 'book' && (
          <>
            <h2>Book Appointment</h2>
            <form onSubmit={handleBook} className="booking-form">
              <label>
                Select Date:
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </label>
              <label>
                Specialization:
                <select value={selectedSpecialization} onChange={(e) => setSelectedSpecialization(e.target.value)} required>
                  <option value="">--Select--</option>
                  {specializations.map((spec, idx) => (
                    <option key={idx} value={spec}>{spec}</option>
                  ))}
                </select>
              </label>
              <label>
                Doctor:
                <select
                  value={bookForm.doctorEmail}
                  onChange={(e) => {
                    const selectedDoc = doctors.find(doc => doc.email === e.target.value);
                    setBookForm((prev) => ({
                      ...prev,
                      doctorEmail: selectedDoc?.email || '',
                      doctorName: selectedDoc?.name || '',
                    }));
                  }}
                  required
                >
                  <option value="">--Select--</option>
                  {doctors.map((doc) => (
                    <option key={doc.email} value={doc.email}>{doc.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Time Slot:
                <select
                  value={bookForm.slot}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, slot: e.target.value }))}
                  required
                >
                  <option value="">--Select--</option>
                  {slots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>
              <label>
                Phone Number:
                <input
                  type="tel"
                  value={bookForm.phoneNo}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, phoneNo: e.target.value }))}
                  required
                />
              </label>
              <label>
                Problem Description:
                <textarea
                  value={bookForm.problemDescription}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, problemDescription: e.target.value }))}
                  required
                ></textarea>
              </label>
              <label>
                Upload Report (optional):
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setReportFile(e.target.files[0])}
                />
              </label>
              <button type="submit">Book Now</button>
            </form>
            {bookMsg && <p className={bookMsg.toLowerCase().includes('success') ? 'modal-success' : 'modal-error'}>{bookMsg}</p>}
          </>
        )}

        {activeTab === 'bookings' && (
          <>
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
                      {appt.status === 'COMPLETED' && appt.patientReportPath && (
                        <button
                          style={{ marginRight: 8, backgroundColor: '#607d8b', color: 'white' }}
                          onClick={() => handleDownloadReport(appt.patientReportPath)}
                        >
                          Download Lab Report
                        </button>
                      )}
                      <button onClick={() => navigate(`/print/${appt.id}`)}> View & Print</button>
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
      </div>

      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-container change-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowChangePassword(false)}>&times;</button>
            <h3 className="modal-title">Change Password</h3>
            {passwordError && <p className="modal-error">{passwordError}</p>}
            {passwordSuccess && <p className="modal-success">{passwordSuccess}</p>}
            <form onSubmit={handleChangePassword} className="modal-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Old Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="modal-submit-btn">Change Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHome;