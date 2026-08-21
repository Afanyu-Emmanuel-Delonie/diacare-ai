package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionRequest;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import auca.ac.rw.diabetesmonitoring.service.RiskPredictionService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertRepository alertRepository;
    private final RiskPredictionService riskPredictionService;

    public AlertController(AlertRepository alertRepository, RiskPredictionService riskPredictionService) {
        this.alertRepository = alertRepository;
        this.riskPredictionService = riskPredictionService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        return alertRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(@Valid @RequestBody Alert alert) {
        return new ResponseEntity<>(alertRepository.save(alert), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alert> updateAlert(@PathVariable Long id, @Valid @RequestBody Alert updatedAlert) {
        return alertRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedAlert, existing, "id");
                    return ResponseEntity.ok(alertRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        return alertRepository.findById(id)
                .map(existing -> {
                    alertRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/risk-prediction")
    public ResponseEntity<RiskPredictionResult> predictRisk(@Valid @RequestBody RiskPredictionRequest payload) {
        RiskPredictionResult result = riskPredictionService.analyzeRisk(
                payload.getCurrentReading(),
                payload.getMeasuredAt(),
                payload.getRecentReadings() == null ? List.of() : payload.getRecentReadings(),
                Boolean.TRUE.equals(payload.getMedicationAdherenceMissed()),
                payload.getHba1cResult()
        );
        return ResponseEntity.ok(result);
    }
}
