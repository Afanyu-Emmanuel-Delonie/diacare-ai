package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment create(Appointment appointment) {
        validate(appointment);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public Appointment update(Long id, Appointment updatedAppointment) {
        Appointment existing = getById(id);
        validate(updatedAppointment);
        existing.setScheduledAt(updatedAppointment.getScheduledAt());
        existing.setStatus(updatedAppointment.getStatus());
        return appointmentRepository.save(existing);
    }

    public void delete(Long id) {
        Appointment existing = getById(id);
        appointmentRepository.delete(existing);
    }

    private void validate(Appointment appointment) {
        if (appointment.getScheduledAt() == null) {
            throw new IllegalArgumentException("Appointment date is required");
        }
        if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
            throw new IllegalArgumentException("Appointment status is required");
        }
    }
}
