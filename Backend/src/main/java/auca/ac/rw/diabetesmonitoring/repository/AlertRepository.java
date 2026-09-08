package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPatientId(Long patientId);
    List<Alert> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Alert> findByPatientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long patientId, LocalDateTime start, LocalDateTime end);
    List<Alert> findByPatientIdIn(Collection<Long> patientIds);
}
