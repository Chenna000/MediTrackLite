package com.meditrack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Feedback {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private int rating;
	@Column(length = 150)
	private String comment;
	
	@ManyToOne
	@JoinColumn(name="appointment_id", nullable=false, unique=true)
	private Appointment appointment;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
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

	public Appointment getAppointment() {
		return appointment;
	}

	public void setAppointment(Appointment appointment) {
		this.appointment = appointment;
	}

	public Feedback(long id, int rating, String comment, Appointment appointment) {
		super();
		this.id = id;
		this.rating = rating;
		this.comment = comment;
		this.appointment = appointment;
	}
	
	
	public Feedback(int rating, String comment, Appointment appointment) {
		super();
		this.rating = rating;
		this.comment = comment;
		this.appointment = appointment;
	}

	public Feedback() {}
	
	
}
