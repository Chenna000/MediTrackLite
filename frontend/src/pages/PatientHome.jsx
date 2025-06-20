import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../css/PatientHome.css';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

const ANALYTICS_API = axios.create({
  baseURL: 'http://localhost:8080/analytics',
  withCredentials: true,
});

const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};
const STATUS_LIST = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const FeedbackForm = ({ appointmentId, onFeedbackSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    setLoading(true);
    API
      .get(`/feedback/appointment/${appointmentId}`)
      .then((res) => {
        if (
          res.data &&
          typeof res.data === 'object' &&
          res.data.id != null
        ) {
          setExistingFeedback(res.data);
          setSubmitted(true);
        } else {
          setExistingFeedback(null);
          setSubmitted(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setExistingFeedback(null);
        setSubmitted(false);
        setLoading(false);
      });
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rating < 1 || rating > 5) {
      setError('Please select a rating.');
      return;
    }
    try {
      await API.post('/feedback', {
        appointmentId,
        rating,
        comment,
      });
      setSuccess('Thank you for your feedback!');
      setSubmitted(true);
      setExistingFeedback({ rating, comment });
      if (onFeedbackSubmit) onFeedbackSubmit();
    } catch {
      setError('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) return null;

  if (submitted && existingFeedback) {
    return (
      <div style={{ color: '#4caf50', marginTop: 8 }}>
        <div>
          <strong>Feedback already submitted for this appointment:</strong>
        </div>
        <div style={{ margin: '6px 0' }}>
          <span style={{ color: '#ffc107', fontSize: 18 }}>
            {'★'.repeat(existingFeedback.rating)}
            {'☆'.repeat(5 - existingFeedback.rating)}
          </span>
        </div>
        <div>
          {existingFeedback.comment ? (
            <span>{existingFeedback.comment}</span>
          ) : (
            <span style={{ color: '#888' }}>(No comment)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, marginBottom: 8, background: '#f7f7f7', padding: 12, borderRadius: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ marginRight: 8 }}>Rate your experience:</span>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            style={{
              cursor: 'pointer',
              color: rating >= num ? '#ffc107' : '#ccc',
              fontSize: 22,
              marginRight: 2,
            }}
            onClick={() => setRating(num)}
            role="button"
            aria-label={`Rate ${num}`}
          >
            ★
          </span>
        ))}
      </div>
      <div>
        <textarea
          placeholder="Optional comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: '100%', minHeight: 40, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 4 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 4 }}>{success}</div>}
      <button
        type="submit"
        style={{
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '6px 18px',
          cursor: 'pointer',
        }}
      >
        Submit Feedback
      </button>
    </form>
  );
};

// Timeline with visualization
const Timeline = ({ email }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    ANALYTICS_API.get(`/patient-timeline?email=${encodeURIComponent(email)}`)
      .then(res => {
        setTimeline(res.data);
        setLoading(false);
      })
      .catch(() => {
        setTimeline([]);
        setLoading(false);
      });
  }, [email]);

  if (loading) {
    return <div style={{ margin: 24, textAlign: 'center' }}>Loading timeline...</div>;
  }

  if (!timeline || timeline.length === 0) {
    return <div style={{ margin: 24, textAlign: 'center', color: '#888' }}>No timeline data found.</div>;
  }

  // Visualization: vertical timeline with dots and lines
  return (
    <div style={{ margin: 24 }}>
      <h3 style={{ marginBottom: 24, textAlign: 'center' }}>My Medical Timeline</h3>
      <div style={{
        position: 'relative',
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 30,
        borderLeft: '3px solid #1976d2',
        minHeight: 100
      }}>
        {timeline.map((entry, idx) => (
          <div key={idx} style={{
            position: 'relative',
            marginBottom: 40,
            paddingLeft: 30,
          }}>
            {/* Dot */}
            <div style={{
              position: 'absolute',
              left: -41,
              top: 8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: entry.status === 'COMPLETED' ? '#43a047' : '#1976d2',
              border: '3px solid #fff',
              boxShadow: '0 0 0 3px #1976d2',
              zIndex: 2
            }}></div>
            {/* Card */}
            <div style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
              padding: 18,
              minWidth: 260,
              maxWidth: 600,
              borderLeft: `6px solid ${entry.status === 'COMPLETED' ? '#43a047' : '#1976d2'}`,
              position: 'relative'
            }}>
              <div style={{ marginBottom: 6, fontWeight: 600, fontSize: 16 }}>
                {entry.date} <span style={{ color: '#888', fontWeight: 400 }}>({entry.slot})</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Doctor:</strong> {entry.doctorName}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Status:</strong> <span style={{ color: entry.status === 'COMPLETED' ? '#43a047' : '#1976d2' }}>{entry.status}</span>
              </div>
              {entry.report && (
                <div style={{ marginBottom: 6 }}>
                  <a
                    href={`http://localhost:8080/files/download/${encodeURIComponent(entry.report)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                  >
                    Download Report
                  </a>
                </div>
              )}
              {entry.prescriptions && entry.prescriptions.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Prescriptions:</strong>
                  <ul style={{ marginTop: 4, marginLeft: 18 }}>
                    {entry.prescriptions.map((pres, i) => (
                      <li key={i}>
                        <span>
                          <strong>Medicine:</strong> {pres.medicineName} &nbsp;
                          <strong>Dosage:</strong> {pres.dosageInstructions} &nbsp;
                          <strong>Frequency:</strong> {pres.frequency}
                        </span>
                        {pres.consultationNotes && (
                          <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                            Notes: {pres.consultationNotes}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Vertical line for all except last */}
            {idx !== timeline.length - 1 && (
              <div style={{
                position: 'absolute',
                left: -32,
                top: 28,
                width: 4,
                height: 'calc(100% - 28px)',
                background: '#1976d2',
                zIndex: 1
              }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PatientHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
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

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setError] = useState('');
  const [passwordSuccess, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [activeTab, setActiveTab] = useState('book');
  const [completedTab, setCompletedTab] = useState('feedbacked');
  const [showTimeline, setShowTimeline] = useState(false);

  let timeout;

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/auth/me');
      if (res.data.role !== 'PATIENT') navigate('/login');
      setUser(res.data);
      fetchAppointments(res.data.email);
    } catch (err) {
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
      fetchFeedbacks(sorted);
    } catch (err) {}
  };

  const fetchFeedbacks = async (appointmentsList) => {
    const completed = appointmentsList.filter(a => a.status === 'COMPLETED');
    if (completed.length === 0) {
      setFeedbackMap({});
      return;
    }
    const feedbacks = {};
    await Promise.all(
      completed.map(async (appt) => {
        try {
          const res = await API.get(`/feedback/appointment/${appt.id}`);
          if (res.data && typeof res.data === 'object' && res.data.id != null) {
            feedbacks[appt.id] = res.data;
          }
        } catch {}
      })
    );
    setFeedbackMap(feedbacks);
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
      await API.post('/api/auth/logout');
      setSuccess('Password changed successfully! Redirecting to login...');
      setTimeout(() => {
        setShowChangePassword(false);
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(
        (err.response && (
          typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data?.message
        )) || 'Failed to change password.'
      );
    }
  };

  const filteredAppointments = appointments.filter((appt) =>
    appt.status === selectedStatus
  );

  const handleDownloadReport = (patientReportPath) => {
    if (!patientReportPath) return;
    window.open(`http://localhost:8080/files/download/${encodeURIComponent(patientReportPath)}`, '_blank');
  };

  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const feedbackedAppointments = completedAppointments.filter(a => feedbackMap[a.id]);
  const notFeedbackedAppointments = completedAppointments.filter(a => !feedbackMap[a.id]);

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
          <button onClick={() => { setActiveTab('bookings'); setShowTimeline(false); }}>My Bookings</button>
          <button onClick={() => { setActiveTab('book'); setShowTimeline(false); }}>Book Appointment</button>
          <button onClick={() => { setShowTimeline(true); setActiveTab('timeline'); }}>My Timeline</button>
          <button onClick={handleOpenChangePassword}>Change Password</button>
          <button
            className="whatsapp-button"
            onClick={() => window.open('https://wa.me/919177524378?text=Hello%20Hospital%20Team', '_blank')}
            style={{ backgroundColor: '#25D366', color: 'white' }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: 20, marginRight: 8, verticalAlign: 'middle' }} />
            Chat with Hospital
          </button>
          <button className="red-button" onClick={() => handleLogout(false)}>Logout</button>
        </div>
      </div>

      <div className="right-box">
        {showTimeline ? (
          <Timeline email={user?.email} />
        ) : activeTab === 'book' ? (
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
        ) : activeTab === 'bookings' ? (
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
              <p style={{ color: '#888', margin: '24px 0', textAlign: 'center' }}>
                No appointments with status "{STATUS_LABELS[selectedStatus]}".
              </p>
            ) : selectedStatus === 'COMPLETED' ? (
              <div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <button
                    className={completedTab === 'feedbacked' ? 'active' : ''}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 20,
                      border: 'none',
                      background: completedTab === 'feedbacked' ? '#42a5f5' : '#eee',
                      color: completedTab === 'feedbacked' ? '#fff' : '#333',
                      fontWeight: completedTab === 'feedbacked' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCompletedTab('feedbacked')}
                  >
                    Feedback Submitted
                  </button>
                  <button
                    className={completedTab === 'pending' ? 'active' : ''}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 20,
                      border: 'none',
                      background: completedTab === 'pending' ? '#42a5f5' : '#eee',
                      color: completedTab === 'pending' ? '#fff' : '#333',
                      fontWeight: completedTab === 'pending' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCompletedTab('pending')}
                  >
                    Feedback Pending
                  </button>
                </div>
                <div>
                  {completedTab === 'feedbacked' ? (
                    feedbackedAppointments.length === 0 ? (
                      <p style={{ color: '#888', margin: '12px 0' }}>No completed appointments with feedback.</p>
                    ) : (
                      <ul className="appointment-list">
                        {feedbackedAppointments.map((appt) => (
                          <li key={appt.id} className="appointment-card">
                            <p><strong>Date:</strong> {appt.appointmentDate}</p>
                            <p><strong>Time:</strong> {appt.slot}</p>
                            <p><strong>Doctor:</strong> {appt.doctorName}</p>
                            <p><strong>Status:</strong> {appt.status}</p>
                            {appt.patientReportPath && (
                              <button
                                style={{ marginRight: 8, backgroundColor: '#607d8b', color: 'white' }}
                                onClick={() => handleDownloadReport(appt.patientReportPath)}
                              >
                                Download Lab Report
                              </button>
                            )}
                            <button onClick={() => navigate(`/print/${appt.id}`)}> View & Print</button>
                            <div style={{ marginTop: 8 }}>
                              <strong>Feedback:</strong>
                              <div style={{ color: '#ffc107', fontSize: 18 }}>
                                {'★'.repeat(feedbackMap[appt.id]?.rating || 0)}
                                {'☆'.repeat(5 - (feedbackMap[appt.id]?.rating || 0))}
                              </div>
                              <div>
                                {feedbackMap[appt.id]?.comment
                                  ? feedbackMap[appt.id].comment
                                  : <span style={{ color: '#888' }}>(No comment)</span>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    notFeedbackedAppointments.length === 0 ? (
                      <p style={{ color: '#888', margin: '12px 0' }}>No completed appointments pending feedback.</p>
                    ) : (
                      <ul className="appointment-list">
                        {notFeedbackedAppointments.map((appt) => (
                          <li key={appt.id} className="appointment-card">
                            <p><strong>Date:</strong> {appt.appointmentDate}</p>
                            <p><strong>Time:</strong> {appt.slot}</p>
                            <p><strong>Doctor:</strong> {appt.doctorName}</p>
                            <p><strong>Status:</strong> {appt.status}</p>
                            {appt.patientReportPath && (
                              <button
                                style={{ marginRight: 8, backgroundColor: '#607d8b', color: 'white' }}
                                onClick={() => handleDownloadReport(appt.patientReportPath)}
                              >
                                Download Lab Report
                              </button>
                            )}
                            <button onClick={() => navigate(`/print/${appt.id}`)}> View & Print</button>
                            <FeedbackForm appointmentId={appt.id} onFeedbackSubmit={() => fetchAppointments(user.email)} />
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </div>
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
                      {appt.status === 'COMPLETED' && (
                        <FeedbackForm appointmentId={appt.id} onFeedbackSubmit={() => fetchAppointments(user.email)} />
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </>
        ) : null}
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