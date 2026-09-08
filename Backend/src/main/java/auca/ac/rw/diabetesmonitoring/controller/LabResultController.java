package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.LabResult;
import auca.ac.rw.diabetesmonitoring.repository.LabResultRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class LabResultController {

    private final LabResultRepository labResultRepository;
    private final PatientAccessService patientAccessService;

    public LabResultController(LabResultRepository labResultRepository, PatientAccessService patientAccessService) {
        this.labResultRepository = labResultRepository;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<LabResult>> getAllLabResults(Authentication authentication) {
        if (patientAccessService.isAdmin(authentication)) {
            return ResponseEntity.ok(labResultRepository.findAll());
        }
        var patientIds = patientAccessService.accessiblePatientIds(authentication);
        if (patientIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(labResultRepository.findByPatientIdIn(patientIds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResult> getLabResultById(@PathVariable Long id, Authentication authentication) {
        return labResultRepository.findById(id)
                .map(labResult -> canAccess(labResult, authentication)
                        ? ResponseEntity.ok(labResult)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<LabResult>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<LabResult> createLabResult(@Valid @RequestBody LabResult labResult, Authentication authentication) {
        if (labResult.getPatient() == null || labResult.getPatient().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!patientAccessService.canAccessPatientId(authentication, labResult.getPatient().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(labResultRepository.save(labResult), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<LabResult> updateLabResult(@PathVariable Long id, @Valid @RequestBody LabResult updatedLabResult,
                                                      Authentication authentication) {
        return labResultRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication) || !canAccessTarget(updatedLabResult, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<LabResult>build();
                    }
                    BeanUtils.copyProperties(updatedLabResult, existing, "id");
                    return ResponseEntity.ok(labResultRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteLabResult(@PathVariable Long id, Authentication authentication) {
        return labResultRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    labResultRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean canAccess(LabResult labResult, Authentication authentication) {
        return labResult.getPatient() != null && patientAccessService.canAccessPatient(authentication, labResult.getPatient());
    }

    private boolean canAccessTarget(LabResult labResult, Authentication authentication) {
        return labResult.getPatient() == null || labResult.getPatient().getId() == null
                || patientAccessService.canAccessPatientId(authentication, labResult.getPatient().getId());
    }
}
