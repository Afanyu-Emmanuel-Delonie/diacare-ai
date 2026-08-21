package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.Medication;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicationResponseDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private String medicationName;
    private String medicationClass;
    private String purpose;
    private String suitableDiabetesType;
    private String typicalTiming;
    private String howToUseGeneralInfo;
    private String commonSideEffects;
    private String storageInstructions;
    private String missedDoseGuidance;
    private String warnings;
    private String doctorPrescribedDose;
    private String reminderSchedule;
    private String adherenceStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime lastAdherenceUpdatedAt;

    public static MedicationResponseDto from(Medication m) {
        MedicationResponseDto dto = new MedicationResponseDto();
        dto.id = m.getId();
        if (m.getPatient() != null) {
            dto.patientId = m.getPatient().getId();
            dto.patientName = m.getPatient().getFullName();
        }
        dto.medicationName = m.getMedicationName();
        dto.medicationClass = m.getMedicationClass();
        dto.purpose = m.getPurpose();
        dto.suitableDiabetesType = m.getSuitableDiabetesType();
        dto.typicalTiming = m.getTypicalTiming();
        dto.howToUseGeneralInfo = m.getHowToUseGeneralInfo();
        dto.commonSideEffects = m.getCommonSideEffects();
        dto.storageInstructions = m.getStorageInstructions();
        dto.missedDoseGuidance = m.getMissedDoseGuidance();
        dto.warnings = m.getWarnings();
        dto.doctorPrescribedDose = m.getDoctorPrescribedDose();
        dto.reminderSchedule = m.getReminderSchedule();
        dto.adherenceStatus = m.getAdherenceStatus();
        dto.startDate = m.getStartDate();
        dto.endDate = m.getEndDate();
        dto.lastAdherenceUpdatedAt = m.getLastAdherenceUpdatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getMedicationName() { return medicationName; }
    public String getMedicationClass() { return medicationClass; }
    public String getPurpose() { return purpose; }
    public String getSuitableDiabetesType() { return suitableDiabetesType; }
    public String getTypicalTiming() { return typicalTiming; }
    public String getHowToUseGeneralInfo() { return howToUseGeneralInfo; }
    public String getCommonSideEffects() { return commonSideEffects; }
    public String getStorageInstructions() { return storageInstructions; }
    public String getMissedDoseGuidance() { return missedDoseGuidance; }
    public String getWarnings() { return warnings; }
    public String getDoctorPrescribedDose() { return doctorPrescribedDose; }
    public String getReminderSchedule() { return reminderSchedule; }
    public String getAdherenceStatus() { return adherenceStatus; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LocalDateTime getLastAdherenceUpdatedAt() { return lastAdherenceUpdatedAt; }
}
