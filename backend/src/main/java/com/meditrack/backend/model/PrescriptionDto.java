package com.meditrack.backend.model;

public class PrescriptionDto {
	
	 private String medicineName;
	 private String dosageInstructions;
	 private String frequency;
	 private String consultationNotes;
	 
	 public PrescriptionDto(Prescription p) {
	        this.medicineName = p.getMedicineName();
	        this.dosageInstructions = p.getDosageInstructions();
	        this.frequency = p.getFrequency();
	        this.consultationNotes = p.getConsultationNotes();
	    }

	 
	public String getConsultationNotes() {
		return consultationNotes;
	}


	public void setConsultationNotes(String consultationNotes) {
		this.consultationNotes = consultationNotes;
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
	 
	public PrescriptionDto() {}

}
