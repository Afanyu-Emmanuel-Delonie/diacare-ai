package auca.ac.rw.diabetesmonitoring.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medications", indexes = @Index(name = "idx_medications_patient_id", columnList = "patient_id"))
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false)
    private String medicationName;

    @Size(max = 120)
    private String medicationClass;

    @Size(max = 300)
    private String purpose;

    @Size(max = 120)
    private String suitableDiabetesType;

    @Size(max = 200)
    private String typicalTiming;

    @Size(max = 500)
    private String howToUseGeneralInfo;

    @Size(max = 500)
    private String commonSideEffects;

    @Size(max = 500)
    private String storageInstructions;

    @Size(max = 500)
    private String missedDoseGuidance;

    @Size(max = 500)
    private String warnings;

    @Size(max = 200)
    private String doctorPrescribedDose;

    @Size(max = 200)
    private String reminderSchedule;

    @Size(max = 50)
    private String adherenceStatus;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime lastAdherenceUpdatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonIgnore
    private Patient patient;

    public Long getId() { return id; }
    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getMedicationClass() { return medicationClass; }
    public void setMedicationClass(String medicationClass) { this.medicationClass = medicationClass; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getSuitableDiabetesType() { return suitableDiabetesType; }
    public void setSuitableDiabetesType(String suitableDiabetesType) { this.suitableDiabetesType = suitableDiabetesType; }
    public String getTypicalTiming() { return typicalTiming; }
    public void setTypicalTiming(String typicalTiming) { this.typicalTiming = typicalTiming; }
    public String getHowToUseGeneralInfo() { return howToUseGeneralInfo; }
    public void setHowToUseGeneralInfo(String howToUseGeneralInfo) { this.howToUseGeneralInfo = howToUseGeneralInfo; }
    public String getCommonSideEffects() { return commonSideEffects; }
    public void setCommonSideEffects(String commonSideEffects) { this.commonSideEffects = commonSideEffects; }
    public String getStorageInstructions() { return storageInstructions; }
    public void setStorageInstructions(String storageInstructions) { this.storageInstructions = storageInstructions; }
    public String getMissedDoseGuidance() { return missedDoseGuidance; }
    public void setMissedDoseGuidance(String missedDoseGuidance) { this.missedDoseGuidance = missedDoseGuidance; }
    public String getWarnings() { return warnings; }
    public void setWarnings(String warnings) { this.warnings = warnings; }
    public String getDoctorPrescribedDose() { return doctorPrescribedDose; }
    public void setDoctorPrescribedDose(String doctorPrescribedDose) { this.doctorPrescribedDose = doctorPrescribedDose; }
    public String getReminderSchedule() { return reminderSchedule; }
    public void setReminderSchedule(String reminderSchedule) { this.reminderSchedule = reminderSchedule; }
    public String getAdherenceStatus() { return adherenceStatus; }
    public void setAdherenceStatus(String adherenceStatus) { this.adherenceStatus = adherenceStatus; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDateTime getLastAdherenceUpdatedAt() { return lastAdherenceUpdatedAt; }
    public void setLastAdherenceUpdatedAt(LocalDateTime lastAdherenceUpdatedAt) { this.lastAdherenceUpdatedAt = lastAdherenceUpdatedAt; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
}
