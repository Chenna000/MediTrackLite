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
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [view, setView] = useState('appointments');
  const [toast, setToast] = useState('');

  // Prescription modal/form (multi-medicine)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: '',
    medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
  });
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');

  // Password change
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
      if (user?.email) loadAppointments(user.email);
    } catch (err) {
      console.error('Status update error:', err);
      setToast('Failed to update status.');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const openPrescriptionForm = (appointmentId) => {
    setPrescriptionForm({
      appointmentId,
      medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
    });
    setPrescriptionError('');
    setPrescriptionSuccess('');
    setShowPrescriptionForm(true);
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
    const { appointmentId, medicines } = prescriptionForm;
    if (medicines.some(m => !m.medicineName || !m.dosageInstructions || !m.frequency)) {
      setPrescriptionError('All fields are required for each medicine.');
      return;
    }
    try {
      await API.post('/prescriptions/upload', {
        appointmentId,
        prescriptions: medicines,
      });
      setPrescriptionSuccess('Prescription uploaded and appointment marked as completed.');
      setShowPrescriptionForm(false);
      if (user?.email) loadAppointments(user.email);
    } catch (err) {
      setPrescriptionError(err.response?.data || 'Failed to upload prescription.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword || !confirmNewPassword) return setError('All fields required.');
    if (newPassword !== confirmNewPassword) return setError('Passwords do not match.');

    try {
      await API.post('/api/auth/change-password', { oldPassword, newPassword });
      setSuccess('Password changed. Please login again.');
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

  const filteredAppointments = appointments.filter(app =>
    statusFilter === 'ALL' ? true : app.status === statusFilter
  );

  if (!user) return <div>Loading...</div>;

  return (
    <div className="doctor-dashboard-container">
      <h2 className="dashboard-title">Welcome Dr. {user.name}</h2>
      {toast && <div className="toast">{toast}</div>}
  
      <div className="dashboard-sections">
        {/* Left Section: Profile */}
        <div className="dashboard-left">
          <div className="doctor-profile">
            <img src="/images/docor_profile.jpg" alt="Doctor" className="doctor-avatar" />
            <h3>Dr. {user.name}</h3>
            <p>{user.email}</p>
            <p><strong>Blood Type:</strong> {user.bloodType || 'N/A'}</p>
            <button onClick={() => setView('appointments')} className="appointments-btn">Appointments</button>
            <button onClick={() => setView('password')} className="password-btn">Change Password</button>

            <button onClick={() => handleLogout(false)} className="logout-btn">Logout</button>
          </div>
        </div>
  
        {/* Right Section: Dynamic View */}
        <div className="dashboard-right">
          {view === 'appointments' && (
            <>
              <h3>Appointments</h3>
              <div className="tabs">
                {STATUS_LIST.map(status => (
                  <button
                    key={status.value}
                    type="button"
                    className={statusFilter === status.value ? 'active-tab' : ''}
                    onClick={() => setStatusFilter(status.value)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
  
              <div className="appointments-list">
                {filteredAppointments.length === 0 ? (
                  <p>No appointments in this category.</p>
                ) : (
                  filteredAppointments.map(app => (
                    <div className={`appointment-card ${app.status.toLowerCase()}`} key={app.id}>
                      <p><strong>Patient:</strong> {app.patientEmail}</p>
                      <p><strong>Date:</strong> {app.appointmentDate}</p>
                      <p><strong>Time:</strong> {app.slot}</p>
                      <p><strong>Issue:</strong> {app.problemDescription}</p>
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatus(app.id, 'ACCEPTED')}>✔ Accept</button>
                          <button className="reject-btn" onClick={() => handleStatus(app.id, 'REJECTED')}>✘ Reject</button>
                        </>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <button onClick={() => handleStatus(app.id, 'IN_PROGRESS')}>Start Consultation</button>
                      )}
                      {app.status === 'IN_PROGRESS' && (
                        <button onClick={() => openPrescriptionForm(app.id)}>Upload Prescription</button>
                      )}
                      {app.status === 'COMPLETED' && (
                        <button onClick={() => navigate(`/print/${app.id}`)}>View & Print</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
  
          {view === 'password' && (
            <div className="change-password-form">
              <h3>Change Password</h3>
              {error && <p className="modal-error">{error}</p>}
              {success && <p className="modal-success">{success}</p>}
              <form onSubmit={handleChangePassword}>
                <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                <button type="submit" className="update-btn">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
  
      {/* Prescription Modal remains the same */}
      {showPrescriptionForm && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionForm(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPrescriptionForm(false)}>&times;</button>
            <h3>Upload Prescription</h3>
            {prescriptionError && <p className="modal-error">{prescriptionError}</p>}
            {prescriptionSuccess && <p className="modal-success">{prescriptionSuccess}</p>}
            <form onSubmit={handlePrescriptionSubmit} className="prescription-form">
  {prescriptionForm.medicines.map((med, idx) => (
    <div className="medicine-row" key={idx}>
      <input
        type="text"
        name="medicineName"
        placeholder="Medicine Name"
        value={med.medicineName}
        onChange={e => handleMedicineChange(idx, e)}
        required
      />
      <input
        type="text"
        name="dosageInstructions"
        placeholder="Dosage Instructions"
        value={med.dosageInstructions}
        onChange={e => handleMedicineChange(idx, e)}
        required
      />
      <input
        type="text"
        name="frequency"
        placeholder="Frequency"
        value={med.frequency}
        onChange={e => handleMedicineChange(idx, e)}
        required
      />
      {prescriptionForm.medicines.length > 1 && (
        <button type="button" onClick={() => removeMedicineRow(idx)} className="remove-btn">
          Remove
        </button>
      )}
    </div>
  ))}
  <button type="button" onClick={addMedicineRow} className="add-btn">+ Add Medicine</button>
  <button type="submit" className="modal-submit-btn">Upload & Complete</button>
</form>

          </div>
        </div>
      )}
    </div>
  );
  
};

export default DoctorHome;
