package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.Patient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PatientResponseDto {

    private Long id;
    private UUID uuid;
    private String patientCode;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String diabetesType;
    private String diagnosisDate;
    private String address;
    private String gender;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String status;
    private Long doctorId;
    private String doctorName;
    private String doctorEmail;
    private Long nurseId;
    private Long caregiverId;
    private boolean active;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PatientResponseDto from(Patient p) {
        PatientResponseDto dto = new PatientResponseDto();
        dto.id = p.getId();
        dto.uuid = p.getUuid();
        dto.patientCode = p.getPatientCode();
        dto.fullName = p.getFullName();
        dto.email = p.getEmail();
        dto.phone = p.getPhone();
        dto.dateOfBirth = p.getDateOfBirth();
        dto.diabetesType = p.getDiabetesType();
        dto.diagnosisDate = p.getDiagnosisDate() == null ? null : p.getDiagnosisDate().toString();
        dto.address = p.getAddress();
        dto.gender = p.getGender();
        dto.emergencyContactName = p.getEmergencyContactName();
        dto.emergencyContactPhone = p.getEmergencyContactPhone();
        dto.active = !Boolean.FALSE.equals(p.getActive());
        dto.deleted = Boolean.TRUE.equals(p.getDeleted());
        dto.status = dto.deleted ? "ARCHIVED" : (dto.active ? "ACTIVE" : "INACTIVE");
        dto.createdAt = p.getCreatedAt();
        dto.updatedAt = p.getUpdatedAt();
        if (p.getDoctor() != null) {
            dto.doctorId = p.getDoctor().getId();
            dto.doctorName = p.getDoctor().getFullName();
            dto.doctorEmail = p.getDoctor().getEmail();
        }
        if (p.getNurse() != null) {
            dto.nurseId = p.getNurse().getId();
        }
        if (p.getCaregiver() != null) {
            dto.caregiverId = p.getCaregiver().getId();
        }
        return dto;
    }

    public Long getId() { return id; }
    public UUID getUuid() { return uuid; }
    public String getPatientCode() { return patientCode; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getDiabetesType() { return diabetesType; }
    public String getDiagnosisDate() { return diagnosisDate; }
    public String getAddress() { return address; }
    public String getGender() { return gender; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public String getStatus() { return status; }
    public Long getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorEmail() { return doctorEmail; }
    public Long getNurseId() { return nurseId; }
    public Long getCaregiverId() { return caregiverId; }
    public boolean isActive() { return active; }
    public boolean isDeleted() { return deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
