package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface GlucoseReadingRepository extends JpaRepository<GlucoseReading, Long> {
    List<GlucoseReading> findByPatientId(Long patientId);
    List<GlucoseReading> findByPatientIdOrderByMeasuredAtAsc(Long patientId);
    List<GlucoseReading> findByPatientIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(
            Long patientId, LocalDateTime start, LocalDateTime end);
    List<GlucoseReading> findByPatientIdIn(Collection<Long> patientIds);
}
