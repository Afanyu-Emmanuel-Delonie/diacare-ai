package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.model.LabResult;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.Report;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import auca.ac.rw.diabetesmonitoring.repository.AppointmentRepository;
import auca.ac.rw.diabetesmonitoring.repository.CaregiverRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import auca.ac.rw.diabetesmonitoring.repository.LabResultRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicalRecordRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import auca.ac.rw.diabetesmonitoring.repository.NurseRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import auca.ac.rw.diabetesmonitoring.repository.ReportRepository;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final double HYPOGLYCEMIA_THRESHOLD = 70;
    private static final double HYPERGLYCEMIA_THRESHOLD = 180;

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final GlucoseReadingRepository glucoseReadingRepository;
    private final AlertRepository alertRepository;
    private final LabResultRepository labResultRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicationRepository medicationRepository;
    private final NurseRepository nurseRepository;
    private final CaregiverRepository caregiverRepository;
    private final ReportRepository reportRepository;
    private final RiskPredictionService riskPredictionService;

    public DashboardService(UserRepository userRepository, DoctorRepository doctorRepository,
                             PatientRepository patientRepository, AppointmentRepository appointmentRepository,
                             GlucoseReadingRepository glucoseReadingRepository, AlertRepository alertRepository,
                             LabResultRepository labResultRepository, MedicalRecordRepository medicalRecordRepository,
                             MedicationRepository medicationRepository, NurseRepository nurseRepository,
                             CaregiverRepository caregiverRepository, ReportRepository reportRepository,
                             RiskPredictionService riskPredictionService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.alertRepository = alertRepository;
        this.labResultRepository = labResultRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicationRepository = medicationRepository;
        this.nurseRepository = nurseRepository;
        this.caregiverRepository = caregiverRepository;
        this.reportRepository = reportRepository;
        this.riskPredictionService = riskPredictionService;
    }

    public Map<String, Object> getDoctorDashboard(String principalName) {
        Doctor doctor = resolveDoctor(principalName);
        List<Patient> patients = patientRepository.findByDoctorId(doctor.getId());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        int todaysAppointments = 0;
        int recentGlucoseAlerts = 0;
        int aiRiskAlerts = 0;
        int recentLabResults = 0;

        List<Map<String, Object>> patientSummary = new ArrayList<>();
        List<Map<String, Object>> clinicalActivity = new ArrayList<>();
        List<Map<String, Object>> riskAlerts = new ArrayList<>();
        Map<LocalDate, List<Double>> readingsByDay = new LinkedHashMap<>();

        for (Patient patient : patients) {
            List<GlucoseReading> readings = glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patient.getId());
            GlucoseReading latest = readings.isEmpty() ? null : readings.get(readings.size() - 1);

            String riskLevel = "No data";
            if (latest != null) {
                List<Double> recentValues = readings.stream()
                        .skip(Math.max(0, readings.size() - 5))
                        .map(GlucoseReading::getReading)
                        .toList();
                RiskPredictionResult risk = riskPredictionService.analyzeRisk(
                        latest.getReading(), latest.getMeasuredAt(), recentValues, false, null);
                riskLevel = toDisplayRiskLevel(risk.getRiskCategory());

                if (latest.getMeasuredAt() != null && latest.getMeasuredAt().isAfter(sevenDaysAgo)
                        && (latest.getReading() < HYPOGLYCEMIA_THRESHOLD || latest.getReading() > HYPERGLYCEMIA_THRESHOLD)) {
                    recentGlucoseAlerts++;
                }
                if ("HIGH".equals(riskLevel) || "CRITICAL".equals(riskLevel)) {
                    aiRiskAlerts++;
                }
            }

            for (GlucoseReading reading : readings) {
                if (reading.getMeasuredAt() != null && reading.getMeasuredAt().isAfter(sevenDaysAgo)) {
                    readingsByDay.computeIfAbsent(reading.getMeasuredAt().toLocalDate(), d -> new ArrayList<>())
                            .add(reading.getReading());
                }
            }

            List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId());
            todaysAppointments += (int) appointments.stream()
                    .filter(a -> a.getScheduledAt() != null && !a.getScheduledAt().isBefore(todayStart) && a.getScheduledAt().isBefore(todayEnd))
                    .count();

            List<LabResult> labResults = labResultRepository.findByPatientId(patient.getId());
            recentLabResults += (int) labResults.stream()
                    .filter(r -> r.getTestedOn() != null && !r.getTestedOn().isBefore(sevenDaysAgo.toLocalDate()))
                    .count();

            List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
            for (Alert alert : alerts.stream().limit(3).toList()) {
                riskAlerts.add(Map.of(
                        "title", alert.getTitle(),
                        "message", alert.getMessage(),
                        "level", "INFO",
                        "time", alert.getCreatedAt() == null ? "" : alert.getCreatedAt().toString()
                ));
            }

            for (LabResult labResult : labResults) {
                clinicalActivity.add(Map.of(
                        "title", labResult.getTestName(),
                        "description", patient.getFullName() + " — result: " + labResult.getResult(),
                        "time", labResult.getTestedOn() == null ? "" : labResult.getTestedOn().toString(),
                        "status", "LAB RESULT"
                ));
            }

            List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patient.getId());
            for (MedicalRecord record : records) {
                clinicalActivity.add(Map.of(
                        "title", "Review — " + record.getDiagnosis(),
                        "description", patient.getFullName() + (record.getNotes() == null ? "" : ": " + record.getNotes()),
                        "time", record.getRecordDate() == null ? "" : record.getRecordDate().toString(),
                        "status", "RECORD"
                ));
            }

            patientSummary.add(Map.of(
                    "name", patient.getFullName(),
                    "diabetesType", "Not specified",
                    "lastReading", latest == null ? "No data" : formatReading(latest.getReading()),
                    "riskLevel", riskLevel
            ));
        }

        clinicalActivity.sort(Comparator.comparing((Map<String, Object> m) -> String.valueOf(m.get("time"))).reversed());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("assignedPatients", patients.size());
        stats.put("todaysAppointments", todaysAppointments);
        stats.put("recentGlucoseAlerts", recentGlucoseAlerts);
        stats.put("aiRiskAlerts", aiRiskAlerts);
        stats.put("recentLabResults", recentLabResults);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("glucoseTrend", buildTrend(readingsByDay));
        data.put("assignedPatientSummary", patientSummary);
        data.put("recentClinicalActivity", clinicalActivity.stream().limit(8).toList());
        data.put("aiRiskAlertsList", riskAlerts.stream().limit(8).toList());
        return data;
    }

    public Map<String, Object> getNurseDashboard(String principalName) {
        List<Patient> patients = resolveScopedPatients(principalName, this::resolveNurse,
                nurse -> patientRepository.findByNurseId(nurse.getId()));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        int todaysAppointments = 0;
        int activeMedications = 0;
        int missedMedicationAlerts = 0;
        int abnormalReadings = 0;

        List<Map<String, Object>> careTasks = new ArrayList<>();
        List<Map<String, Object>> nursingActivity = new ArrayList<>();
        List<Map<String, Object>> readingAlerts = new ArrayList<>();
        Map<LocalDate, List<Double>> readingsByDay = new LinkedHashMap<>();

        for (Patient patient : patients) {
            List<GlucoseReading> readings = glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patient.getId());
            GlucoseReading latest = readings.isEmpty() ? null : readings.get(readings.size() - 1);
            boolean patientAbnormal = latest != null && latest.getMeasuredAt() != null
                    && latest.getMeasuredAt().isAfter(sevenDaysAgo)
                    && (latest.getReading() < HYPOGLYCEMIA_THRESHOLD || latest.getReading() > HYPERGLYCEMIA_THRESHOLD);
            if (patientAbnormal) {
                abnormalReadings++;
            }

            for (GlucoseReading reading : readings) {
                if (reading.getMeasuredAt() != null && reading.getMeasuredAt().isAfter(sevenDaysAgo)) {
                    readingsByDay.computeIfAbsent(reading.getMeasuredAt().toLocalDate(), d -> new ArrayList<>())
                            .add(reading.getReading());
                }
            }

            List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId());
            todaysAppointments += (int) appointments.stream()
                    .filter(a -> a.getScheduledAt() != null && !a.getScheduledAt().isBefore(todayStart) && a.getScheduledAt().isBefore(todayEnd))
                    .count();

            List<Medication> medications = medicationRepository.findByPatientId(patient.getId());
            activeMedications += (int) medications.stream()
                    .filter(m -> m.getEndDate() == null || !m.getEndDate().isBefore(LocalDate.now()))
                    .count();
            missedMedicationAlerts += (int) medications.stream()
                    .filter(m -> "MISSED".equalsIgnoreCase(m.getAdherenceStatus()))
                    .count();

            List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
            for (Alert alert : alerts.stream().limit(2).toList()) {
                readingAlerts.add(Map.of(
                        "title", alert.getTitle(),
                        "message", alert.getMessage(),
                        "level", "INFO",
                        "time", alert.getCreatedAt() == null ? "" : alert.getCreatedAt().toString()
                ));
            }

            if (latest != null) {
                nursingActivity.add(Map.of(
                        "title", "Glucose reading — " + patient.getFullName(),
                        "description", formatReading(latest.getReading()) + (patientAbnormal ? " (abnormal, needs follow-up)" : ""),
                        "time", latest.getMeasuredAt() == null ? "" : latest.getMeasuredAt().toString(),
                        "status", patientAbnormal ? "ABNORMAL" : "NORMAL"
                ));
            }

            if (patientAbnormal) {
                careTasks.add(Map.of(
                        "patientName", patient.getFullName(),
                        "task", "Follow up on abnormal glucose reading",
                        "time", latest.getMeasuredAt() == null ? "" : latest.getMeasuredAt().toString(),
                        "status", "PENDING"
                ));
            }
        }

        nursingActivity.sort(Comparator.comparing((Map<String, Object> m) -> String.valueOf(m.get("time"))).reversed());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("assignedPatients", patients.size());
        stats.put("todaysAppointments", todaysAppointments);
        stats.put("activeMedications", activeMedications);
        stats.put("missedMedicationAlerts", missedMedicationAlerts);
        stats.put("abnormalReadings", abnormalReadings);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("glucoseMonitoringTrend", buildTrend(readingsByDay));
        data.put("careTasks", careTasks);
        data.put("recentCareActivity", nursingActivity.stream().limit(8).toList());
        data.put("abnormalReadingAlerts", readingAlerts.stream().limit(8).toList());
        return data;
    }

    public Map<String, Object> getCaregiverDashboard(String principalName) {
        List<Patient> patients = resolveScopedPatients(principalName, this::resolveCaregiver,
                caregiver -> patientRepository.findByCaregiverId(caregiver.getId()));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime nextWeek = now.plusDays(7);

        int medicationReminders = 0;
        int appointmentReminders = 0;
        int careNotes = 0;
        int abnormalAlerts = 0;
        int emergencyAlerts = 0;

        List<Map<String, Object>> patientSummary = new ArrayList<>();
        List<Map<String, Object>> notes = new ArrayList<>();
        List<Map<String, Object>> caregiverAlerts = new ArrayList<>();
        Map<LocalDate, List<Double>> completionByDay = new LinkedHashMap<>();

        for (Patient patient : patients) {
            List<Medication> medications = medicationRepository.findByPatientId(patient.getId());
            medicationReminders += (int) medications.stream()
                    .filter(m -> m.getEndDate() == null || !m.getEndDate().isBefore(LocalDate.now()))
                    .count();
            long takenCount = medications.stream().filter(m -> "TAKEN".equalsIgnoreCase(m.getAdherenceStatus())).count();
            if (!medications.isEmpty()) {
                double rate = (takenCount * 100.0) / medications.size();
                completionByDay.computeIfAbsent(LocalDate.now(), d -> new ArrayList<>()).add(rate);
            }

            List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId());
            appointmentReminders += (int) appointments.stream()
                    .filter(a -> a.getScheduledAt() != null && a.getScheduledAt().isAfter(now) && a.getScheduledAt().isBefore(nextWeek))
                    .count();
            Appointment nextAppointment = appointments.stream()
                    .filter(a -> a.getScheduledAt() != null && a.getScheduledAt().isAfter(now))
                    .min(Comparator.comparing(Appointment::getScheduledAt))
                    .orElse(null);

            List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patient.getId());
            careNotes += records.size();
            for (MedicalRecord record : records) {
                notes.add(Map.of(
                        "patientName", patient.getFullName(),
                        "title", "Care note — " + patient.getFullName(),
                        "description", record.getNotes() == null ? record.getDiagnosis() : record.getNotes(),
                        "time", record.getRecordDate() == null ? "" : record.getRecordDate().toString()
                ));
            }

            List<GlucoseReading> readings = glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patient.getId());
            GlucoseReading latest = readings.isEmpty() ? null : readings.get(readings.size() - 1);
            if (latest != null && latest.getMeasuredAt() != null && latest.getMeasuredAt().isAfter(sevenDaysAgo)
                    && (latest.getReading() < HYPOGLYCEMIA_THRESHOLD || latest.getReading() > HYPERGLYCEMIA_THRESHOLD)) {
                abnormalAlerts++;
                if (latest.getReading() < 54 || latest.getReading() > 300) {
                    emergencyAlerts++;
                }
            }

            List<Alert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
            for (Alert alert : alerts.stream().limit(2).toList()) {
                caregiverAlerts.add(Map.of(
                        "title", alert.getTitle(),
                        "message", alert.getMessage(),
                        "level", "INFO",
                        "time", alert.getCreatedAt() == null ? "" : alert.getCreatedAt().toString()
                ));
            }

            patientSummary.add(Map.of(
                    "id", patient.getId(),
                    "patientName", patient.getFullName(),
                    "nextReminder", medications.isEmpty() ? "None" : medications.get(0).getMedicationName(),
                    "nextAppointment", nextAppointment == null ? "" : nextAppointment.getScheduledAt().toString()
            ));
        }

        notes.sort(Comparator.comparing((Map<String, Object> m) -> String.valueOf(m.get("time"))).reversed());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("assignedPatients", patients.size());
        stats.put("medicationReminders", medicationReminders);
        stats.put("appointmentReminders", appointmentReminders);
        stats.put("careNotes", careNotes);
        stats.put("abnormalAlerts", abnormalAlerts);
        stats.put("emergencyAlerts", emergencyAlerts);

        List<Map<String, Object>> trend = buildTrend(completionByDay);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("assignedPatientSummary", patientSummary);
        data.put("reminderCompletionTrend", trend);
        data.put("careNotesList", notes.stream().limit(8).toList());
        data.put("caregiverAlerts", caregiverAlerts.stream().limit(8).toList());
        return data;
    }

    public Map<String, Object> getAdminDashboard() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDate sevenDaysAgoDate = sevenDaysAgo.toLocalDate();

        List<Map<String, Object>> activity = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            if (user.getCreatedAt() != null && user.getCreatedAt().isAfter(sevenDaysAgo)) {
                activity.add(Map.of(
                        "title", "New " + user.getRole().toLowerCase() + " account",
                        "description", user.getUsername() + " (" + user.getEmail() + ")",
                        "time", user.getCreatedAt().toString(),
                        "status", "USER"
                ));
            }
        }
        for (Report report : reportRepository.findAll()) {
            if (report.getGeneratedOn() != null && !report.getGeneratedOn().isBefore(sevenDaysAgoDate)) {
                activity.add(Map.of(
                        "title", "Report generated — " + report.getTitle(),
                        "description", report.getPatient() != null ? report.getPatient().getFullName() : "System report",
                        "time", report.getGeneratedOn().toString(),
                        "status", "REPORT"
                ));
            }
        }
        activity.sort(Comparator.comparing((Map<String, Object> m) -> String.valueOf(m.get("time"))).reversed());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalNurses", nurseRepository.count());
        stats.put("totalCaregivers", caregiverRepository.count());
        stats.put("totalReports", reportRepository.count());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("userSignupTrend", buildSignupTrend());
        data.put("recentSystemActivity", activity.stream().limit(8).toList());
        return data;
    }

    private List<Map<String, Object>> buildSignupTrend() {
        Map<LocalDate, Long> countsByDay = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDate(), Collectors.counting()));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long count = countsByDay.getOrDefault(day, 0L);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            trend.add(Map.of("label", label, "value", count));
        }
        return trend;
    }

    private Doctor resolveDoctor(String principalName) {
        User user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principalName));
        return doctorRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No doctor profile is linked to this account."));
    }

    private java.util.Optional<auca.ac.rw.diabetesmonitoring.model.Nurse> resolveNurse(String principalName) {
        return userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .flatMap(user -> nurseRepository.findByEmail(user.getEmail()));
    }

    private java.util.Optional<auca.ac.rw.diabetesmonitoring.model.Caregiver> resolveCaregiver(String principalName) {
        return userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .flatMap(user -> caregiverRepository.findByEmail(user.getEmail()));
    }

    /**
     * Scopes the dashboard to the staff member's assigned patients when a linked profile
     * exists and has at least one assignment; otherwise falls back to all patients, so
     * accounts without assignments yet (or predating the assignment feature) still see data.
     */
    private <T> List<Patient> resolveScopedPatients(String principalName,
                                                      java.util.function.Function<String, java.util.Optional<T>> resolveProfile,
                                                      java.util.function.Function<T, List<Patient>> findAssigned) {
        return resolveProfile.apply(principalName)
                .map(profile -> {
                    List<Patient> assigned = findAssigned.apply(profile);
                    return assigned.isEmpty() ? patientRepository.findAll() : assigned;
                })
                .orElseGet(patientRepository::findAll);
    }

    private String toDisplayRiskLevel(String riskCategory) {
        if (riskCategory == null) {
            return "No data";
        }
        if (riskCategory.startsWith("EMERGENCY")) {
            return "CRITICAL";
        }
        if (riskCategory.startsWith("HIGH")) {
            return "HIGH";
        }
        if (riskCategory.startsWith("MODERATE")) {
            return "MODERATE";
        }
        return "NORMAL";
    }

    private String formatReading(Double reading) {
        return reading == null ? "No data" : (reading + " mg/dL");
    }

    private List<Map<String, Object>> buildTrend(Map<LocalDate, List<Double>> readingsByDay) {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            List<Double> values = readingsByDay.getOrDefault(day, List.of());
            double average = values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            trend.add(Map.of("label", label, "value", Math.round(average * 10.0) / 10.0));
        }
        return trend;
    }
}
