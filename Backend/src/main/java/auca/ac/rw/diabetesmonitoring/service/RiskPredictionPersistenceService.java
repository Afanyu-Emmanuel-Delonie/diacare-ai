package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.RiskPrediction;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import auca.ac.rw.diabetesmonitoring.repository.RiskPredictionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RiskPredictionPersistenceService {

    private final RiskPredictionRepository riskPredictionRepository;
    private final PatientRepository patientRepository;
    private final RiskPredictionService riskPredictionService;

    public RiskPredictionPersistenceService(RiskPredictionRepository riskPredictionRepository, PatientRepository patientRepository,
                                             RiskPredictionService riskPredictionService) {
        this.riskPredictionRepository = riskPredictionRepository;
        this.patientRepository = patientRepository;
        this.riskPredictionService = riskPredictionService;
    }

    public RiskPrediction create(RiskPredictionRequestDto request) {
        LocalDateTime measuredAt = request.getMeasuredAt() != null ? request.getMeasuredAt() : LocalDateTime.now();
        List<Double> recentReadings = request.getRecentReadings() != null ? request.getRecentReadings() : List.of();

        RiskPredictionResult result = riskPredictionService.analyzeRisk(
                request.getCurrentReading(), measuredAt, recentReadings, request.isMedicationAdherenceMissed(), request.getHba1cResult());

        RiskPrediction prediction = new RiskPrediction();
        prediction.setReading(request.getCurrentReading());
        prediction.setMeasuredAt(measuredAt);
        prediction.setRiskCategory(result.getRiskCategory());
        prediction.setTriggeredSignals(String.join("|", result.getTriggeredSignals()));
        prediction.setAlertMessage(result.getAlertMessage());

        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));
            prediction.setPatient(patient);
        }

        return riskPredictionRepository.save(prediction);
    }

    public List<RiskPrediction> getAll() {
        return riskPredictionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<RiskPrediction> getByPatientId(Long patientId) {
        return riskPredictionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public RiskPrediction getById(Long id) {
        return riskPredictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk prediction not found with id: " + id));
    }
}
