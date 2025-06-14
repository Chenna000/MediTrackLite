package com.meditrack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meditrack.backend.model.Prescription;
import com.meditrack.backend.model.PrescriptionDto;
import com.meditrack.backend.model.PrescriptionRequest;
import com.meditrack.backend.service.PrescriptionService;

@RestController
@RequestMapping("/prescriptions")
@CrossOrigin(origins="http://localhost:5173")
public class PrescriptionController {

	 @Autowired
	    private PrescriptionService prescriptionService;

	    @PostMapping("/upload")
	    public ResponseEntity<String> addPrescription(@RequestBody PrescriptionRequest request) {
	        return ResponseEntity.ok(prescriptionService.addPrescription(request));
	    }

	
	    
	    @GetMapping("/{appointmentId}")
	    public ResponseEntity<List<PrescriptionDto>> getPrescriptions(@PathVariable Long appointmentId) {
	        List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionByAppointmentId(appointmentId);
	        return ResponseEntity.ok(prescriptions);
	    }
}
