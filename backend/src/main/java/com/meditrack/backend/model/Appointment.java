package com.meditrack.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name="appointments")
public class Appointment {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String doctorEmail;
	private String doctorName;
	private String patientEmail;
	private LocalDate appointmentDate;
	private String slot;
	private String phoneNo;
	private String problemDescription;
	private String status;
	private LocalDateTime createdAt;
	private String patientReportPath;
	@Version
    private Integer version;
	public Integer getVersion() {
		return version;
	}
	public void setVersion(Integer version) {
		this.version = version;
	}
	public String getPatientReportPath() {
		return patientReportPath;
	}
	public void setPatientReportPath(String patientReportPath) {
		this.patientReportPath = patientReportPath;
	}
	public String getPhoneNo() {
		return phoneNo;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public Appointment(Long id, String doctorEmail, String doctorName, String patientEmail, LocalDate appointmentDate,
			String slot,String phoneNo, String problemDescription, String status, LocalDateTime createdAt) {
		super();
		this.id = id;
		this.doctorEmail = doctorEmail;
		this.doctorName = doctorName;
		this.patientEmail = patientEmail;
		this.appointmentDate = appointmentDate;
		this.slot = slot;
		this.phoneNo = phoneNo;
		this.problemDescription = problemDescription;
		this.status = status;
		this.createdAt = createdAt;
	}
	
	public Appointment(Long id, String doctorEmail, String doctorName, String patientEmail, LocalDate appointmentDate,
			String slot, String phoneNo, String problemDescription, String status, LocalDateTime createdAt,
			String patientReportPath) {
		super();
		this.id = id;
		this.doctorEmail = doctorEmail;
		this.doctorName = doctorName;
		this.patientEmail = patientEmail;
		this.appointmentDate = appointmentDate;
		this.slot = slot;
		this.phoneNo = phoneNo;
		this.problemDescription = problemDescription;
		this.status = status;
		this.createdAt = createdAt;
		this.patientReportPath = patientReportPath;
	}
	public Appointment() {
		
	}
	
}
