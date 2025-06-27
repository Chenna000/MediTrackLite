package com.meditrack.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Prescription;
import com.meditrack.backend.model.PrescriptionDto;
import com.meditrack.backend.model.PrescriptionRequest;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.PrescriptionRepository;
import com.meditrack.backend.repository.UserRepository;

@Service
public class PrescriptionService {
	
		@Autowired
	    private PrescriptionRepository prescriptionRepo;

	    @Autowired
	    private AppointmentRepository appointmentRepo;
	    
	    @Autowired
	    private UserRepository userRepo;
	    
	    @Autowired
	    private EmailService emailService;

	    public String addPrescription(PrescriptionRequest request, String labReportsPath) {
	        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
	                .orElseThrow(() -> new RuntimeException("Appointment not found"));

	        if (!"ACCEPTED".equals(appointment.getStatus()) && !"IN_PROGRESS".equals(appointment.getStatus())) {
	            throw new IllegalStateException("Prescription can only be added for accepted or in-progress appointments.");
	        }

	        List<Prescription> prescriptions = request.getPrescriptions();
	        prescriptions.forEach(p ->	{ 
	        	p.setAppointment(appointment);
	        	p.setConsultationNotes(request.getConsultationNotes());
	        	p.setLabReportsPath(labReportsPath);
	        	});
	        prescriptionRepo.saveAll(prescriptions);

	        appointment.setStatus("COMPLETED");
	        appointmentRepo.save(appointment);
	        statusUpdateEmail("COMPLETED",appointment);
	        
	        return "Prescriptions saved and appointment marked as COMPLETED.";
	    }

	    public List<PrescriptionDto> getPrescriptionByAppointmentId(Long appointmentId) {
	    	System.out.println(prescriptionRepo.findByAppointmentId(appointmentId).getFirst());
	    	List<Prescription> prescriptions = prescriptionRepo.findByAppointmentId(appointmentId);
	    	
	    	 List<PrescriptionDto> dtoList = prescriptions.stream()
	    	            .map(PrescriptionDto::new)
	    	            .collect(Collectors.toList());
	    	    return  dtoList;
	    }
	    
	    public void statusUpdateEmail(String status, Appointment appointment) {
	    	
	    	String doctorName = appointment.getDoctorName();
	    	String patientName = userRepo.findByEmail(appointment.getPatientEmail()).get().getName();
	    	LocalDate date = appointment.getAppointmentDate();
	    	String time = appointment.getSlot();
	    	String backupEmail = userRepo.findByEmail(appointment.getPatientEmail()).get().getBackupmail();
	    	
	    	String subject = "Appointment Status Update";
	        String statusMessage  = "has been <strong>COMPLETED</strong>. You can now view your prescription and provide feedback.";   
	        String body = "<html>" +
	                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
	                "<h2 style='color: #2a9df4;'>Appointment Status Update</h2>" +
	                "<p>Dear <strong>" + patientName + "</strong>,</p>" +
	                "<p>Your appointment with <strong>Dr. " + doctorName + "</strong> on <strong>" + date + "</strong> at <strong>" + time + "</strong> " +
	                statusMessage + "</p>" +
	                "<p>Thank you for using <strong>MediTrackLite</strong>.</p>" +
	                "<p>Regards,<br/>Team MediTrackLite</p>" +
	                "</body>" +
	                "</html>";
	        
	        emailService.sendEmail(backupEmail, subject, body);
	    }


}
