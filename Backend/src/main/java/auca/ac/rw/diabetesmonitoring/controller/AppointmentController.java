package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.AppointmentRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.AppointmentResponseDto;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.service.AppointmentService;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientAccessService patientAccessService;

    public AppointmentController(AppointmentService appointmentService, PatientAccessService patientAccessService) {
        this.appointmentService = appointmentService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments(Authentication authentication) {
        List<Appointment> appointments = appointmentService.getAll().stream()
                .filter(a -> canAccess(a, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointments.stream().map(AppointmentResponseDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDto>> getByPatient(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(appointmentService.getByPatientId(patientId).stream()
                .map(AppointmentResponseDto::from)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id, Authentication authentication) {
        Appointment appointment = appointmentService.getById(id);
        if (!canAccess(appointment, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AppointmentResponseDto.from(appointment));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto request,
                                                                      Authentication authentication) {
        if (request.getPatientId() != null && !patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        AppointmentResponseDto dto = AppointmentResponseDto.from(appointmentService.create(request, authentication.getName()));
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRequestDto request,
                                                                      Authentication authentication) {
        Appointment existing = appointmentService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.getPatientId() != null && !patientAccessService.canAccessPatientId(authentication, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                                                 Authentication authentication) {
        if (!canAccess(appointmentService.getById(id), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.updateStatus(id, body.get("status"))));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        if (!canAccess(appointmentService.getById(id), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.cancel(id)));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDto> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> body,
                                                                         Authentication authentication) {
        if (!canAccess(appointmentService.getById(id), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        LocalDateTime scheduledAt = LocalDateTime.parse(body.get("scheduledAt"));
        LocalDateTime reminderAt = body.get("reminderAt") != null && !body.get("reminderAt").isBlank()
                ? LocalDateTime.parse(body.get("reminderAt")) : null;
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.reschedule(id, scheduledAt, reminderAt)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id, Authentication authentication) {
        Appointment existing = appointmentService.getById(id);
        if (!canAccess(existing, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccess(Appointment appointment, Authentication authentication) {
        return appointment.getPatient() != null && patientAccessService.canAccessPatient(authentication, appointment.getPatient());
    }
}
