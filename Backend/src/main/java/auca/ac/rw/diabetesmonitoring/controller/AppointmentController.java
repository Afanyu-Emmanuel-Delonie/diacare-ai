package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.AppointmentRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.AppointmentResponseDto;
import auca.ac.rw.diabetesmonitoring.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAll().stream()
                .map(AppointmentResponseDto::from)
                .collect(Collectors.toList()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getByPatientId(patientId).stream()
                .map(AppointmentResponseDto::from)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto request,
                                                                      Authentication authentication) {
        AppointmentResponseDto dto = AppointmentResponseDto.from(appointmentService.create(request, authentication.getName()));
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRequestDto request) {
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.updateStatus(id, body.get("status"))));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.cancel(id)));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDto> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LocalDateTime scheduledAt = LocalDateTime.parse(body.get("scheduledAt"));
        LocalDateTime reminderAt = body.get("reminderAt") != null && !body.get("reminderAt").isBlank()
                ? LocalDateTime.parse(body.get("reminderAt")) : null;
        return ResponseEntity.ok(AppointmentResponseDto.from(appointmentService.reschedule(id, scheduledAt, reminderAt)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
