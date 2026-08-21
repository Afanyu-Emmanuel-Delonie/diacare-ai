package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.model.LabResult;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.AlertRepository;
import auca.ac.rw.diabetesmonitoring.repository.AppointmentRepository;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import auca.ac.rw.diabetesmonitoring.repository.LabResultRepository;
import auca.ac.rw.diabetesmonitoring.repository.MedicalRecordRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
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
    private final RiskPredictionService riskPredictionService;

    public DashboardService(UserRepository userRepository, DoctorRepository doctorRepository,
                             PatientRepository patientRepository, AppointmentRepository appointmentRepository,
                             GlucoseReadingRepository glucoseReadingRepository, AlertRepository alertRepository,
                             LabResultRepository labResultRepository, MedicalRecordRepository medicalRecordRepository,
                             RiskPredictionService riskPredictionService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.alertRepository = alertRepository;
        this.labResultRepository = labResultRepository;
        this.medicalRecordRepository = medicalRecordRepository;
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

    private Doctor resolveDoctor(String principalName) {
        User user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmail(principalName))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principalName));
        return doctorRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No doctor profile is linked to this account."));
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
