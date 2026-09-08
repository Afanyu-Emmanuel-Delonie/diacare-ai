package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResponseDto;
import auca.ac.rw.diabetesmonitoring.model.RiskPrediction;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import auca.ac.rw.diabetesmonitoring.service.RiskPredictionPersistenceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risk-predictions")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class RiskPredictionController {

    private final RiskPredictionPersistenceService riskPredictionPersistenceService;
    private final PatientAccessService patientAccessService;

    public RiskPredictionController(RiskPredictionPersistenceService riskPredictionPersistenceService,
                                     PatientAccessService patientAccessService) {
        this.riskPredictionPersistenceService = riskPredictionPersistenceService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<RiskPredictionResponseDto>> getAll(Authentication authentication) {
        List<RiskPrediction> predictions = riskPredictionPersistenceService.getAll().stream()
                .filter(p -> canAccess(p, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(toDtoList(predictions));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RiskPredictionResponseDto>> getByPatientId(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toDtoList(riskPredictionPersistenceService.getByPatientId(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskPredictionResponseDto> getById(@PathVariable Long id, Authentication authentication) {
        RiskPrediction prediction = riskPredictionPersistenceService.getById(id);
        if (!canAccess(prediction, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(RiskPredictionResponseDto.from(prediction));
    }

    @PostMapping
    public ResponseEntity<RiskPredictionResponseDto> create(@Valid @RequestBody RiskPredictionRequestDto request,
                                                              Authentication authentication) {
        if (request.getPatientId() != null && !patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        RiskPrediction created = riskPredictionPersistenceService.create(request);
        return new ResponseEntity<>(RiskPredictionResponseDto.from(created), HttpStatus.CREATED);
    }

    private boolean canAccess(RiskPrediction prediction, Authentication authentication) {
        return prediction.getPatient() != null && patientAccessService.canAccessPatient(authentication, prediction.getPatient());
    }

    private List<RiskPredictionResponseDto> toDtoList(List<RiskPrediction> predictions) {
        return predictions.stream().map(RiskPredictionResponseDto::from).collect(Collectors.toList());
    }
}
