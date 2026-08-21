package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;

    public MedicationService(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    public Medication create(Medication medication) {
        validate(medication);
        return medicationRepository.save(medication);
    }

    public List<Medication> getAll() {
        return medicationRepository.findAll();
    }

    public Medication getById(Long id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));
    }

    public Medication update(Long id, Medication updatedMedication) {
        Medication existing = getById(id);
        validate(updatedMedication);
        existing.setMedicationName(updatedMedication.getMedicationName());
        existing.setMedicationClass(updatedMedication.getMedicationClass());
        existing.setPurpose(updatedMedication.getPurpose());
        existing.setSuitableDiabetesType(updatedMedication.getSuitableDiabetesType());
        existing.setTypicalTiming(updatedMedication.getTypicalTiming());
        existing.setHowToUseGeneralInfo(updatedMedication.getHowToUseGeneralInfo());
        existing.setCommonSideEffects(updatedMedication.getCommonSideEffects());
        existing.setStorageInstructions(updatedMedication.getStorageInstructions());
        existing.setMissedDoseGuidance(updatedMedication.getMissedDoseGuidance());
        existing.setWarnings(updatedMedication.getWarnings());
        existing.setDoctorPrescribedDose(updatedMedication.getDoctorPrescribedDose());
        existing.setReminderSchedule(updatedMedication.getReminderSchedule());
        existing.setAdherenceStatus(updatedMedication.getAdherenceStatus());
        existing.setStartDate(updatedMedication.getStartDate());
        existing.setEndDate(updatedMedication.getEndDate());
        return medicationRepository.save(existing);
    }

    public void delete(Long id) {
        Medication existing = getById(id);
        medicationRepository.delete(existing);
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
    }
}
