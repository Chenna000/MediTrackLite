package com.meditrack.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Prescription;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.FeedbackRepository;
import com.meditrack.backend.repository.PrescriptionRepository;

import jakarta.annotation.PostConstruct;

@Service
public class AppointmentCleanupService {
	
	 @Autowired
	    private AppointmentRepository appointmentRepo;

	    @Autowired
	    private FeedbackRepository feedbackRepo;

	    @Autowired
	    private PrescriptionRepository prescriptionRepo;

	    @Scheduled(cron = "0 0 2 * * *") // Runs daily at 2 AM
	    public void deleteOldAppointments() {
	        LocalDate cutoffDate = LocalDate.now().minusDays(10);
	        List<Appointment> oldAppointments = appointmentRepo.findByAppointmentDateBefore(cutoffDate);

	        for (Appointment appointment : oldAppointments) {
	            // Delete feedback
	            feedbackRepo.findByAppointment(appointment).ifPresent(feedbackRepo::delete);

	            // Delete prescriptions
	            List<Prescription> prescriptions = prescriptionRepo.findByAppointment(appointment);
	            if (!prescriptions.isEmpty()) {
	                prescriptionRepo.deleteAll(prescriptions);
	            }

	            // Finally delete appointment
	            appointmentRepo.delete(appointment);
	        }

	        System.out.println(" Deleted " + oldAppointments.size() + " old appointments and related data.");
	    }
	    
	    @PostConstruct
	    public void runOnStartup() {
	        deleteOldAppointments();
	    }

}
