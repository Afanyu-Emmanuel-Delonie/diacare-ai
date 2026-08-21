package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.RiskPrediction;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public class RiskPredictionResponseDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private Double currentReading;
    private LocalDateTime measuredAt;
    private String riskCategory;
    private List<String> triggeredSignals;
    private String alertMessage;
    private LocalDateTime createdAt;

    public static RiskPredictionResponseDto from(RiskPrediction prediction) {
        RiskPredictionResponseDto dto = new RiskPredictionResponseDto();
        dto.id = prediction.getId();
        dto.currentReading = prediction.getReading();
        dto.measuredAt = prediction.getMeasuredAt();
        dto.riskCategory = prediction.getRiskCategory();
        dto.triggeredSignals = prediction.getTriggeredSignals() == null || prediction.getTriggeredSignals().isBlank()
                ? List.of()
                : Arrays.asList(prediction.getTriggeredSignals().split("\\|"));
        dto.alertMessage = prediction.getAlertMessage();
        dto.createdAt = prediction.getCreatedAt();
        if (prediction.getPatient() != null) {
            dto.patientId = prediction.getPatient().getId();
            dto.patientName = prediction.getPatient().getFullName();
        }
        return dto;
    }

    public Long getId() { return id; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public Double getCurrentReading() { return currentReading; }
    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public String getRiskCategory() { return riskCategory; }
    public List<String> getTriggeredSignals() { return triggeredSignals; }
    public String getAlertMessage() { return alertMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
