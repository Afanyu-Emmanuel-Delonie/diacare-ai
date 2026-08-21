package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import auca.ac.rw.diabetesmonitoring.repository.AppointmentRepository;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.OptionalDouble;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReportAnalyticsService {

    private final PatientRepository patientRepository;
    private final GlucoseReadingRepository glucoseReadingRepository;
    private final MedicationRepository medicationRepository;
    private final AppointmentRepository appointmentRepository;
    private final AlertRepository alertRepository;

    public ReportAnalyticsService(PatientRepository patientRepository,
                                  GlucoseReadingRepository glucoseReadingRepository,
                                  MedicationRepository medicationRepository,
                                  AppointmentRepository appointmentRepository,
                                  AlertRepository alertRepository) {
        this.patientRepository = patientRepository;
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.medicationRepository = medicationRepository;
        this.appointmentRepository = appointmentRepository;
        this.alertRepository = alertRepository;
    }

    public Map<String, Object> patientHealthSummary(Long patientId) {
        Patient patient = getPatient(patientId);
        List<GlucoseReading> glucoseReadings = glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patientId);
        List<Medication> medications = medicationRepository.findByPatientIdOrderByStartDateAsc(patientId);
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByScheduledAtDesc(patientId);
        List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> summary = baseReport("Patient Health Summary", patient);
        summary.put("age", age(patient.getDateOfBirth()));
        summary.put("glucoseSummary", glucoseSummary(glucoseReadings));
        summary.put("activeMedicationCount", activeMedicationCount(medications, LocalDate.now()));
        summary.put("medicationAdherenceSummary", adherenceSummary(medications));
        summary.put("totalAppointments", appointments.size());
        summary.put("latestAppointment", appointments.stream().findFirst().map(this::appointmentDetails).orElse(null));
        summary.put("riskAlertCount", alerts.size());
        summary.put("latestRiskAlert", alerts.stream().findFirst().map(this::alertDetails).orElse(null));
        return summary;
    }

    public Map<String, Object> glucoseTrendReport(Long patientId, LocalDate startDate, LocalDate endDate) {
        Patient patient = getPatient(patientId);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        List<GlucoseReading> readings =
                glucoseReadingRepository.findByPatientIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(patientId, start, end);

        Map<String, Object> report = baseReport("Glucose Trend Report", patient);
        report.put("period", period(startDate, endDate));
        report.put("summary", glucoseSummary(readings));
        report.put("dailyAverages", readings.stream()
                .collect(Collectors.groupingBy(
                        reading -> reading.getMeasuredAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.averagingDouble(GlucoseReading::getReading))));
        report.put("readings", readings.stream().map(this::glucoseDetails).toList());
        return report;
    }

    public Map<String, Object> medicationAdherenceReport(Long patientId) {
        Patient patient = getPatient(patientId);
        List<Medication> medications = medicationRepository.findByPatientIdOrderByStartDateAsc(patientId);

        Map<String, Object> report = baseReport("Medication Adherence Report", patient);
        report.put("summary", adherenceSummary(medications));
        report.put("medications", medications.stream().map(this::medicationDetails).toList());
        return report;
    }

    public Map<String, Object> appointmentHistory(Long patientId) {
        Patient patient = getPatient(patientId);
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByScheduledAtDesc(patientId);

        Map<String, Object> report = baseReport("Appointment History", patient);
        report.put("totalAppointments", appointments.size());
        report.put("statusCounts", countBy(appointments, appointment -> normalize(appointment.getStatus())));
        report.put("appointments", appointments.stream().map(this::appointmentDetails).toList());
        return report;
    }

    public Map<String, Object> riskAlertHistory(Long patientId) {
        Patient patient = getPatient(patientId);
        List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> report = baseReport("Risk Alert History", patient);
        report.put("totalAlerts", alerts.size());
        report.put("titleCounts", countBy(alerts, Alert::getTitle));
        report.put("alerts", alerts.stream().map(this::alertDetails).toList());
        return report;
    }

    public Map<String, Object> monthlyPatientProgressReport(Long patientId, YearMonth month) {
        Patient patient = getPatient(patientId);
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<GlucoseReading> glucoseReadings =
                glucoseReadingRepository.findByPatientIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(patientId, start, end);
        List<Appointment> appointments =
                appointmentRepository.findByPatientIdAndScheduledAtBetweenOrderByScheduledAtDesc(patientId, start, end);
        List<Alert> alerts =
                alertRepository.findByPatientIdAndCreatedAtBetweenOrderByCreatedAtDesc(patientId, start, end);
        List<Medication> medications = medicationRepository.findByPatientIdOrderByStartDateAsc(patientId);

        Map<String, Object> report = baseReport("Monthly Patient Progress Report", patient);
        report.put("month", month.toString());
        report.put("period", period(startDate, endDate));
        report.put("glucoseSummary", glucoseSummary(glucoseReadings));
        report.put("activeMedicationCount", activeMedicationCount(medications, endDate));
        report.put("medicationAdherenceSummary", adherenceSummary(medications));
        report.put("appointmentStatusCounts", countBy(appointments, appointment -> normalize(appointment.getStatus())));
        report.put("riskAlertCount", alerts.size());
        report.put("riskAlertTitleCounts", countBy(alerts, Alert::getTitle));
        report.put("progressNotes", progressNotes(glucoseReadings, appointments, alerts));
        return report;
    }

    public Map<String, Object> clinicalReport(Long patientId, String reportAudience) {
        Patient patient = getPatient(patientId);
        List<GlucoseReading> glucoseReadings = glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patientId);
        List<Medication> medications = medicationRepository.findByPatientIdOrderByStartDateAsc(patientId);
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByScheduledAtDesc(patientId);
        List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportAudience", reportAudience);
        report.put("generatedAt", LocalDateTime.now());
        report.put("patientProfile", patientDetails(patient));

        Map<String, Object> sections = new LinkedHashMap<>();
        sections.put("healthSummary", section("Health Summary", List.of(
                item(LocalDateTime.now(), Map.of(
                        "age", String.valueOf(age(patient.getDateOfBirth())),
                        "averageGlucoseMgDl", String.valueOf(average(glucoseReadings)),
                        "glucoseTrend", glucoseTrend(glucoseReadings),
                        "activeMedications", String.valueOf(activeMedicationCount(medications, LocalDate.now())),
                        "totalAppointments", String.valueOf(appointments.size()),
                        "riskAlertCount", String.valueOf(alerts.size())
                ))
        )));
        sections.put("glucoseTrend", section("Glucose Trend", glucoseReadings.stream()
                .map(r -> item(r.getMeasuredAt(), Map.of("readingMgDl", String.valueOf(r.getReading()))))
                .toList()));
        sections.put("medicationAdherence", section("Medication Adherence", medications.stream()
                .map(m -> item(m.getStartDate() == null ? null : m.getStartDate().atStartOfDay(), Map.of(
                        "medicationName", String.valueOf(m.getMedicationName()),
                        "adherenceStatus", String.valueOf(m.getAdherenceStatus()),
                        "doctorPrescribedDose", String.valueOf(m.getDoctorPrescribedDose())
                )))
                .toList()));
        sections.put("appointmentHistory", section("Appointment History", appointments.stream()
                .map(a -> item(a.getScheduledAt(), Map.of("status", String.valueOf(a.getStatus()))))
                .toList()));
        sections.put("riskAlerts", section("Risk Alerts", alerts.stream()
                .map(a -> item(a.getCreatedAt(), Map.of("title", String.valueOf(a.getTitle()), "message", String.valueOf(a.getMessage()))))
                .toList()));

        report.put("sections", sections);
        return report;
    }

    private Map<String, Object> section(String sectionName, List<Map<String, Object>> items) {
        Map<String, Object> section = new LinkedHashMap<>();
        section.put("sectionName", sectionName);
        if (items.isEmpty()) {
            section.put("message", "No data available for this section.");
        }
        section.put("items", items);
        return section;
    }

    private Map<String, Object> item(LocalDateTime dateTime, Map<String, Object> details) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("dateTime", dateTime);
        item.put("details", details);
        return item;
    }

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
    }

    private Map<String, Object> baseReport(String reportName, Patient patient) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportName", reportName);
        report.put("generatedAt", LocalDateTime.now());
        report.put("patient", patientDetails(patient));
        report.put("dataSource", "Database records only");
        return report;
    }

    private Map<String, Object> patientDetails(Patient patient) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", patient.getId());
        details.put("fullName", patient.getFullName());
        details.put("email", patient.getEmail());
        details.put("phone", patient.getPhone());
        details.put("dateOfBirth", patient.getDateOfBirth());
        return details;
    }

    private Map<String, Object> glucoseSummary(List<GlucoseReading> readings) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("readingCount", readings.size());
        summary.put("averageMgDl", average(readings));
        summary.put("minimumMgDl", readings.stream().map(GlucoseReading::getReading).min(Double::compareTo).orElse(null));
        summary.put("maximumMgDl", readings.stream().map(GlucoseReading::getReading).max(Double::compareTo).orElse(null));
        summary.put("firstReading", readings.stream().findFirst().map(this::glucoseDetails).orElse(null));
        summary.put("latestReading", readings.stream()
                .max(Comparator.comparing(GlucoseReading::getMeasuredAt))
                .map(this::glucoseDetails)
                .orElse(null));
        summary.put("trend", glucoseTrend(readings));
        return summary;
    }

    private Double average(List<GlucoseReading> readings) {
        OptionalDouble average = readings.stream().mapToDouble(GlucoseReading::getReading).average();
        return average.isPresent() ? round(average.getAsDouble()) : null;
    }

    private String glucoseTrend(List<GlucoseReading> readings) {
        if (readings.size() < 2) {
            return "INSUFFICIENT_DATA";
        }
        GlucoseReading first = readings.get(0);
        GlucoseReading latest = readings.get(readings.size() - 1);
        double difference = latest.getReading() - first.getReading();
        if (Math.abs(difference) < 5) {
            return "STABLE";
        }
        return difference > 0 ? "INCREASING" : "DECREASING";
    }

    private Map<String, Object> glucoseDetails(GlucoseReading reading) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", reading.getId());
        details.put("readingMgDl", reading.getReading());
        details.put("measuredAt", reading.getMeasuredAt());
        return details;
    }

    private Map<String, Object> adherenceSummary(List<Medication> medications) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("medicationCount", medications.size());
        summary.put("statusCounts", countBy(medications, medication -> normalize(medication.getAdherenceStatus())));
        summary.put("missingAdherenceStatusCount", medications.stream()
                .filter(medication -> medication.getAdherenceStatus() == null || medication.getAdherenceStatus().isBlank())
                .count());
        return summary;
    }

    private Map<String, Object> medicationDetails(Medication medication) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", medication.getId());
        details.put("medicationName", medication.getMedicationName());
        details.put("medicationClass", medication.getMedicationClass());
        details.put("doctorPrescribedDose", medication.getDoctorPrescribedDose());
        details.put("reminderSchedule", medication.getReminderSchedule());
        details.put("adherenceStatus", medication.getAdherenceStatus());
        details.put("startDate", medication.getStartDate());
        details.put("endDate", medication.getEndDate());
        return details;
    }

    private Map<String, Object> appointmentDetails(Appointment appointment) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", appointment.getId());
        details.put("scheduledAt", appointment.getScheduledAt());
        details.put("status", appointment.getStatus());
        details.put("createdAt", appointment.getCreatedAt());
        return details;
    }

    private Map<String, Object> alertDetails(Alert alert) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", alert.getId());
        details.put("title", alert.getTitle());
        details.put("message", alert.getMessage());
        details.put("createdAt", alert.getCreatedAt());
        return details;
    }

    private long activeMedicationCount(List<Medication> medications, LocalDate date) {
        return medications.stream()
                .filter(medication -> !medication.getStartDate().isAfter(date))
                .filter(medication -> medication.getEndDate() == null || !medication.getEndDate().isBefore(date))
                .count();
    }

    private List<String> progressNotes(List<GlucoseReading> glucoseReadings, List<Appointment> appointments, List<Alert> alerts) {
        return List.of(
                "Glucose trend: " + glucoseTrend(glucoseReadings),
                "Glucose readings recorded: " + glucoseReadings.size(),
                "Appointments in period: " + appointments.size(),
                "Risk alerts in period: " + alerts.size()
        );
    }

    private <T> Map<String, Long> countBy(List<T> values, Function<T, String> classifier) {
        return values.stream()
                .map(classifier)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()));
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "UNSPECIFIED";
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private Integer age(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return null;
        }
        return (int) ChronoUnit.YEARS.between(dateOfBirth, LocalDate.now());
    }

    private Map<String, Object> period(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> period = new LinkedHashMap<>();
        period.put("startDate", startDate);
        period.put("endDate", endDate);
        return period;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
