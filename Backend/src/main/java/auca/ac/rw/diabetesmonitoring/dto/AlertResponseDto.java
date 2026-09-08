package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.Alert;

import java.time.LocalDateTime;

public class AlertResponseDto {

    private Long id;
    private String title;
    private String message;
    private String notificationType;
    private String severity;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime reminderAt;
    private LocalDateTime createdAt;
    private String sender;
    private Long patientId;
    private String patientName;
    private String patientCode;

    public static AlertResponseDto from(Alert alert) {
        AlertResponseDto dto = new AlertResponseDto();
        dto.id = alert.getId();
        dto.title = alert.getTitle();
        dto.message = alert.getMessage();
        dto.notificationType = alert.getNotificationType();
        dto.severity = alert.getSeverity();
        dto.read = Boolean.TRUE.equals(alert.getRead());
        dto.readAt = alert.getReadAt();
        dto.reminderAt = alert.getReminderAt();
        dto.createdAt = alert.getCreatedAt();
        dto.sender = alert.getCreatedBy();
        if (alert.getPatient() != null) {
            dto.patientId = alert.getPatient().getId();
            dto.patientName = alert.getPatient().getFullName();
            dto.patientCode = alert.getPatient().getPatientCode();
        }
        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getNotificationType() { return notificationType; }
    public String getSeverity() { return severity; }
    public boolean isRead() { return read; }
    public LocalDateTime getReadAt() { return readAt; }
    public LocalDateTime getReminderAt() { return reminderAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getSender() { return sender; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getPatientCode() { return patientCode; }
}
