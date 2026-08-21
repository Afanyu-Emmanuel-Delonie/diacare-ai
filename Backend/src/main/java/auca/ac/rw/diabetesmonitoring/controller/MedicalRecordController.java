package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.MedicalRecordRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.MedicalRecordResponseDto;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.service.MedicalRecordService;
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
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponseDto>> getAllMedicalRecords() {
        return ResponseEntity.ok(toDtoList(medicalRecordService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordResponseDto> getMedicalRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(MedicalRecordResponseDto.from(medicalRecordService.getById(id)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(toDtoList(medicalRecordService.getByPatientId(patientId)));
    }

    @GetMapping("/patient/email/{email}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getByPatientEmail(@PathVariable String email) {
        return ResponseEntity.ok(toDtoList(medicalRecordService.getByPatientEmail(email)));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(@Valid @RequestBody MedicalRecordRequestDto request,
                                                                        Authentication authentication) {
        MedicalRecord created = medicalRecordService.create(request, authentication.getName());
        return new ResponseEntity<>(MedicalRecordResponseDto.from(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordResponseDto> updateMedicalRecord(@PathVariable Long id,
                                                                        @Valid @RequestBody MedicalRecordRequestDto request) {
        return ResponseEntity.ok(MedicalRecordResponseDto.from(medicalRecordService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<MedicalRecordResponseDto> toDtoList(List<MedicalRecord> records) {
        return records.stream().map(MedicalRecordResponseDto::from).collect(Collectors.toList());
    }
}
