package auca.ac.rw.diabetesmonitoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = @Index(name = "idx_alerts_patient_id", columnList = "patient_id"))
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    /**
     * One of: MEDICATION_REMINDER, APPOINTMENT_REMINDER, AI_RISK, EMERGENCY,
     * GENERAL_SYSTEM_NOTIFICATION (free text otherwise — the frontend falls back to keyword
     * matching on title/message for BLOOD_GLUCOSE_ALERT, LABORATORY_RESULT_NOTIFICATION, and
     * DOCTOR_REVIEW_NOTIFICATION, so those three are not exact-matched here).
     */
    private String notificationType;

    /** One of: INFO, SUCCESS, WARNING, CRITICAL. */
    private String severity;

    private Boolean read;

    private LocalDateTime readAt;

    /** Optional scheduled time this reminder is "for" (e.g. an appointment or dose time). */
    private LocalDateTime reminderAt;

    private String createdBy;

    @NotNull
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Patient patient;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (notificationType == null || notificationType.isBlank()) {
            notificationType = "GENERAL_SYSTEM_NOTIFICATION";
        }
        if (severity == null || severity.isBlank()) {
            severity = "INFO";
        }
        if (read == null) {
            read = false;
        }
        if (createdBy == null || createdBy.isBlank()) {
            createdBy = "System";
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public LocalDateTime getReminderAt() { return reminderAt; }
    public void setReminderAt(LocalDateTime reminderAt) { this.reminderAt = reminderAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
}
