package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.LifestyleActivity;
import auca.ac.rw.diabetesmonitoring.repository.LifestyleActivityRepository;
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
@RequestMapping("/api/lifestyle-activities")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class LifestyleActivityController {

    private final LifestyleActivityRepository lifestyleActivityRepository;
    private final PatientAccessService patientAccessService;

    public LifestyleActivityController(LifestyleActivityRepository lifestyleActivityRepository,
                                        PatientAccessService patientAccessService) {
        this.lifestyleActivityRepository = lifestyleActivityRepository;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<LifestyleActivity>> getAllLifestyleActivities(Authentication authentication) {
        if (patientAccessService.isAdmin(authentication)) {
            return ResponseEntity.ok(lifestyleActivityRepository.findAll());
        }
        var patientIds = patientAccessService.accessiblePatientIds(authentication);
        if (patientIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(lifestyleActivityRepository.findByPatientIdIn(patientIds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LifestyleActivity> getLifestyleActivityById(@PathVariable Long id, Authentication authentication) {
        return lifestyleActivityRepository.findById(id)
                .map(activity -> canAccess(activity, authentication)
                        ? ResponseEntity.ok(activity)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<LifestyleActivity>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LifestyleActivity> createLifestyleActivity(@Valid @RequestBody LifestyleActivity activity,
                                                                       Authentication authentication) {
        if (activity.getPatient() == null || activity.getPatient().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!patientAccessService.canAccessPatientId(authentication, activity.getPatient().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(lifestyleActivityRepository.save(activity), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LifestyleActivity> updateLifestyleActivity(@PathVariable Long id, @Valid @RequestBody LifestyleActivity updatedActivity,
                                                                       Authentication authentication) {
        return lifestyleActivityRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication) || !canAccessTarget(updatedActivity, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<LifestyleActivity>build();
                    }
                    BeanUtils.copyProperties(updatedActivity, existing, "id");
                    return ResponseEntity.ok(lifestyleActivityRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLifestyleActivity(@PathVariable Long id, Authentication authentication) {
        return lifestyleActivityRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    lifestyleActivityRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean canAccess(LifestyleActivity activity, Authentication authentication) {
        return activity.getPatient() != null && patientAccessService.canAccessPatient(authentication, activity.getPatient());
    }

    private boolean canAccessTarget(LifestyleActivity activity, Authentication authentication) {
        return activity.getPatient() == null || activity.getPatient().getId() == null
                || patientAccessService.canAccessPatientId(authentication, activity.getPatient().getId());
    }
}
