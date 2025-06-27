package com.meditrack.backend.model;

public class RegisterRequest {
	private String name;
	private String email;
	private String password;
	private String role;
	private String specialization;
	private String backupmail;
	
	
	
	public String getBackupmail() {
		return backupmail;
	}
	public void setBackupmail(String backupmail) {
		this.backupmail = backupmail;
	}
	public String getSpecialization() {
		return specialization;
	}
	public void setSpecialization(String specialization) {
		this.specialization = specialization;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public RegisterRequest(String name, String email, String password, String role, String specialization) {
		super();
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.specialization = specialization;
	}
	public RegisterRequest() {
		
	}
	public RegisterRequest(String name, String email, String password, String role, String specialization,
			String backupmail) {
		super();
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.specialization = specialization;
		this.backupmail = backupmail;
	}
	
	
}
