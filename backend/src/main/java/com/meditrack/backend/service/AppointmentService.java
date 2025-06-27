package com.meditrack.backend.service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.AppointmentRequest;
import com.meditrack.backend.model.User;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.UserRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private EmailService emailService;
  

    private static final List<String> ALL_SLOTS = List.of(
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "02:00 PM", "02:30 PM", "03:00 PM",
        "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
    );

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    public List<String> getAvailableDoctors(LocalDate date) {
        List<String> doctorEmails = userRepo.findEmailsByRole("DOCTOR");
        return doctorEmails.stream()
            .filter(email -> {
                List<String> bookedSlots = appointmentRepo.findSlotsByDoctorAndDate(email, date);
                return bookedSlots.size() < ALL_SLOTS.size(); // doctor has at least one free slot
            })
            .collect(Collectors.toList());
    }

    public List<String> getAvailableSlots(String doctorEmail, LocalDate date) {
        List<String> booked = appointmentRepo.findSlotsByDoctorAndDate(doctorEmail, date);
        LocalTime now = LocalTime.now();

        return ALL_SLOTS.stream()
            .filter(slot -> {
                try {
                    LocalTime slotTime = LocalTime.parse(slot, TIME_FORMATTER);

                    // Enforce 1-hour ahead rule for same-day bookings
                    if (date.isEqual(LocalDate.now())) {
                        return slotTime.isAfter(now.plusHours(1));
                    }
                    return true;
                } catch (DateTimeParseException e) {
                    System.err.println("Invalid slot format: " + slot);
                    return false;
                }
            })
            .filter(slot -> !booked.contains(slot)) // filter out already booked slots
            .collect(Collectors.toList());
    }

   public ResponseEntity<String> validateAppointmentRequest(AppointmentRequest request) {
    String patientEmail = request.getPatientEmail();
    String doctorEmail = request.getDoctorEmail();
    LocalDate date = request.getAppointmentDate();

    if (userRepo.findByEmail(patientEmail).isEmpty()) {
        return ResponseEntity.badRequest().body("Patient is not registered.");
    }
    if (userRepo.findByEmail(doctorEmail).isEmpty()) {
        return ResponseEntity.badRequest().body("Doctor is not registered.");
    }
    if (date.isBefore(LocalDate.now())) {
        return ResponseEntity.badRequest().body("You cannot book appointment for past days.");
    }

    long todayCount = appointmentRepo.countByPatientEmailAndAppointmentDate(patientEmail, date);
    if (todayCount >= 2) {
        return ResponseEntity.badRequest().body("You cannot book more than 2 appointments on the same day.");
    }

    String problem = request.getProblemDescription();
    if (problem == null || problem.trim().isEmpty()) {
        return ResponseEntity.badRequest().body("Problem description cannot be empty.");
    }
    if (problem.length() > 200) {
        return ResponseEntity.badRequest().body("Problem description must be less than 200 characters.");
    }

    String requestedSlot = request.getSlot();
    List<String> booked = appointmentRepo.findSlotsByDoctorAndDate(doctorEmail, date);
    if (booked.contains(requestedSlot)) {
        return ResponseEntity.badRequest().body("Selected slot is already booked.");
    }

    if (date.isEqual(LocalDate.now())) {
        try {
            LocalTime slotTime = LocalTime.parse(requestedSlot, TIME_FORMATTER);
            if (slotTime.isBefore(LocalTime.now().plusHours(1))) {
                return ResponseEntity.badRequest().body("Slot must be at least 1 hour ahead of current time.");
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid slot format.");
        }
    }

    return ResponseEntity.ok("Validation passed");
}
public ResponseEntity<String> bookAppointment(AppointmentRequest request, MultipartFile reportFile) {
    ResponseEntity<String> validationResult = validateAppointmentRequest(request);
    if (!validationResult.getStatusCode().is2xxSuccessful()) {
        return validationResult; // If validation fails, return error directly
    }

    Appointment app = new Appointment();
    app.setPatientEmail(request.getPatientEmail());
    app.setDoctorEmail(request.getDoctorEmail());
    app.setDoctorName(request.getDoctorName());
    app.setAppointmentDate(request.getAppointmentDate());
    app.setSlot(request.getSlot());
    app.setPhoneNo(request.getPhoneNo());
    app.setProblemDescription(request.getProblemDescription().trim());
    app.setStatus("PENDING");
    app.setCreatedAt(LocalDateTime.now());

    if (reportFile != null && !reportFile.isEmpty()) {
        String filePath = fileStorageService.saveFile(reportFile);
        app.setPatientReportPath(filePath);
    }

    appointmentRepo.save(app);
    String user1 = userRepo.findByEmail(request.getPatientEmail()).get().getName();
    String backupEmail = userRepo.findByEmail(request.getPatientEmail()).get().getBackupmail();
    String subject = "Appointment Booked Successfully!!!!";
    String body = "<html>" +
    	    "<body style='font-family: Arial, sans-serif; color: #333;'>"
    	    + "<h2 style='color: #2a9df4;'>Appointment Confirmation</h2>"
    	    + "<p>Dear <strong>" + user1 + "</strong>,</p>"
    	    + "<p>Your appointment with <strong>Dr. " + request.getDoctorName() + "</strong> has been successfully booked.</p>"
    	    + "<p>We will notify you once the doctor reviews and approves your appointment. This usually happens within 30 minutes.</p><br/>"
    	    +"<ul>"
    	    +"<li><strong>Date: <strong>"+request.getAppointmentDate()+"</li>"
    	    +"<li><strong>Time: <strong>"+request.getSlot()+"</li>"
    	    + "<br/><br/><p style='margin-top: 20px;'>Thank you for choosing <strong>MediTrackLite</strong>!</p>"
    	    + "<p>Best regards,<br/>Team MediTrackLite</p>"
    	    + "</body>"
    	    + "</html>";

    String backupEmailDoc = userRepo.findByEmail(request.getDoctorEmail()).get().getBackupmail();
    String subjectDoc = "New Appointment Scheduled"; 
    String bodyDoc = "<html>" + 
        "<body style='font-family: Arial, sans-serif; color: #333;'>" +
        "<h2 style='color: #28a745;'>New Appointment Notification</h2>" +
        "<p>Dear <strong>Dr. " + request.getDoctorName() + "</strong>,</p>" +
        "<p>A new appointment has been booked by <strong>" + user1 + "</strong>.</p>" +
        "<p>Please review and take action on the appointment as soon as possible.</p>" +
        "<ul>" +
        "<li><strong>Date:</strong> " + request.getAppointmentDate() + "</li>" +
        "<li><strong>Time:</strong> " + request.getSlot() + "</li>" +
        "</ul>" +
        "<p style='margin-top: 20px;'>You can manage this appointment from your dashboard.</p>" +
        "<p>Best regards,<br/>Team MediTrackLite</p>" +
        "</body>" +
        "</html>";

    emailService.sendEmail(backupEmail, subject, body);
    emailService.sendEmail(backupEmailDoc, subjectDoc, bodyDoc);
    return ResponseEntity.ok("Appointment booked successfully.");
}


    public List<Appointment> getAppointmentsByPatient(String email) {
        return appointmentRepo.findByPatientEmailOrderByAppointmentDateDesc(email);
    }

    public List<Appointment> getAppointmentsByDoctor(String email) {
        return appointmentRepo.findByDoctorEmailOrderByAppointmentDateDesc(email);
    }

    public ResponseEntity<String> updateAppointmentStatus(Long id, String status) {
        Optional<Appointment> optional = appointmentRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body("Appointment not found.");
        }
        if(optional.get().getStatus().equals("REJECTED")) {
        	return ResponseEntity.badRequest().body("Appointment Alredy Rejected");
        }
        if(optional.get().getStatus().equals("COMPLETED")) {
        	return ResponseEntity.badRequest().body("Appointment already completed");
        }
        Appointment app = optional.get();
        app.setStatus(status.toUpperCase());
        appointmentRepo.save(app);
        	
        if(!status.equals("IN_PROGRESS")) {
        	statusUpdateEmail(status,optional);
        }
       
        return ResponseEntity.ok("Appointment status updated to " + status.toUpperCase() + ".");
    }
    
    public Appointment getAppointmentById(Long id) {
        return appointmentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }
    
    public List<Appointment> getDoctorAppointmentsByStatus(String email, String status) {
        return appointmentRepo.findByDoctorEmailAndStatusOrderByAppointmentDateDesc(email, status.toUpperCase());
    }
    
    // Scheduled method to auto-reject stale pending appointments
    @Scheduled(fixedRate = 300000) 
    public void autoRejectStaleAppointments() {
        List<Appointment> pending = appointmentRepo.findByStatus("PENDING");

        LocalDateTime now = LocalDateTime.now();
        List<Appointment> toReject = pending.stream()
                .filter(a -> Duration.between(a.getCreatedAt(), now).toMinutes() > 30)
                .collect(Collectors.toList());

        toReject.forEach(appt -> {
            appt.setStatus("REJECTED");
            appointmentRepo.save(appt);
            statusUpdateEmail("REJECTED",appt);
            System.out.println("Auto-rejected appointment ID: " + appt.getId());
        });
    }
    
    public List<String> getAllSpecializations() {
        return userRepo.findDistinctSpecializationsExcludingPatients();
    }
    
    public List<Map<String, String>> getAvailableDoctorsBySpecialization(String specialization, LocalDate date) {
        if (date == null) date = LocalDate.now();

        List<User> doctors = userRepo.findByRoleAndSpecialization("DOCTOR", specialization);
        List<Map<String, String>> result = new ArrayList<>();

        for (User doc : doctors) {
            List<String> bookedSlots = appointmentRepo.findSlotsByDoctorAndDate(doc.getEmail(), date);
            if (bookedSlots.size() < ALL_SLOTS.size()) {
                Map<String, String> doctorInfo = new HashMap<>();
                doctorInfo.put("email", doc.getEmail());
                doctorInfo.put("name", doc.getName());
                result.add(doctorInfo);
            }
        }

        return result;
    }
    
    @Scheduled(fixedRate = 300000) // Runs every 5 minutes
    public void updateAppointmentsToInProgress() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Appointment> acceptedAppointments = appointmentRepo.findAcceptedAppointments(today);

        for (Appointment appt : acceptedAppointments) {
            try {
                LocalTime slotTime = LocalTime.parse(appt.getSlot(), TIME_FORMATTER);
                boolean isTodayAndTimePassed = appt.getAppointmentDate().isEqual(today) && slotTime.isBefore(now);
                boolean isPastDate = appt.getAppointmentDate().isBefore(today);

                if ((isTodayAndTimePassed || isPastDate) && "ACCEPTED".equals(appt.getStatus())) {
                    appt.setStatus("IN_PROGRESS");
                    appointmentRepo.save(appt);
                }
            } catch (Exception e) {
                System.err.println("Error parsing slot time: " + appt.getSlot());
            }
        }
    }
    
    public void statusUpdateEmail(String status, Optional<Appointment> appointment) {
    	
    	String doctorName = appointment.get().getDoctorName();
    	String patientName = userRepo.findByEmail(appointment.get().getPatientEmail()).get().getName();
    	LocalDate date = appointment.get().getAppointmentDate();
    	String time = appointment.get().getSlot();
    	String backupEmail = userRepo.findByEmail(appointment.get().getPatientEmail()).get().getBackupmail();
    	
    	String subject = "Appointment Status Update";
        String statusMessage = "";

        switch (status.toUpperCase()) {
            case "ACCEPTED":
                statusMessage = "has been <strong>ACCEPTED</strong> by Dr. " + doctorName + ".";
                break;
            case "REJECTED":
                statusMessage = "has been <strong>REJECTED</strong> by Dr. " + doctorName + ". </p><br/> <p>We apologize for the inconvenience. You may try booking another slot at your convenience.<br/> Your amount will be refunded within 2 business days." ;
                break;
            default:
                statusMessage = "has been updated.";
        }
        
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
    
	public void statusUpdateEmail(String status, Appointment appointment) {
	    	
	    	String doctorName = appointment.getDoctorName();
	    	String patientName = userRepo.findByEmail(appointment.getPatientEmail()).get().getName();
	    	LocalDate date = appointment.getAppointmentDate();
	    	String time = appointment.getSlot();
	    	String backupEmail = userRepo.findByEmail(appointment.getPatientEmail()).get().getBackupmail();
	    	
	    	String subject = "Appointment Status Update";
	    	String statusMessage = "has been <strong style='color:red;'>auto-rejected</strong> due to doctor unavailability. Please try booking again at a different time.";
	    	String body = "<html>" +
	    	    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
	    	    "<h2 style='color: #d9534f;'>Appointment Status Update</h2>" +
	    	    "<p>Dear <strong>" + patientName + "</strong>,</p>" +
	    	    "<p>We regret to inform you that your appointment with <strong>Dr. " + doctorName + "</strong> " +
	    	    "scheduled on <strong>" + date + "</strong> at <strong>" + time + "</strong> " + statusMessage + "</p>" +
	    	    "<p>We apologize for the inconvenience. You may try booking another slot at your convenience.</p>" +
	    	    "<p>Your amount will be refunded within 2 business days.</p>"+
	    	    "<p>Thank you for using <strong>MediTrackLite</strong>.</p>" +
	    	    "<p>Best regards,<br/>Team MediTrackLite</p>" +
	    	    "</body>" +
	    	    "</html>";

	        
	        emailService.sendEmail(backupEmail, subject, body);
	    }
}