package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/glucose-readings")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class GlucoseReadingController {

    private final GlucoseReadingRepository glucoseReadingRepository;
    private final PatientAccessService patientAccessService;

    public GlucoseReadingController(GlucoseReadingRepository glucoseReadingRepository,
                                     PatientAccessService patientAccessService) {
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<GlucoseReading>> getAllGlucoseReadings(Authentication authentication) {
        if (patientAccessService.isAdmin(authentication)) {
            return ResponseEntity.ok(glucoseReadingRepository.findAll());
        }
        var patientIds = patientAccessService.accessiblePatientIds(authentication);
        if (patientIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(glucoseReadingRepository.findByPatientIdIn(patientIds));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<GlucoseReading>> getGlucoseReadingsByPatient(@PathVariable Long patientId,
                                                                             Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GlucoseReading> getGlucoseReadingById(@PathVariable Long id, Authentication authentication) {
        return glucoseReadingRepository.findById(id)
                .map(reading -> canAccess(reading, authentication)
                        ? ResponseEntity.ok(reading)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<GlucoseReading>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<GlucoseReading> createGlucoseReading(@Valid @RequestBody GlucoseReading reading,
                                                                Authentication authentication) {
        if (reading.getPatient() == null || reading.getPatient().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!patientAccessService.canAccessPatientId(authentication, reading.getPatient().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(glucoseReadingRepository.save(reading), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<GlucoseReading> updateGlucoseReading(@PathVariable Long id, @Valid @RequestBody GlucoseReading updatedReading,
                                                                Authentication authentication) {
        return glucoseReadingRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication) || !canAccessTarget(updatedReading, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<GlucoseReading>build();
                    }
                    BeanUtils.copyProperties(updatedReading, existing, "id");
                    return ResponseEntity.ok(glucoseReadingRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteGlucoseReading(@PathVariable Long id, Authentication authentication) {
        return glucoseReadingRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    glucoseReadingRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean canAccess(GlucoseReading reading, Authentication authentication) {
        return reading.getPatient() != null && patientAccessService.canAccessPatient(authentication, reading.getPatient());
    }

    private boolean canAccessTarget(GlucoseReading reading, Authentication authentication) {
        return reading.getPatient() == null || reading.getPatient().getId() == null
                || patientAccessService.canAccessPatientId(authentication, reading.getPatient().getId());
    }
}
