package com.meditrack.backend.model;

public class FeedbackDto {
	private Long feedbackId;
    private int rating;
    private String comment; 
    private Long appointmentId;
	public Long getFeedbackId() {
		return feedbackId;
	}
	public void setFeedbackId(Long feedbackId) {
		this.feedbackId = feedbackId;
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
	public Long getAppointmentId() {
		return appointmentId;
	}
	public void setAppointmentId(Long appointmentId) {
		this.appointmentId = appointmentId;
	}
	public FeedbackDto(Long feedbackId, int rating, String comment, Long appointmentId) {
		super();
		this.feedbackId = feedbackId;
		this.rating = rating;
		this.comment = comment;
		this.appointmentId = appointmentId;
	}
	public FeedbackDto() {
		
	}
    
    
}
