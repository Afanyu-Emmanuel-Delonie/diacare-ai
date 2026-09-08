package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.AuditLog;

import java.time.format.DateTimeFormatter;

public class AuditLogResponseDto {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private Long id;
    private String date;
    private String time;
    private String email;
    private String userRole;
    private String ipAddress;
    private String device;
    private String actionType;
    private String status;
    private String message;

    public static AuditLogResponseDto from(AuditLog log) {
        AuditLogResponseDto dto = new AuditLogResponseDto();
        dto.id = log.getId();
        dto.date = log.getCreatedAt() == null ? "" : log.getCreatedAt().format(DATE_FMT);
        dto.time = log.getCreatedAt() == null ? "" : log.getCreatedAt().format(TIME_FMT);
        dto.email = log.getEmail();
        dto.userRole = log.getUserRole();
        dto.ipAddress = log.getIpAddress();
        dto.device = log.getDevice();
        dto.actionType = log.getActionType();
        dto.status = log.getStatus();
        dto.message = log.getMessage();
        return dto;
    }

    public Long getId() { return id; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getEmail() { return email; }
    public String getUserRole() { return userRole; }
    public String getIpAddress() { return ipAddress; }
    public String getDevice() { return device; }
    public String getActionType() { return actionType; }
    public String getStatus() { return status; }
    public String getMessage() { return message; }
}
