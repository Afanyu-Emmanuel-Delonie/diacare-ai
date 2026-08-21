package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.MedicalRecordRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicalRecordRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository, PatientRepository patientRepository,
                                 DoctorRepository doctorRepository, UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    public List<MedicalRecord> getAll() {
        return medicalRecordRepository.findAll();
    }

    public MedicalRecord getById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
    }

    public List<MedicalRecord> getByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    public List<MedicalRecord> getByPatientEmail(String email) {
        return medicalRecordRepository.findByPatient_Email(email.trim().toLowerCase());
    }

    public MedicalRecord create(MedicalRecordRequestDto request, String principalName) {
        Patient patient = resolvePatient(request);
        MedicalRecord record = new MedicalRecord();
        record.setDiagnosis(request.getDiagnosis());
        record.setNotes(request.getNotes());
        record.setPatient(patient);
        record.setDoctor(resolveDoctor(principalName));
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord update(Long id, MedicalRecordRequestDto request) {
        MedicalRecord existing = getById(id);
        existing.setDiagnosis(request.getDiagnosis());
        existing.setNotes(request.getNotes());
        if (request.getPatientId() != null || (request.getPatientEmail() != null && !request.getPatientEmail().isBlank())) {
            existing.setPatient(resolvePatient(request));
        }
        return medicalRecordRepository.save(existing);
    }

    public void delete(Long id) {
        MedicalRecord existing = getById(id);
        medicalRecordRepository.delete(existing);
    }

    private Patient resolvePatient(MedicalRecordRequestDto request) {
        if (request.getPatientId() != null) {
            return patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));
        }
        if (request.getPatientEmail() != null && !request.getPatientEmail().isBlank()) {
            String email = request.getPatientEmail().trim().toLowerCase();
            return patientRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with email: " + email));
        }
        throw new IllegalArgumentException("Either patientId or patientEmail is required");
    }

    private Doctor resolveDoctor(String principalName) {
        User user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principalName));
        return doctorRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No doctor profile is linked to this account."));
    }
}
