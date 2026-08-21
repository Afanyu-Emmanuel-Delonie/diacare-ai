package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> {
    List<RiskPrediction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<RiskPrediction> findAllByOrderByCreatedAtDesc();
}
