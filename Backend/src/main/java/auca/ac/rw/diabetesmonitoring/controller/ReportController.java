package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.Report;
import auca.ac.rw.diabetesmonitoring.repository.ReportRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import auca.ac.rw.diabetesmonitoring.service.ReportAnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class ReportController {

    private final ReportRepository reportRepository;
    private final ReportAnalyticsService reportAnalyticsService;
    private final PatientAccessService patientAccessService;

    public ReportController(ReportRepository reportRepository, ReportAnalyticsService reportAnalyticsService,
                             PatientAccessService patientAccessService) {
        this.reportRepository = reportRepository;
        this.reportAnalyticsService = reportAnalyticsService;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports(Authentication authentication) {
        List<Report> reports = reportRepository.findAll().stream()
                .filter(r -> canAccess(r, authentication))
                .collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/patient/{patientId}/health-summary")
    public ResponseEntity<Map<String, Object>> getPatientHealthSummary(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reportAnalyticsService.patientHealthSummary(patientId));
    }

    @GetMapping("/patient/{patientId}/glucose-trend")
    public ResponseEntity<Map<String, Object>> getGlucoseTrendReport(
            @PathVariable Long patientId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        LocalDate resolvedEndDate = endDate == null ? LocalDate.now() : endDate;
        LocalDate resolvedStartDate = startDate == null ? resolvedEndDate.minusDays(30) : startDate;
        if (resolvedStartDate.isAfter(resolvedEndDate)) {
            throw new IllegalArgumentException("startDate must be on or before endDate");
        }
        return ResponseEntity.ok(reportAnalyticsService.glucoseTrendReport(patientId, resolvedStartDate, resolvedEndDate));
    }

    @GetMapping("/patient/{patientId}/medication-adherence")
    public ResponseEntity<Map<String, Object>> getMedicationAdherenceReport(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reportAnalyticsService.medicationAdherenceReport(patientId));
    }

    @GetMapping("/patient/{patientId}/appointment-history")
    public ResponseEntity<Map<String, Object>> getAppointmentHistory(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reportAnalyticsService.appointmentHistory(patientId));
    }

    @GetMapping("/patient/{patientId}/risk-alert-history")
    public ResponseEntity<Map<String, Object>> getRiskAlertHistory(@PathVariable Long patientId, Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reportAnalyticsService.riskAlertHistory(patientId));
    }

    @GetMapping("/patient/{patientId}/clinical")
    public ResponseEntity<Map<String, Object>> getClinicalReport(@PathVariable Long patientId,
                                                                  @RequestParam(required = false, defaultValue = "Health Report") String audience,
                                                                  Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reportAnalyticsService.clinicalReport(patientId, audience));
    }

    @GetMapping("/patient/{patientId}/monthly-progress")
    public ResponseEntity<Map<String, Object>> getMonthlyPatientProgressReport(
            @PathVariable Long patientId,
            @RequestParam(required = false) String month,
            Authentication authentication) {
        if (!patientAccessService.canAccessPatientId(authentication, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (month != null && !month.isBlank() && !month.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("month must use YYYY-MM format");
        }
        YearMonth resolvedMonth = month == null || month.isBlank() ? YearMonth.now() : YearMonth.parse(month);
        return ResponseEntity.ok(reportAnalyticsService.monthlyPatientProgressReport(patientId, resolvedMonth));
    }

    @GetMapping("/admin/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminSystemReport(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(reportAnalyticsService.systemReport(startDate, endDate));
    }

    @GetMapping("/admin/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminSecurityAuditReport(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(reportAnalyticsService.securityAuditReport(startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id, Authentication authentication) {
        return reportRepository.findById(id)
                .map(report -> canAccess(report, authentication)
                        ? ResponseEntity.ok(report)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<Report>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Report> createReport(@Valid @RequestBody Report report, Authentication authentication) {
        if (report.getPatient() == null || report.getPatient().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!patientAccessService.canAccessPatientId(authentication, report.getPatient().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(reportRepository.save(report), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @Valid @RequestBody Report updatedReport, Authentication authentication) {
        return reportRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication) || !canAccessTarget(updatedReport, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Report>build();
                    }
                    BeanUtils.copyProperties(updatedReport, existing, "id");
                    return ResponseEntity.ok(reportRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id, Authentication authentication) {
        return reportRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    reportRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean canAccess(Report report, Authentication authentication) {
        return report.getPatient() != null && patientAccessService.canAccessPatient(authentication, report.getPatient());
    }

    private boolean canAccessTarget(Report report, Authentication authentication) {
        return report.getPatient() == null || report.getPatient().getId() == null
                || patientAccessService.canAccessPatientId(authentication, report.getPatient().getId());
    }
}
