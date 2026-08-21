package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.Appointment;

import java.time.LocalDateTime;

public class AppointmentResponseDto {

    private Long id;
    private LocalDateTime scheduledAt;
    private String status;
    private String appointmentType;
    private String location;
    private String reason;
    private String notes;
    private LocalDateTime reminderAt;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AppointmentResponseDto from(Appointment appointment) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.id = appointment.getId();
        dto.scheduledAt = appointment.getScheduledAt();
        dto.status = appointment.getStatus();
        dto.appointmentType = appointment.getAppointmentType();
        dto.location = appointment.getLocation();
        dto.reason = appointment.getReason();
        dto.notes = appointment.getNotes();
        dto.reminderAt = appointment.getReminderAt();
        dto.createdAt = appointment.getCreatedAt();
        dto.updatedAt = appointment.getUpdatedAt();
        if (appointment.getPatient() != null) {
            dto.patientId = appointment.getPatient().getId();
            dto.patientName = appointment.getPatient().getFullName();
            dto.patientCode = appointment.getPatient().getPatientCode();
        }
        if (appointment.getDoctor() != null) {
            dto.doctorId = appointment.getDoctor().getId();
            dto.doctorName = appointment.getDoctor().getFullName();
        }
        return dto;
    }

    public Long getId() { return id; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getStatus() { return status; }
    public String getAppointmentType() { return appointmentType; }
    public String getLocation() { return location; }
    public String getReason() { return reason; }
    public String getNotes() { return notes; }
    public LocalDateTime getReminderAt() { return reminderAt; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getPatientCode() { return patientCode; }
    public Long getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
