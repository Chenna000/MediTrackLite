import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/DoctorHome.css';

const DoctorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [toast, setToast] = useState('');
  const [view, setView] = useState('appointments');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: '',
    medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
    consultationNotes: '',
  });
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');
  const [labReportFile, setLabReportFile] = useState(null);

  const [showCenterAlert, setShowCenterAlert] = useState(false);

  const API = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
  });

  const timeoutRef = useRef(null);
  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleLogout(true);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/api/auth/me');
        if (res.data.role !== 'DOCTOR') navigate('/login');
        else {
          setUser(res.data);
          loadAppointments(res.data.email);
        }
      } catch {
        navigate('/login');
      }
    };

    fetchUser();
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
    // eslint-disable-next-line
  }, []);

  const loadAppointments = async (email) => {
    try {
      const res = await API.get('/appointments/doctor', { params: { email } });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, null, { params: { status } });
      setToast(`Status updated to ${status}`);
      if (user?.email) loadAppointments(user.email);
    } catch {
      setToast('Error updating status');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = async (auto = false) => {
    try {
      await API.post('/api/auth/logout');
    } finally {
      if (auto) alert('Session expired due to inactivity');
      navigate('/login');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await API.post('/api/auth/change-password', { oldPassword, newPassword });
      setSuccess('Password changed successfully.');
      navigate('/login');
    } catch (err) {
      setError('Failed to change password');
    }
  };

  const openPrescriptionForm = (id) => {
    setPrescriptionForm({
      appointmentId: id,
      medicines: [{ medicineName: '', dosageInstructions: '', frequency: '' }],
      consultationNotes: '',
    });
    setLabReportFile(null);
    setPrescriptionError('');
    setPrescriptionSuccess('');
    setShowPrescriptionForm(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    const { appointmentId, medicines, consultationNotes } = prescriptionForm;

    if (medicines.some(m => !m.medicineName || !m.dosageInstructions || !m.frequency)) {
      setPrescriptionError('All fields are required.');
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
      setPrescriptionSuccess('Uploaded successfully.');
      setShowCenterAlert(true);
      setShowPrescriptionForm(false);
      loadAppointments(user.email);
      setTimeout(() => setShowCenterAlert(false), 1000);
    } catch {
      setPrescriptionError('Failed to upload prescription.');
    }
  };

  const addMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: '', dosageInstructions: '', frequency: '' }],
    }));
  };

  const removeMedicineRow = (index) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...prescriptionForm.medicines];
    updated[index][name] = value;
    setPrescriptionForm({ ...prescriptionForm, medicines: updated });
  };

  const filteredAppointments = appointments.filter(app =>
    statusFilter === 'ALL' ? true : app.status === statusFilter
  );

  // Download report handler for completed appointments
  const handleDownloadReport = (labReportsPath) => {
    if (!labReportsPath) return;
    window.open(`http://localhost:8080/files/download/${encodeURIComponent(labReportsPath)}`, '_blank');
  };

  return (
    <div className="doctor-dashboard-container">
      <h2 className="dashboard-title">Welcome Dr. {user?.name}</h2>
      {toast && <div className="toast">{toast}</div>}

      <div className="dashboard-content">
        <div className="sidebar">
          <img src="/images/docor_profile.jpg" alt="doctor" />
          <p>{user?.name}</p>
          <p>{user?.email}</p>
          <button onClick={() => setView('appointments')}>Appointments</button>
          <button onClick={() => setView('password')}>Change Password</button>
          <button className="red-button" onClick={() => handleLogout(false)}>Logout</button>
        </div>

        <div className="main-content">
          {view === 'appointments' && (
            <>
              <div className="status-tabs">
                {['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].map(s => (
                  <button
                    key={s}
                    className={statusFilter === s ? 'active' : ''}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="appointments-list">
                {filteredAppointments.map(app => (
                  <div className="appointment-card" key={app.id}>
                    <p><strong>Patient:</strong> {app.patientEmail}</p>
                    <p><strong>Date:</strong> {app.appointmentDate}</p>
                    <p><strong>Time:</strong> {app.slot}</p>
                    <p><strong>Issue:</strong> {app.problemDescription}</p>

                    {app.status === 'PENDING' && app.patientReportPath && (
                      <button
                        style={{ marginBottom: 8, backgroundColor: '#607d8b', color: 'white' }}
                        onClick={() => handleDownloadReport(app.patientReportPath)}
                      >
                        Download Report
                      </button>
                    )}

                    {app.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatus(app.id, 'ACCEPTED')}>✔ Accept</button>
                        <button className="red-button" onClick={() => handleStatus(app.id, 'REJECTED')}>✘ Reject</button>
                      </>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <button onClick={() => handleStatus(app.id, 'IN_PROGRESS')}>Start</button>
                    )}
                    {app.status === 'IN_PROGRESS' && (
                      <button onClick={() => openPrescriptionForm(app.id)}>Upload Prescription</button>
                    )}
                    {app.status === 'COMPLETED' && (
                      <>
                        {app.labReportsPath && (
                          <button
                            style={{ marginRight: 8, backgroundColor: '#607d8b', color: 'white' }}
                            onClick={() => handleDownloadReport(app.labReportsPath)}
                          >
                            Download Lab Report
                          </button>
                        )}
                        <button onClick={() => navigate(`/print/${app.id}`)}>Print</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'password' && (
            <form onSubmit={handleChangePassword} className="change-password-form">
              <h3>Change Password</h3>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirm Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              <button type="submit">Update</button>
            </form>
          )}
        </div>
      </div>

      {showPrescriptionForm && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Upload Prescription</h3>
            {prescriptionError && <p className="error">{prescriptionError}</p>}
            {prescriptionSuccess && <p className="success">{prescriptionSuccess}</p>}
            
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="medicine-list">
                {prescriptionForm.medicines.map((m, i) => (
                  <div key={i} className="medicine-row">
                    <input name="medicineName" placeholder="Name" value={m.medicineName} onChange={e => handleMedicineChange(i, e)} />
                    <input name="dosageInstructions" placeholder="Dosage" value={m.dosageInstructions} onChange={e => handleMedicineChange(i, e)} />
                    <input name="frequency" placeholder="Frequency" value={m.frequency} onChange={e => handleMedicineChange(i, e)} />
                    {prescriptionForm.medicines.length > 1 && (
                      <button type="button" className="red-button" onClick={() => removeMedicineRow(i)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" className="add-button" onClick={addMedicineRow}>+ Add Medicine</button>

              <textarea
                placeholder="Consultation Notes"
                value={prescriptionForm.consultationNotes}
                onChange={e => setPrescriptionForm({ ...prescriptionForm, consultationNotes: e.target.value })}
              ></textarea>

              <label style={{ marginTop: 10, display: 'block' }}>
                Upload Lab Report (optional):
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setLabReportFile(e.target.files[0])}
                  style={{ display: 'block', marginTop: 5 }}
                />
              </label>

              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
        </div>
      )}

      {showCenterAlert && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '32px 48px',
              borderRadius: '12px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
              fontSize: '1.2rem',
              color: '#333',
              textAlign: 'center'
            }}
          >
            Prescription uploaded successfully.
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorHome;