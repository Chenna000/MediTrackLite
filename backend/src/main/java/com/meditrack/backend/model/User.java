package com.meditrack.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="users")
public class User {
	public User() {}
	 public User(String name, String email, String password, String role, String specialization) {
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.specialization = specialization;
	}
	 
	 

	 	public User( String name, String email, String password, String role, String specialization,
			String status) {
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.specialization = specialization;
		this.status = status;
	}



		@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String name;

	    @Column(unique = true)
	    private String email;

	    private String password;

	    private String role; // "PATIENT" or "DOCTOR" or "ADMIN"
	    
	    private String specialization;
	    
	    @Column(name = "status")
	    private String status;
	    
	    
	    
	    public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
		}
		public String getSpecialization() {
			return specialization;
		}
		public void setSpecialization(String specialization) {
			this.specialization = specialization;
		}

		

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
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
	    
}
