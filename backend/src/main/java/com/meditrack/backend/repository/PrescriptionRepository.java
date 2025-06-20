package com.meditrack.backend.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long>{
    List<Prescription> findByAppointmentId(Long appointmentId);

	List<Prescription> findByAppointment(Appointment appointment);
	
    List<Prescription> findByAppointment_DoctorEmail(String doctorEmail);

}
