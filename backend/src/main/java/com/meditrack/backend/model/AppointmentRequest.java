package com.meditrack.backend.model;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AppointmentRequest {
	 private String doctorEmail;
	 private String doctorName;
	 private String patientEmail;
	 private LocalDate appointmentDate;
	 private String slot;
	 private String phoneNo;
	 private String problemDescription;
	 
	public String getPhoneNo() {
		return phoneNo;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}
	public String getDoctorEmail() {
		return doctorEmail;
	}
	public void setDoctorEmail(String doctorEmail) {
		this.doctorEmail = doctorEmail;
	}
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getPatientEmail() {
		return patientEmail;
	}
	public void setPatientEmail(String patientEmail) {
		this.patientEmail = patientEmail;
	}
	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}
	public void setAppointmentDate(LocalDate appointmentDate) {
		this.appointmentDate = appointmentDate;
	}
	public String getSlot() {
		return slot;
	}
	public void setSlot(String slot) {
		this.slot = slot;
	}
	public String getProblemDescription() {
		return problemDescription;
	}
	public void setProblemDescription(String problemDescription) {
		this.problemDescription = problemDescription;
	}
	public AppointmentRequest(String doctorEmail, String doctorName, String patientEmail, LocalDate appointmentDate,
			String slot, String phoneNo, String problemDescription) {
		super();
		this.doctorEmail = doctorEmail;
		this.doctorName = doctorName;
		this.patientEmail = patientEmail;
		this.appointmentDate = appointmentDate;
		this.slot = slot;
		this.phoneNo = phoneNo;
		this.problemDescription = problemDescription;
	}
	public AppointmentRequest() {
		super();
	}
	

}
