import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../css/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  // Handle lockout timer
  useEffect(() => {
    const savedLockout = localStorage.getItem('lockoutEndTime');
    if (savedLockout) {
      const endTime = new Date(savedLockout);
      if (new Date() < endTime) {
        setLockoutEndTime(endTime);
      } else {
        localStorage.removeItem('lockoutEndTime');
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (lockoutEndTime) {
      timer = setInterval(() => {
        const now = new Date();
        const diff = Math.max(0, lockoutEndTime - now);
        setTimeLeft(Math.ceil(diff / 1000));

        if (diff <= 0) {
          setLockoutEndTime(null);
          setTimeLeft(0);
          localStorage.removeItem('lockoutEndTime');
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutEndTime]);

  const handleLogin = async () => {
    if (lockoutEndTime && new Date() < lockoutEndTime) {
      setError(`Too many attempts. Try again in ${timeLeft} seconds`);
      return;
    }

    try {
      await axios.post(
        'http://localhost:8080/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      // Fetch user profile using session cookie
      const res = await axios.get('http://localhost:8080/api/auth/profile', {
        withCredentials: true,
      });

      const { role } = res.data;

      if (role === 'DOCTOR') navigate('/doctor');
      else if (role === 'PATIENT') navigate('/patient');
      else setError('Unknown role');

    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'string' && msg.includes('Too many attempts')) {
        setError(msg);
        const lockoutUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min lockout
        setLockoutEndTime(lockoutUntil);
        localStorage.setItem('lockoutEndTime', lockoutUntil.toISOString());
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <div className="login-page" onContextMenu={e => e.preventDefault()}>
      <div className="login-card">
        <h2>MediTrack Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onCopy={e => e.preventDefault()}
          onPaste={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
          disabled={lockoutEndTime && new Date() < lockoutEndTime}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onCopy={e => e.preventDefault()}
          onPaste={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
          disabled={lockoutEndTime && new Date() < lockoutEndTime}
        />
        <button
          onClick={handleLogin}
          disabled={lockoutEndTime && new Date() < lockoutEndTime}
        >
          {lockoutEndTime ? `Locked (${timeLeft}s)` : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
