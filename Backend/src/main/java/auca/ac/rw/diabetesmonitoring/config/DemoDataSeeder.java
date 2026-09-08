package auca.ac.rw.diabetesmonitoring.config;

import auca.ac.rw.diabetesmonitoring.model.Alert;
import auca.ac.rw.diabetesmonitoring.model.Appointment;
import auca.ac.rw.diabetesmonitoring.model.Caregiver;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.model.LabResult;
import auca.ac.rw.diabetesmonitoring.model.MedicalRecord;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.model.Nurse;
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
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Seeds a realistic demo dataset - several doctors, nurses, caregivers, and a full
 * roster of patients with varied glucose history, medications, appointments, records,
 * lab results, alerts, and reports - so every dashboard and list page has data to show.
 *
 * Only runs when app.demo-data.enabled=true (defaults to false; must be explicitly
 * opted into for any non-local environment, since it creates accounts with a known
 * password).
 */
@Component
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true", matchIfMissing = false)
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Demo@1234";
    private final Random random = new Random(42);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final CaregiverRepository caregiverRepository;
    private final PatientRepository patientRepository;
    private final GlucoseReadingRepository glucoseReadingRepository;
    private final AppointmentRepository appointmentRepository;
    private final AlertRepository alertRepository;
    private final LabResultRepository labResultRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicationRepository medicationRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository, DoctorRepository doctorRepository,
                           NurseRepository nurseRepository, CaregiverRepository caregiverRepository,
                           PatientRepository patientRepository, GlucoseReadingRepository glucoseReadingRepository,
                           AppointmentRepository appointmentRepository, AlertRepository alertRepository,
                           LabResultRepository labResultRepository, MedicalRecordRepository medicalRecordRepository,
                           MedicationRepository medicationRepository, ReportRepository reportRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.nurseRepository = nurseRepository;
        this.caregiverRepository = caregiverRepository;
        this.patientRepository = patientRepository;
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.appointmentRepository = appointmentRepository;
        this.alertRepository = alertRepository;
        this.labResultRepository = labResultRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicationRepository = medicationRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin.demo", "admin@diabetesmonitoring.rw", "ADMIN");

        Doctor doctor1 = seedDoctor("Dr. Aline Uwase", "doctor@diabetesmonitoring.rw", "Endocrinology");
        seedUser("doctor.demo", doctor1.getEmail(), "DOCTOR");
        Doctor doctor2 = seedDoctor("Dr. Eric Nshimiyimana", "e.nshimiyimana@diabetesmonitoring.rw", "Internal Medicine");
        seedUser("doctor.nshimiyimana", doctor2.getEmail(), "DOCTOR");
        Doctor doctor3 = seedDoctor("Dr. Solange Mukashema", "s.mukashema@diabetesmonitoring.rw", "Endocrinology");
        seedUser("doctor.mukashema", doctor3.getEmail(), "DOCTOR");
        List<Doctor> doctors = List.of(doctor1, doctor2, doctor3);

        Nurse nurse1 = seedNurse("Nurse Demo", "nurse@diabetesmonitoring.rw", "General");
        seedUser("nurse.demo", nurse1.getEmail(), "NURSE");
        Nurse nurse2 = seedNurse("Alice Keza", "a.keza@diabetesmonitoring.rw", "Diabetes Care");
        seedUser("nurse.keza", nurse2.getEmail(), "NURSE");
        List<Nurse> nurses = List.of(nurse1, nurse2);

        Caregiver caregiver1 = seedCaregiver("Caregiver Demo", "caregiver@diabetesmonitoring.rw", "Family");
        seedUser("caregiver.demo", caregiver1.getEmail(), "CAREGIVER");
        Caregiver caregiver2 = seedCaregiver("David Nzeyimana", "d.nzeyimana@diabetesmonitoring.rw", "Family");
        seedUser("caregiver.nzeyimana", caregiver2.getEmail(), "CAREGIVER");
        List<Caregiver> caregivers = List.of(caregiver1, caregiver2);

        // Patient roster: name, email, dob, diabetesType, gender, doctorIndex, nurseIndex(-1=none), caregiverIndex(-1=none)
        Object[][] roster = {
                {"Jean Mugisha", "patient@diabetesmonitoring.rw", LocalDate.of(1990, 1, 1), "TYPE_2", "MALE", 0, 0, 0},
                {"Alice Uwimana", "a.uwimana@example.rw", LocalDate.of(1985, 4, 12), "TYPE_1", "FEMALE", 0, 0, -1},
                {"Eric Ndayisenga", "e.ndayisenga@example.rw", LocalDate.of(1972, 8, 23), "TYPE_2", "MALE", 0, -1, 1},
                {"Grace Mukamana", "g.mukamana@example.rw", LocalDate.of(1995, 11, 3), "GESTATIONAL", "FEMALE", 1, 1, -1},
                {"Patrick Habimana", "p.habimana@example.rw", LocalDate.of(1968, 2, 17), "TYPE_2", "MALE", 1, -1, -1},
                {"Diane Ingabire", "d.ingabire@example.rw", LocalDate.of(1978, 6, 30), "TYPE_1", "FEMALE", 1, 1, 1},
                {"Emmanuel Nkurunziza", "e.nkurunziza@example.rw", LocalDate.of(1960, 9, 9), "TYPE_2", "MALE", 2, -1, -1},
                {"Claudine Umutoni", "c.umutoni@example.rw", LocalDate.of(2000, 3, 21), "PREDIABETES", "FEMALE", 2, 0, -1},
                {"Francois Bizimana", "f.bizimana@example.rw", LocalDate.of(1955, 12, 5), "TYPE_2", "MALE", 0, -1, -1},
                {"Josiane Uwase", "j.uwase@example.rw", LocalDate.of(1988, 7, 14), "TYPE_1", "FEMALE", 1, -1, 0},
                {"Vincent Rugamba", "v.rugamba@example.rw", LocalDate.of(1975, 10, 27), "TYPE_2", "MALE", 2, 1, -1},
                {"Marie Claire Nyirahabimana", "mc.nyirahabimana@example.rw", LocalDate.of(1992, 5, 18), "GESTATIONAL", "FEMALE", 0, -1, 1},
        };

        for (Object[] row : roster) {
            String name = (String) row[0];
            String email = (String) row[1];
            LocalDate dob = (LocalDate) row[2];
            String diabetesType = (String) row[3];
            String gender = (String) row[4];
            Doctor assignedDoctor = doctors.get((int) row[5]);
            int nurseIdx = (int) row[6];
            int caregiverIdx = (int) row[7];

            Patient patient = seedPatient(name, email, dob, diabetesType, gender, assignedDoctor,
                    nurseIdx >= 0 ? nurses.get(nurseIdx) : null,
                    caregiverIdx >= 0 ? caregivers.get(caregiverIdx) : null);

            seedClinicalActivity(patient, assignedDoctor);
        }

        // The primary demo patient login is linked to the first roster entry.
        seedUser("patient.demo", "patient@diabetesmonitoring.rw", "PATIENT");
    }

    private void seedClinicalActivity(Patient patient, Doctor doctor) {
        if (!glucoseReadingRepository.findByPatientId(patient.getId()).isEmpty()) {
            return; // already seeded for this patient
        }

        LocalDateTime now = LocalDateTime.now();
        seedGlucoseReadings(patient, now);
        seedMedications(patient);
        seedAppointments(patient, doctor, now);
        seedAlerts(patient);
        seedLabResults(patient);
        seedMedicalRecords(patient, doctor);
        seedReport(patient);
    }

    private void seedGlucoseReadings(Patient patient, LocalDateTime now) {
        // 14 days of readings, twice a day, with some deliberately abnormal (hypo/hyperglycemia).
        double baseline = 90 + random.nextInt(60); // 90-150 baseline per patient
        for (int day = 13; day >= 0; day--) {
            for (int slot = 0; slot < 2; slot++) {
                double variance = (random.nextDouble() - 0.5) * 60;
                double value = baseline + variance;
                // Occasionally inject a clearly abnormal reading for realism.
                if (random.nextInt(10) == 0) {
                    value = random.nextBoolean() ? 45 + random.nextInt(15) : 260 + random.nextInt(80);
                }
                GlucoseReading reading = new GlucoseReading();
                reading.setReading(Math.round(value * 10.0) / 10.0);
                reading.setMeasuredAt(now.minusDays(day).withHour(slot == 0 ? 7 : 19).withMinute(0));
                reading.setPatient(patient);
                glucoseReadingRepository.save(reading);
            }
        }
    }

    private static final String[][] MEDICATION_CATALOG = {
            {"Metformin", "Biguanide", "500 mg twice daily", "With meals"},
            {"Insulin Glargine", "Long-acting insulin", "20 units at bedtime", "Once daily, evening"},
            {"Glipizide", "Sulfonylurea", "5 mg once daily", "Before breakfast"},
            {"Sitagliptin", "DPP-4 inhibitor", "100 mg once daily", "Any time of day"},
    };

    private void seedMedications(Patient patient) {
        int count = 1 + random.nextInt(2);
        for (int i = 0; i < count; i++) {
            String[] med = MEDICATION_CATALOG[random.nextInt(MEDICATION_CATALOG.length)];
            Medication medication = new Medication();
            medication.setMedicationName(med[0]);
            medication.setMedicationClass(med[1]);
            medication.setPurpose("Blood glucose management");
            medication.setSuitableDiabetesType(patient.getDiabetesType());
            medication.setTypicalTiming(med[3]);
            medication.setHowToUseGeneralInfo("Follow the care plan and keep the prescribed instructions.");
            medication.setCommonSideEffects("Nausea, mild stomach upset");
            medication.setStorageInstructions("Store in a cool, dry place away from direct sunlight.");
            medication.setMissedDoseGuidance("Take as soon as remembered; skip if close to the next dose.");
            medication.setWarnings("Do not change the prescribed dose without medical advice.");
            medication.setDoctorPrescribedDose(med[2]);
            medication.setReminderSchedule("Morning and evening");
            String[] statuses = {"TAKEN", "TAKEN", "PENDING", "MISSED"};
            medication.setAdherenceStatus(statuses[random.nextInt(statuses.length)]);
            medication.setStartDate(LocalDate.now().minusMonths(1 + random.nextInt(6)));
            if (random.nextInt(6) == 0) {
                medication.setEndDate(LocalDate.now().minusDays(random.nextInt(10)));
            }
            medication.setLastAdherenceUpdatedAt(LocalDateTime.now().minusDays(random.nextInt(3)));
            medication.setPatient(patient);
            medicationRepository.save(medication);
        }
    }

    private void seedAppointments(Patient patient, Doctor doctor, LocalDateTime now) {
        String[] types = {"Diabetes follow-up", "Routine checkup", "Medication review", "Lab result review"};
        String[] statuses = {"UPCOMING", "COMPLETED", "COMPLETED", "CANCELLED", "MISSED"};
        int count = 2 + random.nextInt(3);
        for (int i = 0; i < count; i++) {
            String status = statuses[random.nextInt(statuses.length)];
            LocalDateTime scheduledAt = "UPCOMING".equals(status)
                    ? now.plusDays(1 + random.nextInt(21)).withHour(9 + random.nextInt(8)).withMinute(0)
                    : now.minusDays(1 + random.nextInt(60)).withHour(9 + random.nextInt(8)).withMinute(0);

            Appointment appointment = new Appointment();
            appointment.setScheduledAt(scheduledAt);
            appointment.setStatus(status);
            appointment.setAppointmentType(types[random.nextInt(types.length)]);
            appointment.setLocation("Kigali Diabetes Clinic, Room " + (1 + random.nextInt(6)));
            appointment.setReason("Routine follow-up to review glucose trends and medication adherence.");
            if ("UPCOMING".equals(status)) {
                appointment.setReminderAt(scheduledAt.minusHours(1));
            }
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointmentRepository.save(appointment);
        }
    }

    private void seedAlerts(Patient patient) {
        if (random.nextInt(3) == 0) {
            return; // not every patient has an active alert
        }
        String[][] alerts = {
                {"Elevated glucose reading", "Latest reading was above the target range. Review recommended."},
                {"Missed medication dose", "A scheduled medication dose was not confirmed as taken."},
                {"Upcoming appointment reminder", "An appointment is scheduled within the next week."},
        };
        String[] chosen = alerts[random.nextInt(alerts.length)];
        Alert alert = new Alert();
        alert.setTitle(chosen[0]);
        alert.setMessage(chosen[1]);
        alert.setPatient(patient);
        alertRepository.save(alert);
    }

    private void seedLabResults(Patient patient) {
        LabResult hba1c = new LabResult();
        hba1c.setTestName("HbA1c");
        hba1c.setResult(String.format("%.1f%%", 5.5 + random.nextDouble() * 3.5));
        hba1c.setTestedOn(LocalDate.now().minusDays(2 + random.nextInt(30)));
        hba1c.setPatient(patient);
        labResultRepository.save(hba1c);

        LabResult lipid = new LabResult();
        lipid.setTestName("Lipid Panel");
        lipid.setResult("LDL " + (80 + random.nextInt(80)) + " mg/dL");
        lipid.setTestedOn(LocalDate.now().minusDays(10 + random.nextInt(60)));
        lipid.setPatient(patient);
        labResultRepository.save(lipid);
    }

    private void seedMedicalRecords(Patient patient, Doctor doctor) {
        String diagnosis = switch (patient.getDiabetesType()) {
            case "TYPE_1" -> "Type 1 diabetes — routine follow-up";
            case "GESTATIONAL" -> "Gestational diabetes — monitoring";
            case "PREDIABETES" -> "Prediabetes — lifestyle and monitoring plan";
            default -> "Type 2 diabetes — routine follow-up";
        };
        MedicalRecord record = new MedicalRecord();
        record.setDiagnosis(diagnosis);
        record.setNotes("Stable overall; continue current medication and monitoring schedule.");
        record.setPatient(patient);
        record.setDoctor(doctor);
        medicalRecordRepository.save(record);
    }

    private void seedReport(Patient patient) {
        Report report = new Report();
        report.setTitle("Monthly Health Summary — " + patient.getFullName());
        report.setContent("Automated monthly summary of glucose trends, medication adherence, and appointment history.");
        report.setGeneratedOn(LocalDate.now().minusDays(random.nextInt(20)));
        report.setPatient(patient);
        reportRepository.save(report);
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
        user.setActive(true);
        user.setDeleted(false);
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

    private Nurse seedNurse(String fullName, String email, String department) {
        return nurseRepository.findByEmail(email).orElseGet(() -> {
            Nurse nurse = new Nurse();
            nurse.setFullName(fullName);
            nurse.setEmail(email);
            nurse.setDepartment(department);
            return nurseRepository.save(nurse);
        });
    }

    private Caregiver seedCaregiver(String fullName, String email, String relationship) {
        return caregiverRepository.findByEmail(email).orElseGet(() -> {
            Caregiver caregiver = new Caregiver();
            caregiver.setFullName(fullName);
            caregiver.setEmail(email);
            caregiver.setRelationship(relationship);
            return caregiverRepository.save(caregiver);
        });
    }

    private Patient seedPatient(String fullName, String email, LocalDate dob, String diabetesType, String gender,
                                 Doctor doctor, Nurse nurse, Caregiver caregiver) {
        return patientRepository.findByEmail(email)
                .map(existing -> backfillPatient(existing, diabetesType, gender, doctor, nurse, caregiver))
                .orElseGet(() -> {
                    Patient patient = new Patient();
                    patient.setFullName(fullName);
                    patient.setEmail(email);
                    patient.setPhone(String.format("+2507%08d", Math.abs((fullName + email).hashCode()) % 100000000));
                    patient.setDateOfBirth(dob);
                    patient.setDiabetesType(diabetesType);
                    patient.setGender(gender);
                    patient.setAddress("Kigali, Rwanda");
                    patient.setEmergencyContactName(fullName.split(" ")[0] + "'s emergency contact");
                    patient.setEmergencyContactPhone(String.format("+2507%08d", Math.abs(email.hashCode()) % 100000000));
                    patient.setDiagnosisDate(LocalDate.now().minusYears(1 + random.nextInt(8)));
                    patient.setDoctor(doctor);
                    patient.setNurse(nurse);
                    patient.setCaregiver(caregiver);
                    patient.setUuid(UUID.randomUUID());
                    Patient saved = patientRepository.save(patient);
                    saved.setPatientCode(String.format("Dia%04d", saved.getId()));
                    return patientRepository.save(saved);
                });
    }

    private Patient backfillPatient(Patient patient, String diabetesType, String gender, Doctor doctor, Nurse nurse, Caregiver caregiver) {
        boolean changed = false;
        if (patient.getUuid() == null) { patient.setUuid(UUID.randomUUID()); changed = true; }
        if (patient.getPatientCode() == null) { patient.setPatientCode(String.format("Dia%04d", patient.getId())); changed = true; }
        if (patient.getDiabetesType() == null) { patient.setDiabetesType(diabetesType); changed = true; }
        if (patient.getGender() == null) { patient.setGender(gender); changed = true; }
        if (patient.getAddress() == null) { patient.setAddress("Kigali, Rwanda"); changed = true; }
        if (patient.getDiagnosisDate() == null) { patient.setDiagnosisDate(LocalDate.now().minusYears(2)); changed = true; }
        if (patient.getDoctor() == null) { patient.setDoctor(doctor); changed = true; }
        if (patient.getNurse() == null && nurse != null) { patient.setNurse(nurse); changed = true; }
        if (patient.getCaregiver() == null && caregiver != null) { patient.setCaregiver(caregiver); changed = true; }
        if (patient.getActive() == null) { patient.setActive(true); changed = true; }
        if (patient.getDeleted() == null) { patient.setDeleted(false); changed = true; }
        return changed ? patientRepository.save(patient) : patient;
    }
}
