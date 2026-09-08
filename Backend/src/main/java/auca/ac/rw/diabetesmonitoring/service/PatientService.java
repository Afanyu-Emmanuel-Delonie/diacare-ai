package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.PatientRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Caregiver;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.Nurse;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.CaregiverRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.NurseRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final CaregiverRepository caregiverRepository;
    private final AuditLogService auditLogService;

    public PatientService(PatientRepository patientRepository, DoctorRepository doctorRepository,
                           NurseRepository nurseRepository, CaregiverRepository caregiverRepository,
                           AuditLogService auditLogService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.nurseRepository = nurseRepository;
        this.caregiverRepository = caregiverRepository;
        this.auditLogService = auditLogService;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient createPatient(PatientRequestDto request) {
        Patient patient = new Patient();
        applyRequest(patient, request);
        return create(patient);
    }

    public Patient getPatientById(Long id) {
        return getById(id);
    }

    public Patient updatePatient(Long id, PatientRequestDto request) {
        Patient existing = getById(id);
        applyRequest(existing, request);
        validate(existing);
        Patient saved = patientRepository.save(existing);
        auditLogService.log("PATIENT_RECORD_UPDATED", "SUCCESS", saved.getEmail(), "PATIENT", "Patient profile updated: " + saved.getPatientCode());
        return saved;
    }

    private void applyRequest(Patient patient, PatientRequestDto request) {
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setDiabetesType(request.getDiabetesType());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setDiagnosisDate(request.getDiagnosisDate());
        if (request.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));
            patient.setDoctor(doctor);
        }
        if (request.getNurseId() != null) {
            Nurse nurse = nurseRepository.findById(request.getNurseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nurse not found with id: " + request.getNurseId()));
            patient.setNurse(nurse);
        }
        if (request.getCaregiverId() != null) {
            Caregiver caregiver = caregiverRepository.findById(request.getCaregiverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Caregiver not found with id: " + request.getCaregiverId()));
            patient.setCaregiver(caregiver);
        }
    }

    public Patient create(Patient patient) {
        validate(patient);
        Patient saved = patientRepository.save(patient);
        saved.setPatientCode(formatPatientCode(saved.getId()));
        Patient finalized = patientRepository.save(saved);
        auditLogService.log("PATIENT_RECORD_CREATED", "SUCCESS", finalized.getEmail(), "PATIENT", "Patient profile created: " + finalized.getPatientCode());
        return finalized;
    }

    private String formatPatientCode(Long id) {
        return String.format("Dia%03d", id);
    }

    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public Patient update(Long id, Patient updatedPatient) {
        Patient existing = getById(id);
        validate(updatedPatient);
        existing.setFullName(updatedPatient.getFullName());
        existing.setEmail(updatedPatient.getEmail());
        existing.setPhone(updatedPatient.getPhone());
        existing.setDateOfBirth(updatedPatient.getDateOfBirth());
        Patient saved = patientRepository.save(existing);
        auditLogService.log("PATIENT_RECORD_UPDATED", "SUCCESS", saved.getEmail(), "PATIENT", "Patient profile updated: " + saved.getPatientCode());
        return saved;
    }

    public void delete(Long id) {
        Patient existing = getById(id);
        patientRepository.delete(existing);
        auditLogService.log("PATIENT_RECORD_DELETED", "SUCCESS", existing.getEmail(), "PATIENT", "Patient profile deleted: " + existing.getPatientCode());
    }

    private void validate(Patient patient) {
        if (patient.getFullName() == null || patient.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (patient.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
    }
}
