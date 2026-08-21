package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResponseDto;
import auca.ac.rw.diabetesmonitoring.model.RiskPrediction;
import auca.ac.rw.diabetesmonitoring.service.RiskPredictionPersistenceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risk-predictions")
@CrossOrigin(origins = "*")
public class RiskPredictionController {

    private final RiskPredictionPersistenceService riskPredictionPersistenceService;

    public RiskPredictionController(RiskPredictionPersistenceService riskPredictionPersistenceService) {
        this.riskPredictionPersistenceService = riskPredictionPersistenceService;
    }

    @GetMapping
    public ResponseEntity<List<RiskPredictionResponseDto>> getAll() {
        return ResponseEntity.ok(toDtoList(riskPredictionPersistenceService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RiskPredictionResponseDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(toDtoList(riskPredictionPersistenceService.getByPatientId(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskPredictionResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(RiskPredictionResponseDto.from(riskPredictionPersistenceService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<RiskPredictionResponseDto> create(@Valid @RequestBody RiskPredictionRequestDto request) {
        RiskPrediction created = riskPredictionPersistenceService.create(request);
        return new ResponseEntity<>(RiskPredictionResponseDto.from(created), HttpStatus.CREATED);
    }

    private List<RiskPredictionResponseDto> toDtoList(List<RiskPrediction> predictions) {
        return predictions.stream().map(RiskPredictionResponseDto::from).collect(Collectors.toList());
    }
}
