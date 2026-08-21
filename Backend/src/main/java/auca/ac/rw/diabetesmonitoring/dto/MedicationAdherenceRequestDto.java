package auca.ac.rw.diabetesmonitoring.dto;

import jakarta.validation.constraints.NotBlank;

public class MedicationAdherenceRequestDto {

    @NotBlank(message = "Adherence status is required")
    private String adherenceStatus;

    public String getAdherenceStatus() { return adherenceStatus; }
    public void setAdherenceStatus(String adherenceStatus) { this.adherenceStatus = adherenceStatus; }
}
