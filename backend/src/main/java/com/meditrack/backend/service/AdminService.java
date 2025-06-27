package com.meditrack.backend.service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Feedback;
import com.meditrack.backend.model.FeedbackDto;
import com.meditrack.backend.model.User;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.FeedbackRepository;
import com.meditrack.backend.repository.PrescriptionRepository;
import com.meditrack.backend.repository.UserRepository;

@Service
public class AdminService {
	
	@Autowired 
	private AppointmentRepository appointmentRepo;
    @Autowired 
    private UserRepository userRepo;
    @Autowired
    private FeedbackRepository feedbackRepo;
    @Autowired
    private PrescriptionRepository prescriptionRepo;

    public Map<String, Long> getAppointmentsCountByStatus() {
        List<Object[]> result = appointmentRepo.countAppointmentsByStatus();
        return result.stream().collect(Collectors.toMap(
            row -> (String) row[0], 
            row -> (Long) row[1]
        ));
    }

    public Map<LocalDate, Long> getAppointmentsPerDay() {
        List<Object[]> result = appointmentRepo.countAppointmentsPerDay();
        return result.stream().collect(Collectors.toMap(
            row -> ((Date) row[0]).toLocalDate(),
            row -> (Long) row[1]
        ));
    }

    public Map<String, Long> getUserCounts() {
        Map<String, Long> map = new HashMap<>();
        map.put("Doctors", userRepo.countByRole("DOCTOR"));
        map.put("Patients", userRepo.countByRole("PATIENT"));
        return map;
    }

    public List<User> getUsersByStatus(String status) {
        return userRepo.findByStatusAndRoleNot(status, "ADMIN");
    }

    public String changeUserStatus(Long userId, String newStatus) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(newStatus);
        userRepo.save(user);
        return "User status updated to " + newStatus;
    }

    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepo.findByStatus(status);
    }
    
    public Map<String, Long> getAppointmentsByPatient() {
        List<Object[]> data = appointmentRepo.countAppointmentsByPatient();
        return data.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
        ));
    }

    public Map<String, Map<String, Long>> getAppointmentsByDoctorStatus() {
        List<Object[]> data = appointmentRepo.countAppointmentsByDoctorStatus();
        Map<String, Map<String, Long>> result = new HashMap<>();

        for (Object[] row : data) {
            String doctorEmail = (String) row[0];
            String status = (String) row[1];
            Long count = (Long) row[2];

            result.computeIfAbsent(doctorEmail, k -> new HashMap<>()).put(status, count);
        }

        return result;
    }
    
    @Transactional
    public String deleteUserByEmail(String email) {
        // Find all appointments by this user
        List<Appointment> appointments = appointmentRepo.findByDoctorEmailOrPatientEmail(email, email);
        List<Long> appointmentIds = appointments.stream().map(Appointment::getId).toList();

        // Delete feedback and prescriptions linked to those appointments
        if (!appointmentIds.isEmpty()) {
            feedbackRepo.deleteByAppointmentIdIn(appointmentIds);
            prescriptionRepo.deleteByAppointmentIdIn(appointmentIds);
        }

        // Delete appointments
        appointmentRepo.deleteByDoctorEmailOrPatientEmail(email, email);
        
        // Delete user
        userRepo.deleteByEmail(email);

        return "User and all associated data deleted successfully.";
    }
    
    public boolean deleteFeedbackByAppointmentId(Long appointmentId) {
        Optional<Feedback> feedbackOpt = feedbackRepo.findByAppointmentId(appointmentId);
        if (feedbackOpt.isPresent()) {
            feedbackRepo.delete(feedbackOpt.get());
            return true;
        }
        return false;
    }
    
    public List<FeedbackDto> getAllSimpleFeedbacks() {
        return feedbackRepo.findAll().stream().map(fb ->{
        	return new FeedbackDto(
        			fb.getId(),
        			fb.getRating(),
        			fb.getComment(),
        			fb.getAppointment().getId()
        			);
        }).collect(Collectors.toList());
    }
}
