package com.meditrack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback,Long> {

	Optional<Feedback> findByAppointment(Appointment appointment);
    boolean existsByAppointmentId(Long appointmentId);
    List<Feedback> findByAppointment_DoctorEmail(String doctorEmail);
}
