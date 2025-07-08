package com.meditrack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.meditrack.backend.model.PrescriptionDto;
import com.meditrack.backend.model.PrescriptionRequest;
import com.meditrack.backend.service.FileStorageService;
import com.meditrack.backend.service.PrescriptionService;

@RestController
@RequestMapping("/prescriptions")
@CrossOrigin(origins = { "http://localhost:5173", "https://meditrack-frontend-p0sd.onrender.com"})
public class PrescriptionController {

	 @Autowired
	    private PrescriptionService prescriptionService;
	 
	 @Autowired
	 private FileStorageService fileStorageService;

	    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	    public ResponseEntity<String> addPrescription(
	        @RequestPart("data") PrescriptionRequest request,
	        @RequestPart(value = "labReport", required = false) MultipartFile file) {

	        String filename = null;
	        if (file != null && !file.isEmpty()) {
	            filename = fileStorageService.saveFile(file);
	        }

	        return ResponseEntity.ok(prescriptionService.addPrescription(request, filename));
	    }
	    
	    @GetMapping("/{appointmentId}")
	    public ResponseEntity<List<PrescriptionDto>> getPrescriptions(@PathVariable Long appointmentId) {
	        List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionByAppointmentId(appointmentId);
	        return ResponseEntity.ok(prescriptions);
	    }
}
