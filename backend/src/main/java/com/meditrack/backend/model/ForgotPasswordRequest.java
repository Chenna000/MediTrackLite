package com.meditrack.backend.model;

public class ForgotPasswordRequest {
	
	private String email;
	private String backupEmail;
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getBackupEmail() {
		return backupEmail;
	}
	public void setBackupEmail(String backupEmail) {
		this.backupEmail = backupEmail;
	}
	public ForgotPasswordRequest(String email, String backupEmail) {
		super();
		this.email = email;
		this.backupEmail = backupEmail;
	}
	public ForgotPasswordRequest() {
		super();
	}
	
	
	
	

}
