# MediTrackLite

MediTrack is a full-stack medical appointment management application designed to simplify the process of scheduling and managing doctor appointments. Built using **Spring Boot (backend)** and **React (frontend)**, the system supports role-based access for **Patients** and **Doctors**,  and appointment printing.

This project was built using **React (Vite)** for the frontend and **Spring Boot** for the backend. 

##  Tech Stack

### Frontend (React + Vite)
- React Router for navigation
- Axios for API calls
- Role-based redirection
- JavaScript
- VS Code as IDE

### Backend (Spring Boot)
- Spring Security for authentication and role-based access
- Spring Data JPA for database access
- BCrypt for password hashing
- Validation using annotations
- REST APIs
- Eclipse IDE

### Database
- MYSQL

## 🔑 Features

### 👤 Authentication
- Secure login/logout with session-based access
- Role-based dashboards for `PATIENT` and `DOCTOR`
- Change password and profile view functionality
- Password strength constraints & session protection

### 🩺 Patient Module
- Book appointments by selecting specialization, doctor, date, and slot
- Add phone number and problem description (max 200 chars)
- View booked appointments in reverse chronological order
- Print appointment confirmation
- See prescription after appointment is completed

### 👨‍⚕️ Doctor Module
- View appointments split into **Pending** and **Accepted**
- Accept or Reject pending appointments
- Print accepted appointment details
- Add prescriptions after appointment is in progress
- Mark appointment status: `IN_PROGRESS` → `COMPLETED`

### 💊 Prescription Management
- Add multiple medicines per appointment
- Each medicine has:
  - Name
  - Dosage instructions
  - Frequency
- Prescriptions are linked to completed appointments
- Patients can view and print them

### 🕐Smart Schedulers
- Auto-rejects pending appointments after:
  - 30 minutes (if appointment is scheduled soon)
  - 12 hours (for general cleanup)
- Auto-update ACCEPTED appointments to IN_PROGRESS when slot time starts

### 🔒 Security Highlights
- Passwords stored with BCrypt hashing
- Session-aware protected endpoints
- Prevents unauthorized access via role-based filters

##  Project Structure
- MediTrackLite/
    - backend/  (Springboot Application)
    - frontend/ (React+Vite App)
    

##  How to Run the Project

### Backend (Spring Boot)

1. Open the backend folder in Eclipse
2. Run the Spring Boot application
3. It will start on: "http://localhost:8080"

### Frontend (React + Vite)

1. Open the frontend folder in VS Code
2. Run these commands in Terminal:
   npm install
   npm run dev
3. It will start on: "http://localhost:5173"
   
###  Sample API Endpoints
- POST `/api/auth/register` – Register user
- POST `/api/auth/login` – Login user
- GET `/api/auth/profile` – Get logged-in user's data
- POST `/appointments/book` – Book appointment
- GET `/appointments/doctor/pending` – Fetch doctor’s pending appointments
- PUT `/appointments/{id}/status` – Accept/Reject appointment
- POST `/prescriptions/upload` - Adds Prescription Details
- GET `/prescriptions/{appointmentId}` - Returns Prescription details based on appointmentId

 ## Future Enhancements
- Integreate Real time notifications to mobile number
- Admin dashboard for hospital management
- JWT-based token authentication
- Mobile app with React Native
- Analytics on appointments and user activity

## Requirements
- Java 17+
- Maven
- MySQL 8+
- Node.js + npm
  
##  What I Learned
- Implementing secure role-based authentication
- Integrating frontend and backend in a full-stack setup
- Managing session and user state in React
- Handling validations and protected routes
- Auto-scheduling using @Scheduled for rejecting stale appointments
- Building a modular, reusable component structure
- Generating printable PDF views for appointment summariest 
