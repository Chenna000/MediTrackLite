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
    `id` BIGINT NOT NULL AUTO_INCREMENT,                     
    `appointment_date` DATE DEFAULT NULL,                    
    `created_at` DATETIME(6) DEFAULT NULL,                   
    `doctor_email` VARCHAR(255) DEFAULT NULL,                
    `doctor_name` VARCHAR(255) DEFAULT NULL,                 
    `patient_email` VARCHAR(255) DEFAULT NULL,               
    `phone_no` VARCHAR(255) DEFAULT NULL,                    
    `problem_description` VARCHAR(255) DEFAULT NULL,         
    `slot` VARCHAR(255) DEFAULT NULL,                        
    `status` VARCHAR(255) DEFAULT NULL,                      -- Appointment status (PENDING, ACCEPTED, REJECTED,IN_PROGRESS,COMPLETED)
    PRIMARY KEY (`id`)
);

-- Create Prescription table
CREATE TABLE `prescription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dosage_instructions` VARCHAR(255) DEFAULT NULL,
    `frequency` VARCHAR(255) DEFAULT NULL,
    `medicine_name` VARCHAR(255) DEFAULT NULL,
    `appointment_id` BIGINT DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_prescription_appointment` (`appointment_id`),
    CONSTRAINT `FK_prescription_appointment`
        FOREIGN KEY (`appointment_id`)
        REFERENCES `appointments` (`id`)
);
