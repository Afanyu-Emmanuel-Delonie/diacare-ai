package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.PatientRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.PatientResponseDto;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import auca.ac.rw.diabetesmonitoring.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class PatientController {

    private final PatientService patientService;
    private final PatientAccessService patientAccessService;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, PatientAccessService patientAccessService,
                              UserRepository userRepository) {
        this.patientService = patientService;
        this.patientAccessService = patientAccessService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(Authentication authentication) {
        return ResponseEntity.ok(
            patientAccessService.scopedPatients(authentication).stream()
                .map(PatientResponseDto::from)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/me")
    public ResponseEntity<PatientResponseDto> getCurrentPatient(Authentication authentication) {
        User currentUser = resolveUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return patientService.findByEmail(currentUser.getEmail())
                .map(patient -> ResponseEntity.ok(PatientResponseDto.from(patient)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> getPatientById(@PathVariable Long id, Authentication authentication) {
        Patient patient = patientService.getPatientById(id);
        if (!patientAccessService.canAccessPatient(authentication, patient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(PatientResponseDto.from(patient));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public PatientResponseDto createPatient(@Valid @RequestBody PatientRequestDto request) {
        return PatientResponseDto.from(patientService.createPatient(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(@PathVariable Long id,
                                                            @Valid @RequestBody PatientRequestDto request,
                                                            Authentication authentication) {
        Patient existing = patientService.getPatientById(id);
        if (!patientAccessService.canAccessPatient(authentication, existing)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(PatientResponseDto.from(patientService.updatePatient(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id, Authentication authentication) {
        Patient existing = patientService.getPatientById(id);
        if (!patientAccessService.canAccessPatient(authentication, existing)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private User resolveUser(Authentication authentication) {
        String name = authentication.getName();
        return userRepository.findByUsername(name).or(() -> userRepository.findByEmail(name)).orElse(null);
    }
}
