package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.PatientRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient createPatient(PatientRequestDto request) {
        Patient patient = new Patient();
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        return create(patient);
    }

    public Patient getPatientById(Long id) {
        return getById(id);
    }

    public Patient updatePatient(Long id, PatientRequestDto request) {
        Patient patient = new Patient();
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        return update(id, patient);
    }

    public Patient create(Patient patient) {
        validate(patient);
        Patient saved = patientRepository.save(patient);
        saved.setPatientCode(formatPatientCode(saved.getId()));
        return patientRepository.save(saved);
    }

    private String formatPatientCode(Long id) {
        return String.format("Dia%04d", id);
    }

    public List<Patient> getAll() {
        return patientRepository.findAll();
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
        return patientRepository.save(existing);
    }

    public void delete(Long id) {
        Patient existing = getById(id);
        patientRepository.delete(existing);
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
