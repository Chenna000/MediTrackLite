CREATE  DATABASE meditrackdb;
-- Create users table

CREATE TABLE  `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('PATIENT', 'DOCTOR') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_users_email` (`email`)
);

-- Create Appointments table
CREATE TABLE `appointments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,                     -- Primary Key
    `appointment_date` DATE DEFAULT NULL,                    -- Date of the appointment
    `created_at` DATETIME(6) DEFAULT NULL,                   -- Timestamp of creation
    `doctor_email` VARCHAR(255) DEFAULT NULL,                -- Email of the doctor
    `doctor_name` VARCHAR(255) DEFAULT NULL,                 -- Name of the doctor
    `patient_email` VARCHAR(255) DEFAULT NULL,               -- Email of the patient
    `phone_no` VARCHAR(255) DEFAULT NULL,                    -- Contact number of patient
    `problem_description` VARCHAR(255) DEFAULT NULL,         -- Short description of the issue
    `slot` VARCHAR(255) DEFAULT NULL,                        -- Selected time slot
    `status` VARCHAR(255) DEFAULT NULL,                      -- Appointment status (e.g., PENDING, ACCEPTED, REJECTED)
    PRIMARY KEY (`id`)
);
