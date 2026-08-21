package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.model.Medication;
import auca.ac.rw.diabetesmonitoring.repository.MedicationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicationServiceTest {

    @Mock
    private MedicationRepository medicationRepository;

    @InjectMocks
    private MedicationService medicationService;

    @Test
    void storesDoctorPrescribedDoseAndAdherenceTracking() {
        Medication medication = new Medication();
        medication.setMedicationName("Metformin");
        medication.setMedicationClass("Biguanide");
        medication.setPurpose("Glucose control");
        medication.setSuitableDiabetesType("Type 2");
        medication.setTypicalTiming("With meals");
        medication.setHowToUseGeneralInfo("Follow the care plan and keep the prescribed instructions");
        medication.setCommonSideEffects("Nausea, stomach upset");
        medication.setStorageInstructions("Store in a cool dry place");
        medication.setMissedDoseGuidance("Contact your healthcare provider if you are unsure what to do");
        medication.setWarnings("Do not change the prescribed dose without medical advice");
        medication.setDoctorPrescribedDose("500 mg twice daily");
        medication.setReminderSchedule("Morning and evening");
        medication.setAdherenceStatus("ON_TRACK");
        medication.setStartDate(LocalDate.now());

        when(medicationRepository.save(any(Medication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Medication saved = medicationService.create(medication);

        assertEquals("500 mg twice daily", saved.getDoctorPrescribedDose());
        assertEquals("ON_TRACK", saved.getAdherenceStatus());
        assertEquals("Morning and evening", saved.getReminderSchedule());
        verify(medicationRepository).save(any(Medication.class));
    }
}
