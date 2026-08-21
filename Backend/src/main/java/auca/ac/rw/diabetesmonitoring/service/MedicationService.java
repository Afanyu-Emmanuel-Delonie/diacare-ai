package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.MedicationRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;

    public MedicationService(MedicationRepository medicationRepository, PatientRepository patientRepository) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
    }

    public Medication create(MedicationRequestDto request) {
        Medication medication = new Medication();
        applyRequest(medication, request);
        validate(medication);
        return medicationRepository.save(medication);
    }

    public List<Medication> getAll() {
        return medicationRepository.findAll();
    }

    public List<Medication> getByPatientId(Long patientId) {
        return medicationRepository.findByPatientIdOrderByStartDateAsc(patientId);
    }

    public Medication getById(Long id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));
    }

    public Medication update(Long id, MedicationRequestDto request) {
        Medication existing = getById(id);
        applyRequest(existing, request);
        validate(existing);
        return medicationRepository.save(existing);
    }

    public Medication updateAdherence(Long id, String adherenceStatus) {
        Medication existing = getById(id);
        existing.setAdherenceStatus(adherenceStatus);
        existing.setLastAdherenceUpdatedAt(LocalDateTime.now());
        return medicationRepository.save(existing);
    }

    public void delete(Long id) {
        Medication existing = getById(id);
        medicationRepository.delete(existing);
    }

    private void applyRequest(Medication medication, MedicationRequestDto request) {
        medication.setMedicationName(request.getMedicationName());
        medication.setMedicationClass(request.getMedicationClass());
        medication.setPurpose(request.getPurpose());
        medication.setSuitableDiabetesType(request.getSuitableDiabetesType());
        medication.setTypicalTiming(request.getTypicalTiming());
        medication.setHowToUseGeneralInfo(request.getHowToUseGeneralInfo());
        medication.setCommonSideEffects(request.getCommonSideEffects());
        medication.setStorageInstructions(request.getStorageInstructions());
        medication.setMissedDoseGuidance(request.getMissedDoseGuidance());
        medication.setWarnings(request.getWarnings());
        medication.setDoctorPrescribedDose(request.getDoctorPrescribedDose());
        medication.setReminderSchedule(request.getReminderSchedule());
        medication.setAdherenceStatus(request.getAdherenceStatus());
        medication.setStartDate(request.getStartDate());
        medication.setEndDate(request.getEndDate());
        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));
            medication.setPatient(patient);
        }
    }

    private void validate(Medication medication) {
        if (medication.getMedicationName() == null || medication.getMedicationName().isBlank()) {
            throw new IllegalArgumentException("Medication name is required");
        }
        if (medication.getDoctorPrescribedDose() == null || medication.getDoctorPrescribedDose().isBlank()) {
            throw new IllegalArgumentException("Doctor prescribed dose is required");
        }
        if (medication.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (medication.getPatient() == null) {
            throw new IllegalArgumentException("Patient is required");
        }
    }
}
