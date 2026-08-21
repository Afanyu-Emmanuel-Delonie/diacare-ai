package auca.ac.rw.diabetesmonitoring.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class RiskPredictionRequest {

    @DecimalMin(value = "40.0", message = "Current reading must be at least 40 mg/dL")
    @DecimalMax(value = "500.0", message = "Current reading must not exceed 500 mg/dL")
    private Double currentReading;

    private LocalDateTime measuredAt;

    @Size(max = 30, message = "Recent readings must not contain more than 30 values")
    private List<@DecimalMin("40.0") @DecimalMax("500.0") Double> recentReadings = List.of();

    private Boolean medicationAdherenceMissed = false;

    @DecimalMin(value = "3.0", message = "HbA1c result must be at least 3.0")
    @DecimalMax(value = "20.0", message = "HbA1c result must not exceed 20.0")
    private Double hba1cResult;

    public Double getCurrentReading() { return currentReading; }
    public void setCurrentReading(Double currentReading) { this.currentReading = currentReading; }
    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }
    public List<Double> getRecentReadings() { return recentReadings; }
    public void setRecentReadings(List<Double> recentReadings) { this.recentReadings = recentReadings; }
    public Boolean getMedicationAdherenceMissed() { return medicationAdherenceMissed; }
    public void setMedicationAdherenceMissed(Boolean medicationAdherenceMissed) { this.medicationAdherenceMissed = medicationAdherenceMissed; }
    public Double getHba1cResult() { return hba1cResult; }
    public void setHba1cResult(Double hba1cResult) { this.hba1cResult = hba1cResult; }
}
