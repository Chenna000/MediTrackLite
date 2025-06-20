package com.meditrack.backend.model;

public class FeedbackRequest {

	private Long appointmentId;
	private int rating;
	private String comment;
	public Long getAppointmentId() {
		return appointmentId;
	}
	public void setAppointmentId(Long appointmentId) {
		this.appointmentId = appointmentId;
	}
	public int getRating() {
		return rating;
	}
	public void setRating(int rating) {
		this.rating = rating;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public FeedbackRequest(Long appointmentId, int rating, String comment) {
		super();
		this.appointmentId = appointmentId;
		this.rating = rating;
		this.comment = comment;
	}
	public FeedbackRequest() {}
	
	
}
