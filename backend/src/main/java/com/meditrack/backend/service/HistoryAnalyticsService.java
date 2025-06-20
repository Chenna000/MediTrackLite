package com.meditrack.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Prescription;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.PrescriptionRepository;

@Service
public class HistoryAnalyticsService {
	
	@Autowired
	private AppointmentRepository appointmentRepo;
	
	@Autowired
	private PrescriptionRepository prescriptionRepo;
	
	 public List<Map<String, Object>> getPatientTimeline(String patientEmail) {
	        List<Appointment> appointments = appointmentRepo.findByPatientEmailOrderByAppointmentDateDesc(patientEmail);
	        List<Map<String, Object>> timeline = new ArrayList<>();

	        for (Appointment appt : appointments) {
	            Map<String, Object> entry = new HashMap<>();
	            entry.put("date", appt.getAppointmentDate());
	            entry.put("doctorName", appt.getDoctorName());
	            entry.put("slot", appt.getSlot());
	            entry.put("status", appt.getStatus());
	            entry.put("report", appt.getPatientReportPath());

	            List<Prescription> prescriptions = prescriptionRepo.findByAppointment(appt);
	            entry.put("prescriptions", prescriptions);

	            timeline.add(entry);
	        }

	        return timeline;
	    }

	    public Map<String, Object> getDoctorAnalytics(String doctorEmail) {
	        List<Appointment> appointments = appointmentRepo.findByDoctorEmail(doctorEmail);
	        Set<String> patientSet = appointments.stream().map(Appointment::getPatientEmail).collect(Collectors.toSet());

	        List<Prescription> prescriptions = prescriptionRepo.findByAppointment_DoctorEmail(doctorEmail);

	        Map<String, Long> medicineCount = prescriptions.stream()
	                .collect(Collectors.groupingBy(Prescription::getMedicineName, Collectors.counting()));

	        long totalAppointments = appointments.size();
	        long avgTime = totalAppointments == 0 ? 0 : (totalAppointments*30)/totalAppointments;

	        Map<String, Object> analytics = new HashMap<>();
	        analytics.put("patientCount", patientSet.size());
	        analytics.put("averageConsultationTime", avgTime);
	        analytics.put("mostPrescribedMeds", medicineCount);

	        return analytics;
	    }

}
