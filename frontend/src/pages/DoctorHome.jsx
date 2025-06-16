import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/DoctorHome.css';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

const STATUS_LIST = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const DoctorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [toast, setToast] = useState('');

  // Profile & password
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prescription modal/form (multi-medicine + consultation notes + lab report)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: '',
    medicines: [
      { medicineName: '', dosageInstructions: '', frequency: '' }
    ],
    consultationNotes: '',
  });
  const [labReportFile, setLabReportFile] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');

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
      const res = await API.get('/appointments/doctor', { params: { email } });
      setAppointments(res.data);
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

  // Prescription form logic (multi-medicine + consultation notes + lab report)
  const openPrescriptionForm = (appointmentId) => {
    setPrescriptionForm({
      appointmentId,
      medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
      consultationNotes: '',
    });
    setLabReportFile(null);
    setPrescriptionError('');
    setPrescriptionSuccess('');
    setShowPrescriptionForm(true);
  };

  const closePrescriptionForm = () => {
    setShowPrescriptionForm(false);
    setPrescriptionForm({
      appointmentId: '',
      medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
      consultationNotes: '',
    });
    setLabReportFile(null);
    setPrescriptionError('');
    setPrescriptionSuccess('');
  };

  const handleMedicineChange = (idx, e) => {
    const { name, value } = e.target;
    setPrescriptionForm((prev) => {
      const updated = [...prev.medicines];
      updated[idx][name] = value;
      return { ...prev, medicines: updated };
    });
  };

  const addMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: '', dosageInstructions: '', frequency: '' }],
    }));
  };

  const removeMedicineRow = (idx) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setPrescriptionError('');
    setPrescriptionSuccess('');
    const { appointmentId, medicines, consultationNotes } = prescriptionForm;
    if (medicines.some(m => !m.medicineName || !m.dosageInstructions || !m.frequency)) {
      setPrescriptionError('All fields are required for each medicine.');
      return;
    }
    try {
      const formData = new FormData();
      const prescriptionRequest = {
        appointmentId,
        prescriptions: medicines,
        consultationNotes,
      };
      formData.append('data', new Blob([JSON.stringify(prescriptionRequest)], { type: 'application/json' }));
      if (labReportFile) {
        formData.append('labReport', labReportFile);
      }
      await API.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescriptionSuccess('Prescription uploaded and appointment marked as completed.');
      setShowPrescriptionForm(false);
      loadAppointments(user.email);
    } catch (err) {
      setPrescriptionError(err.response?.data || 'Failed to upload prescription.');
    }
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

  // Filter appointments by selected status
  const filteredAppointments = appointments.filter(a => selectedStatus === 'ALL' ? true : a.status === selectedStatus);

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

      <div className="appointments-container">
        <div className="appointments-section">
          <h3>{STATUS_LIST.find(s => s.value === selectedStatus)?.label} Appointments</h3>
          {filteredAppointments.length === 0 ? (
            <p>No appointments in this category.</p>
          ) : (
            [...filteredAppointments]
              .sort((a, b) => {
                const dateTimeA = new Date(`${a.appointmentDate} ${a.slot}`);
                const dateTimeB = new Date(`${b.appointmentDate} ${b.slot}`);
                return dateTimeB - dateTimeA;
              })
              .map((a) => (
                <div key={a.id} className={`appt-card ${a.status.toLowerCase()}`}>
                  <p><strong>{a.appointmentDate} @ {a.slot}</strong></p>
                  <p>Appointment ID: {a.id}</p>
                  <p>Patient: {a.patientEmail.split("@")[0]}</p>
                  <p>Reason: {a.problemDescription}</p>
                  {/* Download Report button if report is available */}
                  {a.status === 'PENDING' && a.patientReportPath && (
                    <button
                      style={{ marginBottom: 8, backgroundColor: '#607d8b', color: 'white' }}
                      onClick={() => {
                        window.open(`http://localhost:8080/files/download/${encodeURIComponent(a.patientReportPath)}`, '_blank');
                      }}
                    >
                      Download Report
                    </button>
                  )}
                  {a.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleStatus(a.id, 'ACCEPTED')}>✔ Accept</button>
                      <button className="reject-btn" onClick={() => handleStatus(a.id, 'REJECTED')}>✘ Reject</button>
                    </>
                  )}
                  {a.status === 'ACCEPTED' && (
                    <button onClick={() => handleStatus(a.id, 'IN_PROGRESS')}>Start Consultation</button>
                  )}
                  {a.status === 'IN_PROGRESS' && (
                    <button onClick={() => openPrescriptionForm(a.id)} style={{backgroundColor:' #4a90e2', color:'white'}}>Complete & Upload Prescription</button>
                  )}
                  {a.status === 'COMPLETED' && (
                    <button onClick={() => navigate(`/print/${a.id}`)}  style={{backgroundColor:' #4a90e2', color:'white'}}>View & Print</button>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Prescription Upload Modal */}
      {showPrescriptionForm && (
        <div className="modal-overlay" onClick={closePrescriptionForm}>
          <div className="modal-container" onClick={e => e.stopPropagation()}
            style={{
            maxHeight: '95vh',
            overflowY: 'auto',
            width: '400px',
            background: '#fff',
            borderRadius: '8px',
            padding: '24px',
            position: 'relative'
  }}
            >
            <button className="modal-close-btn" onClick={closePrescriptionForm}>&times;</button>
            <h3>Upload Prescription</h3>
            {prescriptionError && <p className="modal-error">{prescriptionError}</p>}
            {prescriptionSuccess && <p className="modal-success">{prescriptionSuccess}</p>}
            <form onSubmit={handlePrescriptionSubmit}>
              {prescriptionForm.medicines.map((med, idx) => (
                <div key={idx} style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <input
                    type="text"
                    name="medicineName"
                    placeholder="Medicine Name"
                    value={med.medicineName}
                    onChange={e => handleMedicineChange(idx, e)}
                    required
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="text"
                    name="dosageInstructions"
                    placeholder="Dosage Instructions"
                    value={med.dosageInstructions}
                    onChange={e => handleMedicineChange(idx, e)}
                    required
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="text"
                    name="frequency"
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={e => handleMedicineChange(idx, e)}
                    required
                    style={{ marginRight: 8 }}
                  />
                  {prescriptionForm.medicines.length > 1 && (
                    <button type="button" onClick={() => removeMedicineRow(idx)} style={{ color: 'red' }}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addMedicineRow} style={{ marginBottom: 10 }}>Add Medicine</button>
              <br />
              <textarea
                placeholder="Enter consultation notes"
                value={prescriptionForm.consultationNotes}
                onChange={(e) =>
                  setPrescriptionForm({ ...prescriptionForm, consultationNotes: e.target.value })
                }
                style={{ width: '100%', minHeight: '60px', marginTop: 10 }}
              />
              <br />
              <label style={{ marginTop: 10, display: 'block' }}>
                Upload Lab Report (optional):
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setLabReportFile(e.target.files[0])}
                  style={{ display: 'block', marginTop: 5 }}
                />
              </label>
              <br />
              <button type="submit" className="modal-submit-btn" >Upload & Complete</button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
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

      {/* Change Password Modal */}
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