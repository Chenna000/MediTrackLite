package com.meditrack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class Prescription {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medicineName;
    private String dosageInstructions;
    private String frequency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    
    @Column(length = 1000)
    private String consultationNotes;
    
    private String labReportsPath;
    
    
	public String getLabReportsPath() {
		return labReportsPath;
	}

	public void setLabReportsPath(String labReportsPath) {
		this.labReportsPath = labReportsPath;
	}

	public String getConsultationNotes() {
		return consultationNotes;
	}

	public void setConsultationNotes(String consultationNotes) {
		this.consultationNotes = consultationNotes;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMedicineName() {
		return medicineName;
	}

	public void setMedicineName(String medicineName) {
		this.medicineName = medicineName;
	}

	public String getDosageInstructions() {
		return dosageInstructions;
	}

	public void setDosageInstructions(String dosageInstructions) {
		this.dosageInstructions = dosageInstructions;
	}

	public String getFrequency() {
		return frequency;
	}

	public void setFrequency(String frequency) {
		this.frequency = frequency;
	}

	public Appointment getAppointment() {
		return appointment;
	}

	public void setAppointment(Appointment appointment) {
		this.appointment = appointment;
	}

	public Prescription(Long id, String medicineName, String dosageInstructions, String frequency,
			Appointment appointment, String consultationNotes) {
		super();
		this.id = id;
		this.medicineName = medicineName;
		this.dosageInstructions = dosageInstructions;
		this.frequency = frequency;
		this.appointment = appointment;
		this.consultationNotes = consultationNotes;
	}

	
	public Prescription(Long id, String medicineName, String dosageInstructions, String frequency,
			Appointment appointment, String consultationNotes, String labReportsPath) {
		super();
		this.id = id;
		this.medicineName = medicineName;
		this.dosageInstructions = dosageInstructions;
		this.frequency = frequency;
		this.appointment = appointment;
		this.consultationNotes = consultationNotes;
		this.labReportsPath = labReportsPath;
	}

	public Prescription() {
	}
    
	

}
