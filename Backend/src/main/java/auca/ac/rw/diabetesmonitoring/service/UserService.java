package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.UserRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Caregiver;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.Nurse;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.CaregiverRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.NurseRepository;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "DOCTOR", "NURSE", "PATIENT", "CAREGIVER");

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final CaregiverRepository caregiverRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, DoctorRepository doctorRepository,
                        NurseRepository nurseRepository, CaregiverRepository caregiverRepository,
                        PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.nurseRepository = nurseRepository;
        this.caregiverRepository = caregiverRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public User create(UserRequestDto request) {
        User user = toUser(request);
        validate(user);
        ensureUniqueUsernameAndEmail(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(user.getRole().toUpperCase());
        User saved = userRepository.save(user);
        createLinkedProfile(saved);
        auditLogService.log("USER_CREATED", "SUCCESS", saved.getEmail(), saved.getRole(), "Account created with role " + saved.getRole());
        return saved;
    }

    /**
     * Staff roles (DOCTOR/NURSE/CAREGIVER) need a matching domain profile so they can be
     * assigned to patients and counted correctly in reports. Skips creation if a profile
     * with this email already exists (e.g. re-linking an existing account).
     */
    private void createLinkedProfile(User user) {
        String displayName = deriveDisplayName(user.getUsername());
        switch (user.getRole()) {
            case "DOCTOR" -> {
                if (doctorRepository.findByEmail(user.getEmail()).isEmpty()) {
                    Doctor doctor = new Doctor();
                    doctor.setFullName(displayName);
                    doctor.setEmail(user.getEmail());
                    doctor.setSpecialty("General Practice");
                    doctorRepository.save(doctor);
                }
            }
            case "NURSE" -> {
                if (nurseRepository.findByEmail(user.getEmail()).isEmpty()) {
                    Nurse nurse = new Nurse();
                    nurse.setFullName(displayName);
                    nurse.setEmail(user.getEmail());
                    nurse.setDepartment("General");
                    nurseRepository.save(nurse);
                }
            }
            case "CAREGIVER" -> {
                if (caregiverRepository.findByEmail(user.getEmail()).isEmpty()) {
                    Caregiver caregiver = new Caregiver();
                    caregiver.setFullName(displayName);
                    caregiver.setEmail(user.getEmail());
                    caregiver.setRelationship("Family");
                    caregiverRepository.save(caregiver);
                }
            }
            default -> { /* no linked profile for ADMIN / PATIENT */ }
        }
    }

    private String deriveDisplayName(String username) {
        String[] parts = username.split("[._\\-\\s]+");
        StringBuilder name = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) continue;
            if (!name.isEmpty()) name.append(' ');
            name.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
        }
        return name.isEmpty() ? username : name.toString();
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User update(Long id, UserRequestDto request) {
        User existing = getById(id);
        User updatedUser = toUser(request);
        validate(updatedUser);
        String previousRole = existing.getRole();
        existing.setUsername(updatedUser.getUsername());
        existing.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        existing.setRole(updatedUser.getRole().toUpperCase());
        User saved = userRepository.save(existing);
        if (!saved.getRole().equals(previousRole)) {
            auditLogService.log("USER_ROLE_CHANGED", "SUCCESS", saved.getEmail(), saved.getRole(),
                    "Role changed from " + previousRole + " to " + saved.getRole());
        } else {
            auditLogService.log("ADMIN_ACTION", "SUCCESS", saved.getEmail(), saved.getRole(), "Account details updated");
        }
        return saved;
    }

    public void delete(Long id) {
        // Soft-archive rather than a hard delete, so account history is preserved.
        User existing = getById(id);
        existing.setDeleted(true);
        existing.setActive(false);
        userRepository.save(existing);
        auditLogService.log("USER_DELETED", "SUCCESS", existing.getEmail(), existing.getRole(), "Account archived");
    }

    public User activate(Long id) {
        User existing = getById(id);
        existing.setActive(true);
        existing.setDeleted(false);
        User saved = userRepository.save(existing);
        auditLogService.log("USER_ACTIVATED", "SUCCESS", saved.getEmail(), saved.getRole(), "Account activated");
        return saved;
    }

    public User deactivate(Long id) {
        User existing = getById(id);
        existing.setActive(false);
        User saved = userRepository.save(existing);
        auditLogService.log("USER_DEACTIVATED", "SUCCESS", saved.getEmail(), saved.getRole(), "Account deactivated");
        return saved;
    }

    private User toUser(UserRequestDto request) {
        User user = new User();
        user.setUsername(request.getUsername() == null ? null : request.getUsername().trim());
        user.setEmail(request.getEmail() == null ? null : request.getEmail().trim().toLowerCase());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() == null ? null : request.getRole().trim());
        return user;
    }

    private void validate(User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().isBlank() || user.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        String normalizedRole = user.getRole().toUpperCase();
        if (!ALLOWED_ROLES.contains(normalizedRole)) {
            throw new IllegalArgumentException("Role must be one of: ADMIN, DOCTOR, NURSE, PATIENT, CAREGIVER");
        }
        user.setRole(normalizedRole);
    }

    private void ensureUniqueUsernameAndEmail(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
    }
}
