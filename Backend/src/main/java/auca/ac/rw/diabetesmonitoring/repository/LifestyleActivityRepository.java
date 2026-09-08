package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.LifestyleActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface LifestyleActivityRepository extends JpaRepository<LifestyleActivity, Long> {
    List<LifestyleActivity> findByPatientId(Long patientId);
    List<LifestyleActivity> findByPatientIdIn(Collection<Long> patientIds);
}
