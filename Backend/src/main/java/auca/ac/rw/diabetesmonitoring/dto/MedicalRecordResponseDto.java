package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicalRecordResponseDto {

    private Long id;
    private String diagnosis;
    private String notes;
    private LocalDate recordDate;
    private LocalDateTime recordDateTime;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientCode;
    private Long doctorId;
    private String doctorName;

    public static MedicalRecordResponseDto from(MedicalRecord record) {
        MedicalRecordResponseDto dto = new MedicalRecordResponseDto();
        dto.id = record.getId();
        dto.diagnosis = record.getDiagnosis();
        dto.notes = record.getNotes();
        dto.recordDate = record.getRecordDate();
        dto.recordDateTime = record.getRecordDateTime();
        if (record.getPatient() != null) {
            dto.patientId = record.getPatient().getId();
            dto.patientName = record.getPatient().getFullName();
            dto.patientEmail = record.getPatient().getEmail();
            dto.patientCode = record.getPatient().getPatientCode();
        }
        if (record.getDoctor() != null) {
            dto.doctorId = record.getDoctor().getId();
            dto.doctorName = record.getDoctor().getFullName();
        }
        return dto;
    }

    public Long getId() { return id; }
    public String getDiagnosis() { return diagnosis; }
    public String getNotes() { return notes; }
    public LocalDate getRecordDate() { return recordDate; }
    public LocalDateTime getRecordDateTime() { return recordDateTime; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getPatientEmail() { return patientEmail; }
    public String getPatientCode() { return patientCode; }
    public Long getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
}
