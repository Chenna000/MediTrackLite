# MediTrackLite

MediTrackLite is a full-stack web application I developed to manage medical records and user access based on roles — specifically for **Doctors** and **Patients**. It has secure registration and login features, role-based routing, and session management. 

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

##  Key Features

- Doctor and Patient roles
- Secure registration and login system
- Role-based redirection after login
- Password constraints and email validation
- Session invalidation after password change
- Account lockout after multiple failed attempts
- Basic protections like copy-paste disable on login inputs and back-button prevention
- Right click prevention on login screen

##  Project Structure
    meditrack-lite/
    ├── frontend/ # React app (Vite)
    └── backend/ # Spring Boot app
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
  
##  What I Learned
- Implementing secure role-based authentication
- Integrating frontend and backend in a full-stack setup
- Managing session and user state in React
- Handling validations and protected routes
