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
import com.meditrack.backend.repository.UserRepository;

@Service
public class FeedbackService {
	
	@Autowired
	private FeedbackRepository feedbackRepo;
	
	@Autowired
	private AppointmentRepository appointmentRepo;
	
	@Autowired
	private UserRepository userRepo;
	
	@Autowired
	private EmailService emailService;
	
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
        feedbackEmail(appointment,request);
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
    
    public void feedbackEmail(Appointment appointment, FeedbackRequest request){
    	String backupEmail = userRepo.findByEmail(appointment.getDoctorEmail()).get().getBackupmail();
    	String patientName = userRepo.findByEmail(appointment.getPatientEmail()).get().getName();
    	String subject = "You've Received Feedback from Mr. "+patientName;
    	
    	String body = "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<h2 style='color: #f4a742;'>New Feedback Received</h2>" +
                "<p>Dear <strong>Dr. " +appointment.getDoctorName()+ "</strong>,</p>" +
                "<p>You have received feedback for an appointment.</p><br/>" +
                "<ul>" +
                "<li><strong>Appointment Date:</strong> " + appointment.getAppointmentDate() + "</li>" +
                "<li><strong>Time Slot:</strong> " + appointment.getSlot() + "</li>" +
                "<li><strong>Rating:</strong> " + request.getRating() + " / 5</li>" +
                (request.getComment() != null && !request.getComment().isEmpty() ?
                    "<li><strong>Comment:</strong> " + request.getComment() + "</li>" : "") +
                "</ul>" +
                "<br/><p>Thank you for your service and dedication.</p>" +
                "<p>Best regards,<br/>Team MediTrackLite</p>" +
                "</body>" +
                "</html>";
    	emailService.sendEmail(backupEmail, subject, body);
    	
    }
}
