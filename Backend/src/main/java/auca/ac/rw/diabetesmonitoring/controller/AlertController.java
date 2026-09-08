package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.AlertRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.AlertResponseDto;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionRequest;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.service.AlertService;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import auca.ac.rw.diabetesmonitoring.service.RiskPredictionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class AlertController {

    private final AlertService alertService;
    private final RiskPredictionService riskPredictionService;
    private final PatientAccessService patientAccessService;

    public AlertController(AlertService alertService, RiskPredictionService riskPredictionService,
                            PatientAccessService patientAccessService) {
        this.alertService = alertService;
        this.riskPredictionService = riskPredictionService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponseDto>> getAllAlerts(Authentication authentication) {
        List<Alert> alerts = alertService.getAll().stream()
                .filter(a -> canAccess(a, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(toDtoList(alerts));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AlertResponseDto>> getByPatientId(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toDtoList(alertService.getByPatientId(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponseDto> getAlertById(@PathVariable Long id, Authentication authentication) {
        Alert alert = alertService.getById(id);
        if (!canAccess(alert, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AlertResponseDto.from(alert));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AlertResponseDto> createAlert(@Valid @RequestBody AlertRequestDto request, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(AlertResponseDto.from(alertService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AlertResponseDto> updateAlert(@PathVariable Long id, @Valid @RequestBody AlertRequestDto request,
                                                         Authentication authentication) {
        Alert existing = alertService.getById(id);
        if (!canAccess(existing, authentication) || !patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AlertResponseDto.from(alertService.update(id, request)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<AlertResponseDto> markRead(@PathVariable Long id, Authentication authentication) {
        Alert existing = alertService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AlertResponseDto.from(alertService.markRead(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id, Authentication authentication) {
        Alert existing = alertService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        alertService.delete(id);
        return ResponseEntity.noContent().build();
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

    private boolean canAccess(Alert alert, Authentication authentication) {
        return alert.getPatient() != null && patientAccessService.canAccessPatient(authentication, alert.getPatient());
    }

    private List<AlertResponseDto> toDtoList(List<Alert> alerts) {
        return alerts.stream().map(AlertResponseDto::from).collect(Collectors.toList());
    }
}
