package auca.ac.rw.diabetesmonitoring.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class RiskPredictionRequestDto {

    private Long patientId;

    @NotNull(message = "Current reading is required")
    private Double currentReading;

    private LocalDateTime measuredAt;

    private List<Double> recentReadings;

    private boolean medicationAdherenceMissed;

    private Double hba1cResult;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Double getCurrentReading() { return currentReading; }
    public void setCurrentReading(Double currentReading) { this.currentReading = currentReading; }
    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }
    public List<Double> getRecentReadings() { return recentReadings; }
    public void setRecentReadings(List<Double> recentReadings) { this.recentReadings = recentReadings; }
    public boolean isMedicationAdherenceMissed() { return medicationAdherenceMissed; }
    public void setMedicationAdherenceMissed(boolean medicationAdherenceMissed) { this.medicationAdherenceMissed = medicationAdherenceMissed; }
    public Double getHba1cResult() { return hba1cResult; }
    public void setHba1cResult(Double hba1cResult) { this.hba1cResult = hba1cResult; }
}
