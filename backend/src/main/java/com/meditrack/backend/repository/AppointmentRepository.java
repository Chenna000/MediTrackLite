package com.meditrack.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.meditrack.backend.model.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    long countByPatientEmailAndAppointmentDate(String email, LocalDate appointmentDate);

    long countByDoctorEmailAndAppointmentDate(String email, LocalDate appointmentDate);

    @Query("SELECT a.slot FROM Appointment a WHERE a.doctorEmail = :email AND a.appointmentDate = :date AND a.status <> 'REJECTED'")
    List<String> findSlotsByDoctorAndDate(@Param("email") String email, @Param("date") LocalDate date);

    List<Appointment> findByPatientEmailOrderByAppointmentDateDesc(String email);

    List<Appointment> findByDoctorEmailOrderByAppointmentDateDesc(String email);
    
    Optional<Appointment> findById(Long id);
    
    List<Appointment> findByStatus(String status);
    
    List<Appointment> findByAppointmentDateBefore(LocalDate cutoffDate);
    
    List<Appointment> findByDoctorEmail(String doctorEmail);

    
    List<Appointment> findByDoctorEmailAndStatusOrderByAppointmentDateDesc(String doctorEmail, String status);
    
    @Query("SELECT a FROM Appointment a WHERE a.status = 'ACCEPTED' AND a.appointmentDate <= :today")
    List<Appointment> findAcceptedAppointments(@Param("today") LocalDate today);
    
    @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
    List<Object[]> countAppointmentsByStatus();

    @Query("SELECT DATE(a.appointmentDate), COUNT(a) FROM Appointment a GROUP BY DATE(a.appointmentDate)")
    List<Object[]> countAppointmentsPerDay();
    
    @Query("SELECT a.patientEmail, COUNT(a) FROM Appointment a GROUP BY a.patientEmail")
    List<Object[]> countAppointmentsByPatient();
    
    @Query("SELECT a.doctorEmail, a.status, COUNT(a) FROM Appointment a GROUP BY a.doctorEmail, a.status")
    List<Object[]> countAppointmentsByDoctorStatus();
    
    List<Appointment> findByDoctorEmailOrPatientEmail(String doctorEmail, String patientEmail);
    
    void deleteByDoctorEmailOrPatientEmail(String doctorEmail, String patientEmail);
    

}
