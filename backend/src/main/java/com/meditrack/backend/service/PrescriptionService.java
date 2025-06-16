package com.meditrack.backend.service;

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

@Service
public class PrescriptionService {
	
	 @Autowired
	    private PrescriptionRepository prescriptionRepo;

	    @Autowired
	    private AppointmentRepository appointmentRepo;

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

	        return "Prescriptions saved and appointment marked as COMPLETED.";
	    }

	    // get All Prescription Details 
	    public List<PrescriptionDto> getPrescriptionByAppointmentId(Long appointmentId) {
	    	System.out.println(prescriptionRepo.findByAppointmentId(appointmentId).getFirst());
	    	List<Prescription> prescriptions = prescriptionRepo.findByAppointmentId(appointmentId);
	    	
	    	 List<PrescriptionDto> dtoList = prescriptions.stream()
	    	            .map(PrescriptionDto::new)
	    	            .collect(Collectors.toList());
	    	    return  dtoList;
	    }

}
