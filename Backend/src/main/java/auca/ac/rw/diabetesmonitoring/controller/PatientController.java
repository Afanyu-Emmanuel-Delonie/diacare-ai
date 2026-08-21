package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.PatientRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.PatientResponseDto;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, UserRepository userRepository) {
        this.patientService = patientService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(Authentication authentication) {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(
            filterForCurrentUser(patients, authentication).stream()
                .map(PatientResponseDto::from)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> getPatientById(@PathVariable Long id, Authentication authentication) {
        Patient patient = patientService.getPatientById(id);
        if (!canAccess(patient, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(PatientResponseDto.from(patient));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponseDto createPatient(@Valid @RequestBody PatientRequestDto request) {
        return PatientResponseDto.from(patientService.createPatient(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(@PathVariable Long id,
                                                            @Valid @RequestBody PatientRequestDto request,
                                                            Authentication authentication) {
        Patient existing = patientService.getPatientById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(PatientResponseDto.from(patientService.updatePatient(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id, Authentication authentication) {
        Patient existing = patientService.getPatientById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccess(Patient patient, Authentication authentication) {
        if (authentication == null) return false;
        if (hasRole(authentication, "ROLE_ADMIN")) return true;

        User currentUser = resolveUser(authentication);
        if (currentUser == null) return false;

        String role = currentUser.getRole().toUpperCase();
        if ("PATIENT".equals(role)) {
            return patient.getEmail().equals(currentUser.getEmail()) || patient.getEmail().equals(currentUser.getUsername());
        }
        if ("DOCTOR".equals(role)) {
            return patient.getDoctor() != null && patient.getDoctor().getEmail().equals(currentUser.getEmail());
        }
        if ("NURSE".equals(role) || "CAREGIVER".equals(role)) {
            return true;
        }
        return false;
    }

    private List<Patient> filterForCurrentUser(List<Patient> patients, Authentication authentication) {
        if (authentication == null) return List.of();
        if (hasRole(authentication, "ROLE_ADMIN")) return patients;
        return patients.stream().filter(p -> canAccess(p, authentication)).collect(Collectors.toList());
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }

    private User resolveUser(Authentication authentication) {
        String name = authentication.getName();
        return userRepository.findByUsername(name).or(() -> userRepository.findByEmail(name)).orElse(null);
    }
}
