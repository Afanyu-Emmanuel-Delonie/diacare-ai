package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.MedicationRequestDto;
import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.model.Patient;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import auca.ac.rw.diabetesmonitoring.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicationServiceTest {

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private MedicationService medicationService;

    @Test
    void storesDoctorPrescribedDoseAndAdherenceTracking() {
        MedicationRequestDto request = new MedicationRequestDto();
        request.setPatientId(1L);
        request.setMedicationName("Metformin");
        request.setMedicationClass("Biguanide");
        request.setPurpose("Glucose control");
        request.setSuitableDiabetesType("Type 2");
        request.setTypicalTiming("With meals");
        request.setHowToUseGeneralInfo("Follow the care plan and keep the prescribed instructions");
        request.setCommonSideEffects("Nausea, stomach upset");
        request.setStorageInstructions("Store in a cool dry place");
        request.setMissedDoseGuidance("Contact your healthcare provider if you are unsure what to do");
        request.setWarnings("Do not change the prescribed dose without medical advice");
        request.setDoctorPrescribedDose("500 mg twice daily");
        request.setReminderSchedule("Morning and evening");
        request.setAdherenceStatus("ON_TRACK");
        request.setStartDate(LocalDate.now());

        Patient patient = new Patient();
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(medicationRepository.save(any(Medication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Medication saved = medicationService.create(request);

        assertEquals("500 mg twice daily", saved.getDoctorPrescribedDose());
        assertEquals("ON_TRACK", saved.getAdherenceStatus());
        assertEquals("Morning and evening", saved.getReminderSchedule());
        verify(medicationRepository).save(any(Medication.class));
    }
}
