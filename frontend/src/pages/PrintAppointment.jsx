import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const PrintAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/appointments/patient/${id}`, { withCredentials: true })
      .then((res) => setAppointment(res.data))
      .catch((err) => console.error("Error fetching appointment:", err));

    // Fetch user role for conditional redirection
    axios.get("http://localhost:8080/api/auth/me", { withCredentials: true })
      .then((res) => setUserRole(res.data.role))
      .catch((err) => console.error("Error fetching user role:", err));
  }, [id]);

  // Function to generate PDF from appointment details
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Appointment Details', 70, 20);
    doc.setFontSize(12);

    doc.autoTable({
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Appointment ID', appointment?.id],
        ['Patient Name', appointment?.patientEmail.split("@")[0]],
        ['Patient Email', appointment?.patientEmail],
        ['Doctor Name', appointment?.doctorName],
        ['Doctor Email', appointment?.doctorEmail],
        ['Date', appointment?.appointmentDate],
        ['Slot', appointment?.slot],
        ['Phone No', appointment?.phoneNo],
        ['Problem Description', appointment?.problemDescription],
        ['Status', appointment?.status],
        ['Created At', new Date(appointment?.createdAt).toLocaleString()],
      ],
    });

    doc.save(`Appointment_${appointment?.id}.pdf`);
  };

  if (!appointment) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading appointment details...</p>;
  }

  return (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f5'
  }}>
    <div style={{
      padding: '30px',
      maxWidth: '600px',
      width: '100%',
      backgroundColor: '#f7f9fc',
      borderRadius: '10px',
      boxShadow: '0 0 12px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2' }}>Appointment Details</h2>
      <div style={{ marginTop: '20px', fontSize: '16px', lineHeight: '1.7' }}>
        <p><strong>Appointment ID:</strong> {appointment.id}</p>
        <p><strong>Patient Name:</strong> {appointment.patientEmail.split("@")[0]}</p>
        <p><strong>Patient Email:</strong> {appointment.patientEmail}</p>
        <p><strong>Doctor Name:</strong> {appointment.doctorName}</p>
        <p><strong>Doctor Email:</strong> {appointment.doctorEmail}</p>
        <p><strong>Date:</strong> {appointment.appointmentDate}</p>
        <p><strong>Slot:</strong> {appointment.slot}</p>
        <p><strong>Phone No:</strong> {appointment.phoneNo}</p>
        <p><strong>Problem Description:</strong> {appointment.problemDescription}</p>
        <p><strong>Status:</strong> {appointment.status}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <button
          onClick={generatePDF}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Download PDF
        </button>
        <button
          onClick={() => navigate(userRole === 'DOCTOR' ? '/doctor' : '/patient')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#607d8b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>
    </div>
  </div>
);

};

export default PrintAppointment;
