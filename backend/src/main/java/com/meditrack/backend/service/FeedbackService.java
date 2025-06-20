package com.meditrack.backend.service;

import java.util.List;
import java.util.OptionalDouble;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Feedback;
import com.meditrack.backend.model.FeedbackRequest;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.FeedbackRepository;

@Service
public class FeedbackService {
	
	@Autowired
	private FeedbackRepository feedbackRepo;
	
	@Autowired
	private AppointmentRepository appointmentRepo;
	
	public String submitFeedback(FeedbackRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new IllegalStateException("Feedback can only be submitted for completed appointments.");
        }

        if (feedbackRepo.findByAppointment(appointment).isPresent()) {
            throw new IllegalStateException("Feedback already submitted for this appointment.");
        }

        Feedback feedback = new Feedback(request.getRating(), request.getComment(), appointment);
        feedbackRepo.save(feedback);
        return "Feedback submitted successfully.";
    }

    public List<Feedback> getDoctorFeedback(String doctorEmail) {
        return feedbackRepo.findByAppointment_DoctorEmail(doctorEmail);
    }

    public double getAverageRating(String doctorEmail) {
        List<Feedback> feedbacks = feedbackRepo.findByAppointment_DoctorEmail(doctorEmail);
        OptionalDouble avg = feedbacks.stream().mapToInt(Feedback::getRating).average();
        return avg.orElse(0.0);
    }

    public Feedback getFeedbackByAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return feedbackRepo.findByAppointment(appointment).orElse(null);
    }
}
