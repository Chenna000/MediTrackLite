package com.meditrack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.meditrack.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
	List<User> findByRole(String role);
	 @Query("SELECT u.email FROM User u WHERE u.role = 'DOCTOR'")
	    List<String> findEmailsByRole(@Param("role") String role);
	 
	 @Query("SELECT DISTINCT u.specialization FROM User u WHERE u.role <> 'PATIENT' AND u.specialization IS NOT NULL")
	    List<String> findDistinctSpecializationsExcludingPatients();

	    List<User> findByRoleAndSpecialization(String role, String specialization);
	
}
