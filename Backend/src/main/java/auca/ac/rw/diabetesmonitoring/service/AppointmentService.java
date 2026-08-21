package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.AppointmentRequestDto;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.AppointmentRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, PatientRepository patientRepository,
                               DoctorRepository doctorRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public List<Appointment> getByPatientId(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByScheduledAtDesc(patientId);
    }

    public Appointment create(AppointmentRequestDto request, String principalName) {
        Appointment appointment = new Appointment();
        applyRequest(appointment, request, principalName);
        appointment.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "UPCOMING");
        return appointmentRepository.save(appointment);
    }

    public Appointment update(Long id, AppointmentRequestDto request) {
        Appointment existing = getById(id);
        applyRequest(existing, request, null);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            existing.setStatus(request.getStatus());
        }
        return appointmentRepository.save(existing);
    }

    public Appointment updateStatus(Long id, String status) {
        Appointment existing = getById(id);
        existing.setStatus(status);
        return appointmentRepository.save(existing);
    }

    public Appointment cancel(Long id) {
        return updateStatus(id, "CANCELLED");
    }

    public Appointment reschedule(Long id, LocalDateTime scheduledAt, LocalDateTime reminderAt) {
        Appointment existing = getById(id);
        existing.setScheduledAt(scheduledAt);
        if (reminderAt != null) {
            existing.setReminderAt(reminderAt);
        }
        existing.setStatus("UPCOMING");
        return appointmentRepository.save(existing);
    }

    public void delete(Long id) {
        appointmentRepository.delete(getById(id));
    }

    private void applyRequest(Appointment appointment, AppointmentRequestDto request, String principalName) {
        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setLocation(request.getLocation());
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());
        appointment.setReminderAt(request.getReminderAt());

        if (request.getPatientId() != null) {
            appointment.setPatient(resolvePatientById(request.getPatientId()));
        } else if (appointment.getPatient() == null && principalName != null) {
            appointment.setPatient(resolvePatientBySelf(principalName));
        }

        if (request.getDoctorId() != null) {
            appointment.setDoctor(doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId())));
        } else if (appointment.getDoctor() == null && principalName != null) {
            resolveDoctorFromPrincipal(principalName).ifPresent(appointment::setDoctor);
        }
    }

    private Patient resolvePatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
    }

    private Patient resolvePatientBySelf(String principalName) {
        User user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principalName));
        return patientRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No patient profile is linked to this account."));
    }

    private java.util.Optional<Doctor> resolveDoctorFromPrincipal(String principalName) {
        return userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .flatMap(user -> doctorRepository.findByEmail(user.getEmail()));
    }
}
