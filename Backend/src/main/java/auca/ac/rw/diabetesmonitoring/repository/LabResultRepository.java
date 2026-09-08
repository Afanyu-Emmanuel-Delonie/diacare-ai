package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findByPatientId(Long patientId);
    List<LabResult> findByPatientIdIn(Collection<Long> patientIds);
}
