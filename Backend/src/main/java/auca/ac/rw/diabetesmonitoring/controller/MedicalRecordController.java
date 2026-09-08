package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.MedicalRecordRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicalRecordResponseDto;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.service.MedicalRecordService;
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
@RequestMapping("/api/medical-records")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final PatientAccessService patientAccessService;

    public MedicalRecordController(MedicalRecordService medicalRecordService, PatientAccessService patientAccessService) {
        this.medicalRecordService = medicalRecordService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponseDto>> getAllMedicalRecords(Authentication authentication) {
        List<MedicalRecord> records = medicalRecordService.getAll().stream()
                .filter(r -> canAccess(r, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(toDtoList(records));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordResponseDto> getMedicalRecordById(@PathVariable Long id, Authentication authentication) {
        MedicalRecord record = medicalRecordService.getById(id);
        if (!canAccess(record, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(MedicalRecordResponseDto.from(record));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getByPatientId(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toDtoList(medicalRecordService.getByPatientId(patientId)));
    }

    @GetMapping("/patient/email/{email}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getByPatientEmail(@PathVariable String email, Authentication authentication) {
        List<MedicalRecord> records = medicalRecordService.getByPatientEmail(email).stream()
                .filter(r -> canAccess(r, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(toDtoList(records));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(@Valid @RequestBody MedicalRecordRequestDto request,
                                                                        Authentication authentication) {
        // A doctor "pulling" a chart to write a record is itself the access-granting action —
        // see PatientAccessService#doctorAccessiblePatientIds, which folds authored records
        // back into that doctor's accessible-patient set for every other read in the system.
        MedicalRecord created = medicalRecordService.create(request, authentication.getName());
        return new ResponseEntity<>(MedicalRecordResponseDto.from(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<MedicalRecordResponseDto> updateMedicalRecord(@PathVariable Long id,
                                                                        @Valid @RequestBody MedicalRecordRequestDto request,
                                                                        Authentication authentication) {
        MedicalRecord existing = medicalRecordService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(MedicalRecordResponseDto.from(medicalRecordService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id, Authentication authentication) {
        MedicalRecord existing = medicalRecordService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        medicalRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccess(MedicalRecord record, Authentication authentication) {
        return record.getPatient() != null && patientAccessService.canAccessPatient(authentication, record.getPatient());
    }

    private List<MedicalRecordResponseDto> toDtoList(List<MedicalRecord> records) {
        return records.stream().map(MedicalRecordResponseDto::from).collect(Collectors.toList());
    }
}
