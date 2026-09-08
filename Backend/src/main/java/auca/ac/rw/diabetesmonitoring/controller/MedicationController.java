package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.MedicationAdherenceRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicationRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicationResponseDto;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.service.MedicationService;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medications")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class MedicationController {

    private final MedicationService medicationService;
    private final PatientAccessService patientAccessService;

    public MedicationController(MedicationService medicationService, PatientAccessService patientAccessService) {
        this.medicationService = medicationService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<MedicationResponseDto>> getAllMedications(Authentication authentication) {
        List<Medication> medications = medicationService.getAll().stream()
                .filter(m -> canAccess(m, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(toDtoList(medications));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationResponseDto>> getByPatientId(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toDtoList(medicationService.getByPatientId(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationResponseDto> getMedicationById(@PathVariable Long id, Authentication authentication) {
        Medication medication = medicationService.getById(id);
        if (!canAccess(medication, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(MedicationResponseDto.from(medication));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<MedicationResponseDto> createMedication(@Valid @RequestBody MedicationRequestDto request,
                                                                    Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(MedicationResponseDto.from(medicationService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<MedicationResponseDto> updateMedication(@PathVariable Long id, @Valid @RequestBody MedicationRequestDto request,
                                                                    Authentication authentication) {
        Medication existing = medicationService.getById(id);
        if (!canAccess(existing, authentication) || !patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(MedicationResponseDto.from(medicationService.update(id, request)));
    }

    @PatchMapping("/{id}/adherence")
    public ResponseEntity<MedicationResponseDto> updateAdherence(@PathVariable Long id, @Valid @RequestBody MedicationAdherenceRequestDto request,
                                                                   Authentication authentication) {
        Medication existing = medicationService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(MedicationResponseDto.from(medicationService.updateAdherence(id, request.getAdherenceStatus())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id, Authentication authentication) {
        Medication existing = medicationService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        medicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccess(Medication medication, Authentication authentication) {
        return medication.getPatient() != null && patientAccessService.canAccessPatient(authentication, medication.getPatient());
    }

    private List<MedicationResponseDto> toDtoList(List<Medication> medications) {
        return medications.stream().map(MedicationResponseDto::from).collect(Collectors.toList());
    }
}
