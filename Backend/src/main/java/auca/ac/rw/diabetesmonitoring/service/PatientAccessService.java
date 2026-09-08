package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.model.Caregiver;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.Nurse;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.CaregiverRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicalRecordRepository;
import auca.ac.rw.diabetesmonitoring.repository.NurseRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Single source of truth for "who can see which patient's data".
 *
 * Rules:
 *  - ADMIN: every patient.
 *  - DOCTOR: patients they are assigned as primary doctor for, plus any patient they have
 *            created a medical record for (a doctor who "pulled" a chart keeps access to it).
 *  - NURSE: only patients assigned to them.
 *  - CAREGIVER: only patients assigned to them.
 *  - PATIENT: only their own record.
 *
 * Staff accounts with no linked domain profile (or no assignments yet) see nothing — they are
 * NOT granted access to the whole roster. This intentionally replaces the previous behaviour
 * where nurses/caregivers without assignments (or with an empty assignment list) fell back to
 * seeing every patient in the system.
 */
@Service
public class PatientAccessService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final CaregiverRepository caregiverRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public PatientAccessService(UserRepository userRepository, PatientRepository patientRepository,
                                 DoctorRepository doctorRepository, NurseRepository nurseRepository,
                                 CaregiverRepository caregiverRepository,
                                 MedicalRecordRepository medicalRecordRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.nurseRepository = nurseRepository;
        this.caregiverRepository = caregiverRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    public User resolveUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        String name = authentication.getName();
        return userRepository.findByUsername(name).or(() -> userRepository.findByEmail(name)).orElse(null);
    }

    public boolean isAdmin(Authentication authentication) {
        return hasAuthority(authentication, "ROLE_ADMIN");
    }

    /**
     * Patient ids the current principal is allowed to see. Empty (never null) for a principal
     * with no access. Callers should short-circuit on {@link #isAdmin} first since admins are
     * not bound by this set.
     */
    public Set<Long> accessiblePatientIds(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null || user.getRole() == null) {
            return Set.of();
        }
        String role = user.getRole().toUpperCase();
        return switch (role) {
            case "PATIENT" -> patientRepository.findByEmail(user.getEmail())
                    .map(Patient::getId)
                    .map(Set::of)
                    .orElseGet(Set::of);
            case "DOCTOR" -> doctorRepository.findByEmail(user.getEmail())
                    .map(this::doctorAccessiblePatientIds)
                    .orElseGet(Set::of);
            case "NURSE" -> nurseRepository.findByEmail(user.getEmail())
                    .map(nurse -> toIds(patientRepository.findByNurseId(nurse.getId())))
                    .orElseGet(Set::of);
            case "CAREGIVER" -> caregiverRepository.findByEmail(user.getEmail())
                    .map(caregiver -> toIds(patientRepository.findByCaregiverId(caregiver.getId())))
                    .orElseGet(Set::of);
            default -> Set.of();
        };
    }

    private Set<Long> doctorAccessiblePatientIds(Doctor doctor) {
        Set<Long> ids = new HashSet<>(toIds(patientRepository.findByDoctorId(doctor.getId())));
        medicalRecordRepository.findByDoctorId(doctor.getId()).forEach(record -> {
            if (record.getPatient() != null) {
                ids.add(record.getPatient().getId());
            }
        });
        return ids;
    }

    public boolean canAccessPatientId(Authentication authentication, Long patientId) {
        if (patientId == null || authentication == null) {
            return false;
        }
        if (isAdmin(authentication)) {
            return true;
        }
        return accessiblePatientIds(authentication).contains(patientId);
    }

    public boolean canAccessPatient(Authentication authentication, Patient patient) {
        return patient != null && canAccessPatientId(authentication, patient.getId());
    }

    /** Full, access-scoped patient list (admins get everyone; everyone else gets only their own). */
    public List<Patient> scopedPatients(Authentication authentication) {
        if (isAdmin(authentication)) {
            return patientRepository.findAll();
        }
        Set<Long> ids = accessiblePatientIds(authentication);
        if (ids.isEmpty()) {
            return List.of();
        }
        return patientRepository.findAllById(ids);
    }

    private Set<Long> toIds(List<Patient> patients) {
        return patients.stream().map(Patient::getId).collect(Collectors.toSet());
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority::equals);
    }
}
