package com.meditrack.backend.model;

public class OtpVerificationRequest {
	
	private String email;
	private String otp;
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getOtp() {
		return otp;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
	public OtpVerificationRequest(String email, String otp) {
		super();
		this.email = email;
		this.otp = otp;
	}
	public OtpVerificationRequest() {
		
	}
	
	
	
}
