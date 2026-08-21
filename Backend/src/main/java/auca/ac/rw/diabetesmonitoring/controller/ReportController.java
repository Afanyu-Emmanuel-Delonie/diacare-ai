package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.Report;
import auca.ac.rw.diabetesmonitoring.repository.ReportRepository;
import auca.ac.rw.diabetesmonitoring.service.ReportAnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportRepository reportRepository;
    private final ReportAnalyticsService reportAnalyticsService;

    public ReportController(ReportRepository reportRepository, ReportAnalyticsService reportAnalyticsService) {
        this.reportRepository = reportRepository;
        this.reportAnalyticsService = reportAnalyticsService;
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @GetMapping("/patient/{patientId}/health-summary")
    public ResponseEntity<Map<String, Object>> getPatientHealthSummary(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportAnalyticsService.patientHealthSummary(patientId));
    }

    @GetMapping("/patient/{patientId}/glucose-trend")
    public ResponseEntity<Map<String, Object>> getGlucoseTrendReport(
            @PathVariable Long patientId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        LocalDate resolvedEndDate = endDate == null ? LocalDate.now() : endDate;
        LocalDate resolvedStartDate = startDate == null ? resolvedEndDate.minusDays(30) : startDate;
        if (resolvedStartDate.isAfter(resolvedEndDate)) {
            throw new IllegalArgumentException("startDate must be on or before endDate");
        }
        return ResponseEntity.ok(reportAnalyticsService.glucoseTrendReport(patientId, resolvedStartDate, resolvedEndDate));
    }

    @GetMapping("/patient/{patientId}/medication-adherence")
    public ResponseEntity<Map<String, Object>> getMedicationAdherenceReport(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportAnalyticsService.medicationAdherenceReport(patientId));
    }

    @GetMapping("/patient/{patientId}/appointment-history")
    public ResponseEntity<Map<String, Object>> getAppointmentHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportAnalyticsService.appointmentHistory(patientId));
    }

    @GetMapping("/patient/{patientId}/risk-alert-history")
    public ResponseEntity<Map<String, Object>> getRiskAlertHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportAnalyticsService.riskAlertHistory(patientId));
    }

    @GetMapping("/patient/{patientId}/monthly-progress")
    public ResponseEntity<Map<String, Object>> getMonthlyPatientProgressReport(
            @PathVariable Long patientId,
            @RequestParam(required = false) String month) {
        if (month != null && !month.isBlank() && !month.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("month must use YYYY-MM format");
        }
        YearMonth resolvedMonth = month == null || month.isBlank() ? YearMonth.now() : YearMonth.parse(month);
        return ResponseEntity.ok(reportAnalyticsService.monthlyPatientProgressReport(patientId, resolvedMonth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        return reportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Report> createReport(@Valid @RequestBody Report report) {
        return new ResponseEntity<>(reportRepository.save(report), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @Valid @RequestBody Report updatedReport) {
        return reportRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedReport, existing, "id");
                    return ResponseEntity.ok(reportRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        return reportRepository.findById(id)
                .map(existing -> {
                    reportRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
