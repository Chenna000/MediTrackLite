package com.meditrack.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.AppointmentRequest;
import com.meditrack.backend.service.AppointmentService;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins="http://localhost:5173")
public class AppointmentController {
	
	@Autowired
    private AppointmentService appointmentService;
@PostMapping("/validate")
public ResponseEntity<String> validateAppointment(@RequestBody AppointmentRequest request) {
    return appointmentService.validateAppointmentRequest(request);
}

    @GetMapping("/available-doctors")
    public List<String> getAvailableDoctors(@RequestParam String date) {
        return appointmentService.getAvailableDoctors(LocalDate.parse(date));
    }

    @GetMapping("/available-slots")
    public List<String> getAvailableSlots(@RequestParam String doctorEmail, @RequestParam String date) {
        return appointmentService.getAvailableSlots(doctorEmail, LocalDate.parse(date));
    }

//    @PostMapping
//    public ResponseEntity<String> bookAppointment(@RequestBody AppointmentRequest request) {
//        return appointmentService.bookAppointment(request);
//    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> bookAppointment(
        @RequestPart("data") AppointmentRequest request,
        @RequestPart(value = "report", required = false) MultipartFile reportFile
    ) {
        return appointmentService.bookAppointment(request, reportFile);
    }

    @GetMapping("/patient")
    public List<Appointment> getPatientAppointments(@RequestParam String email) {
        return appointmentService.getAppointmentsByPatient(email);
    }

    @GetMapping("/doctor")
    public List<Appointment> getDoctorAppointments(@RequestParam String email) {
        return appointmentService.getAppointmentsByDoctor(email);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return appointmentService.updateAppointmentStatus(id, status);
    }
    
    @GetMapping("/patient/{id}")
    public ResponseEntity<Appointment> getAppointmentDetails(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }
    
    @GetMapping("/doctor/pending")
    public List<Appointment> getPendingAppointments(@RequestParam String email) {
        return appointmentService.getDoctorAppointmentsByStatus(email, "PENDING");
    }

    @GetMapping("/doctor/accepted")
    public List<Appointment> getAcceptedAppointments(@RequestParam String email) {
        return appointmentService.getDoctorAppointmentsByStatus(email, "ACCEPTED");
    }
    
    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getAllSpecializations() {
        List<String> specs = appointmentService.getAllSpecializations();
        return ResponseEntity.ok(specs);
    }

    @GetMapping("/doctorsdata")
    public ResponseEntity<List<Map<String, String>>> getDoctorsBySpecialization(
            @RequestParam String specialization,
            @RequestParam String date) {
        
        List<Map<String, String>> availableDoctors = appointmentService.getAvailableDoctorsBySpecialization(specialization, LocalDate.parse(date));
        return ResponseEntity.ok(availableDoctors);
    }
}
