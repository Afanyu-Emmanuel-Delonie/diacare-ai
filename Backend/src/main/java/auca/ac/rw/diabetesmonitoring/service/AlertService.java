package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert create(Alert alert) {
        validate(alert);
        return alertRepository.save(alert);
    }

    public List<Alert> getAll() {
        return alertRepository.findAll();
    }

    public Alert getById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
    }

    public Alert update(Long id, Alert updatedAlert) {
        Alert existing = getById(id);
        validate(updatedAlert);
        existing.setTitle(updatedAlert.getTitle());
        existing.setMessage(updatedAlert.getMessage());
        return alertRepository.save(existing);
    }

    public void delete(Long id) {
        Alert existing = getById(id);
        alertRepository.delete(existing);
    }

    private void validate(Alert alert) {
        if (alert.getTitle() == null || alert.getTitle().isBlank()) {
            throw new IllegalArgumentException("Alert title is required");
        }
        if (alert.getMessage() == null || alert.getMessage().isBlank()) {
            throw new IllegalArgumentException("Alert message is required");
        }
    }
}
