package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientId(Long patientId);
    List<MedicalRecord> findByPatient_Email(String email);
    List<MedicalRecord> findByDoctorId(Long doctorId);
    List<MedicalRecord> findByPatientIdIn(Collection<Long> patientIds);
}
