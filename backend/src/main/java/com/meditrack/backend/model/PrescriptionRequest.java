package com.meditrack.backend.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class PrescriptionRequest {
	
	 private Long appointmentId;
	 
	 @JsonProperty("prescriptions")
	 private List<Prescription> prescriptions;
	 private String consultationNotes;
	 
	public String getConsultationNotes() {
		return consultationNotes;
	}
	public void setConsultationNotes(String consultationNotes) {
		this.consultationNotes = consultationNotes;
	}
	public Long getAppointmentId() {
		return appointmentId;
	}
	public void setAppointmentId(Long appointmentId) {
		this.appointmentId = appointmentId;
	}
	public List<Prescription> getPrescriptions() {
		return prescriptions;
	}
	public void setPrescriptions(List<Prescription> prescriptions) {
		this.prescriptions = prescriptions;
	}
	public PrescriptionRequest(Long appointmentId, List<Prescription> prescriptions, String consultationNotes) {
		super();
		this.appointmentId = appointmentId;
		this.prescriptions = prescriptions;
		this.consultationNotes = consultationNotes;
	}
	public PrescriptionRequest() {
		
	}
	 
	
}
