package auca.ac.rw.diabetesmonitoring.config;

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
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Demo@1234";

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final GlucoseReadingRepository glucoseReadingRepository;
    private final AppointmentRepository appointmentRepository;
    private final AlertRepository alertRepository;
    private final LabResultRepository labResultRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository, DoctorRepository doctorRepository,
                           PatientRepository patientRepository, GlucoseReadingRepository glucoseReadingRepository,
                           AppointmentRepository appointmentRepository, AlertRepository alertRepository,
                           LabResultRepository labResultRepository, MedicalRecordRepository medicalRecordRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.appointmentRepository = appointmentRepository;
        this.alertRepository = alertRepository;
        this.labResultRepository = labResultRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin.demo", "admin@diabetesmonitoring.rw", "ADMIN");
        seedUser("nurse.demo", "nurse@diabetesmonitoring.rw", "NURSE");
        seedUser("caregiver.demo", "caregiver@diabetesmonitoring.rw", "CAREGIVER");

        Doctor doctor = seedDoctor("Dr. Aline Uwase", "doctor@diabetesmonitoring.rw", "Endocrinology");
        seedUser("doctor.demo", doctor.getEmail(), "DOCTOR");

        Patient patient = seedPatient("Jean Mugisha", "patient@diabetesmonitoring.rw", doctor);
        seedUser("patient.demo", patient.getEmail(), "PATIENT");

        seedClinicalActivity(patient, doctor);
    }

    private void seedClinicalActivity(Patient patient, Doctor doctor) {
        backfillMedicalRecordDoctor(patient, doctor);

        if (!glucoseReadingRepository.findByPatientId(patient.getId()).isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        double[] recentReadings = { 132, 148, 175, 96, 188, 110, 142 };
        for (int i = 0; i < recentReadings.length; i++) {
            GlucoseReading reading = new GlucoseReading();
            reading.setReading(recentReadings[i]);
            reading.setMeasuredAt(now.minusDays(recentReadings.length - 1 - i));
            reading.setPatient(patient);
            glucoseReadingRepository.save(reading);
        }

        Appointment appointment = new Appointment();
        appointment.setScheduledAt(now.withHour(14).withMinute(30));
        appointment.setStatus("SCHEDULED");
        appointment.setPatient(patient);
        appointmentRepository.save(appointment);

        Alert alert = new Alert();
        alert.setTitle("Elevated glucose reading");
        alert.setMessage("Latest reading was above the target range. Review recommended.");
        alert.setPatient(patient);
        alertRepository.save(alert);

        LabResult labResult = new LabResult();
        labResult.setTestName("HbA1c");
        labResult.setResult("7.1%");
        labResult.setTestedOn(LocalDate.now().minusDays(2));
        labResult.setPatient(patient);
        labResultRepository.save(labResult);

        MedicalRecord record = new MedicalRecord();
        record.setDiagnosis("Type 2 diabetes — routine follow-up");
        record.setNotes("Stable overall; continue current medication and monitoring schedule.");
        record.setPatient(patient);
        record.setDoctor(doctor);
        medicalRecordRepository.save(record);
    }

    private void backfillMedicalRecordDoctor(Patient patient, Doctor doctor) {
        for (MedicalRecord record : medicalRecordRepository.findByPatientId(patient.getId())) {
            if (record.getDoctor() == null) {
                record.setDoctor(doctor);
                medicalRecordRepository.save(record);
            }
        }
    }

    private void seedUser(String username, String email, String role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        user.setRole(role);
        userRepository.save(user);
    }

    private Doctor seedDoctor(String fullName, String email, String specialty) {
        return doctorRepository.findByEmail(email).orElseGet(() -> {
            Doctor doctor = new Doctor();
            doctor.setFullName(fullName);
            doctor.setEmail(email);
            doctor.setSpecialty(specialty);
            return doctorRepository.save(doctor);
        });
    }

    private Patient seedPatient(String fullName, String email, Doctor doctor) {
        return patientRepository.findByEmail(email)
                .map(this::backfillIdentifiers)
                .orElseGet(() -> {
                    Patient patient = new Patient();
                    patient.setFullName(fullName);
                    patient.setEmail(email);
                    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
                    patient.setDoctor(doctor);
                    return backfillIdentifiers(patientRepository.save(patient));
                });
    }

    private Patient backfillIdentifiers(Patient patient) {
        boolean changed = false;
        if (patient.getUuid() == null) {
            patient.setUuid(java.util.UUID.randomUUID());
            changed = true;
        }
        if (patient.getPatientCode() == null) {
            patient.setPatientCode(String.format("Dia%04d", patient.getId()));
            changed = true;
        }
        return changed ? patientRepository.save(patient) : patient;
    }
}
