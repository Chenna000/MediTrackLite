package com.meditrack.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.FeedbackDto;
import com.meditrack.backend.model.User;
import com.meditrack.backend.service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "https://meditrack-frontend-p0sd.onrender.com")
public class AdminController {
	
	 @Autowired 
	 private AdminService adminService;

	    @GetMapping("/stats/status")
	    public Map<String, Long> getAppointmentsCountByStatus() {
	        return adminService.getAppointmentsCountByStatus();
	    }

	    @GetMapping("/stats/daily")
	    public Map<LocalDate, Long> getAppointmentsPerDay() {
	        return adminService.getAppointmentsPerDay();
	    }

	    @GetMapping("/stats/users")
	    public Map<String, Long> getUserCounts() {
	        return adminService.getUserCounts();
	    }

	    @GetMapping("/users")
	    public List<User> getUsersByStatus(@RequestParam String status) {
	        return adminService.getUsersByStatus(status);
	    }

	    @PutMapping("/users/{id}/status")
	    public String updateUserStatus(@PathVariable Long id, @RequestParam String status) {
	        return adminService.changeUserStatus(id, status);
	    }

	    @GetMapping("/appointments")
	    public List<Appointment> getAppointmentsByStatus(@RequestParam String status) {
	        return adminService.getAppointmentsByStatus(status);
	    }
	    
	    @GetMapping("/appointments-by-patient")
	    public Map<String, Long> getAppointmentsByPatient() {
	        return adminService.getAppointmentsByPatient();
	    }

	    @GetMapping("/appointments-by-doctor")
	    public Map<String, Map<String, Long>> getAppointmentsByDoctorStatus() {
	        return adminService.getAppointmentsByDoctorStatus();
	    }
	    
	    @DeleteMapping("/delete-user")
	    public ResponseEntity<String> deleteUser(@RequestParam String email) {
	        String result = adminService.deleteUserByEmail(email);
	        return ResponseEntity.ok(result);
	    }
	    
	    @DeleteMapping("/appointment/{appointmentId}")
	    public ResponseEntity<String> deleteFeedbackByAppointmentId(@PathVariable Long appointmentId) {
	        boolean deleted = adminService.deleteFeedbackByAppointmentId(appointmentId);
	        return deleted ?
	            ResponseEntity.ok("Feedback linked to appointment deleted successfully.") :
	            ResponseEntity.status(HttpStatus.NOT_FOUND).body("No feedback found for this appointment.");
	    }
	    
	    @GetMapping("/feedbacks")
	    public ResponseEntity<List<FeedbackDto>> getSimpleFeedbacks() {
	        return ResponseEntity.ok(adminService.getAllSimpleFeedbacks());
	    }

}
