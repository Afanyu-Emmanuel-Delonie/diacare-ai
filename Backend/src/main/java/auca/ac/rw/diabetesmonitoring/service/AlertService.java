package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.AlertRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Backs both the "Alert" clinical-flag concept and the frontend's notification center — a
 * notification IS an alert row, distinguished by {@code notificationType}/{@code severity}.
 * Other services (risk prediction, medication, appointments) call {@link #raiseSystemAlert}
 * to turn a real backend event into a notification the affected patient's care team can see.
 */
@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final PatientRepository patientRepository;

    public AlertService(AlertRepository alertRepository, PatientRepository patientRepository) {
        this.alertRepository = alertRepository;
        this.patientRepository = patientRepository;
    }

    public Alert create(AlertRequestDto request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));
        Alert alert = new Alert();
        alert.setPatient(patient);
        applyRequest(alert, request);
        return alertRepository.save(alert);
    }

    /** Internal entry point for other services to raise a system-generated notification. */
    public Alert raiseSystemAlert(Patient patient, String title, String message, String notificationType,
                                   String severity, LocalDateTime reminderAt) {
        if (patient == null) {
            return null;
        }
        Alert alert = new Alert();
        alert.setPatient(patient);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setNotificationType(notificationType);
        alert.setSeverity(severity);
        alert.setReminderAt(reminderAt);
        alert.setCreatedBy("System");
        return alertRepository.save(alert);
    }

    public List<Alert> getAll() {
        return alertRepository.findAll();
    }

    public List<Alert> getByPatientId(Long patientId) {
        return alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public Alert getById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
    }

    public Alert update(Long id, AlertRequestDto request) {
        Alert existing = getById(id);
        applyRequest(existing, request);
        return alertRepository.save(existing);
    }

    public Alert markRead(Long id) {
        Alert existing = getById(id);
        if (!Boolean.TRUE.equals(existing.getRead())) {
            existing.setRead(true);
            existing.setReadAt(LocalDateTime.now());
            existing = alertRepository.save(existing);
        }
        return existing;
    }

    public void delete(Long id) {
        Alert existing = getById(id);
        alertRepository.delete(existing);
    }

    private void applyRequest(Alert alert, AlertRequestDto request) {
        alert.setTitle(request.getTitle());
        alert.setMessage(request.getMessage());
        if (request.getNotificationType() != null && !request.getNotificationType().isBlank()) {
            alert.setNotificationType(request.getNotificationType());
        }
        if (request.getSeverity() != null && !request.getSeverity().isBlank()) {
            alert.setSeverity(request.getSeverity());
        }
        alert.setReminderAt(request.getReminderAt());
    }
}
