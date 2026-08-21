package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.MedicationAdherenceRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicationRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicationResponseDto;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.service.MedicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "*")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @GetMapping
    public ResponseEntity<List<MedicationResponseDto>> getAllMedications() {
        return ResponseEntity.ok(toDtoList(medicationService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationResponseDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(toDtoList(medicationService.getByPatientId(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationResponseDto> getMedicationById(@PathVariable Long id) {
        return ResponseEntity.ok(MedicationResponseDto.from(medicationService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<MedicationResponseDto> createMedication(@Valid @RequestBody MedicationRequestDto request) {
        return new ResponseEntity<>(MedicationResponseDto.from(medicationService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationResponseDto> updateMedication(@PathVariable Long id, @Valid @RequestBody MedicationRequestDto request) {
        return ResponseEntity.ok(MedicationResponseDto.from(medicationService.update(id, request)));
    }

    @PatchMapping("/{id}/adherence")
    public ResponseEntity<MedicationResponseDto> updateAdherence(@PathVariable Long id, @Valid @RequestBody MedicationAdherenceRequestDto request) {
        return ResponseEntity.ok(MedicationResponseDto.from(medicationService.updateAdherence(id, request.getAdherenceStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        medicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<MedicationResponseDto> toDtoList(List<Medication> medications) {
        return medications.stream().map(MedicationResponseDto::from).collect(Collectors.toList());
    }
}
