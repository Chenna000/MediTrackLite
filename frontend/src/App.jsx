import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DoctorHome from './pages/DoctorHome';
import PatientHome from './pages/PatientHome';
import RegisterPage from './pages/RegistrationPage';
import HomePage from './pages/Homepage';
import PrintAppointment from './pages/PrintAppointment';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor" element={<DoctorHome />} />
      <Route path="/patient" element={<PatientHome />} />
      <Route path="/print/:id" element={<PrintAppointment />} />
    </Routes>
  );
}

export default App;
// This code sets up the main application routes using React Router.
