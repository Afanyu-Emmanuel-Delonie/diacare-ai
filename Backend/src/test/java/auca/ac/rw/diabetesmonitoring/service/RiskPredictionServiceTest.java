package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RiskPredictionServiceTest {

    private final RiskPredictionService service = new RiskPredictionService();

    @Test
    void returnsEmergencyRiskForSevereHypoglycemia() {
        RiskPredictionResult result = service.analyzeRisk(
                45.0,
                LocalDateTime.of(2026, 7, 4, 6, 0),
                List.of(80.0, 90.0),
                false,
                null
        );

        assertEquals("EMERGENCY_RISK", result.getRiskCategory());
        assertTrue(result.getTriggeredSignals().contains("Possible hypoglycemia"));
        assertTrue(result.getAlertMessage().contains("medical professional"));
    }

    @Test
    void returnsHighRiskForRepeatedHyperglycemia() {
        RiskPredictionResult result = service.analyzeRisk(
                220.0,
                LocalDateTime.of(2026, 7, 4, 20, 15),
                List.of(210.0, 230.0),
                false,
                9.6
        );

        assertEquals("HIGH_RISK", result.getRiskCategory());
        assertTrue(result.getTriggeredSignals().contains("Possible hyperglycemia"));
        assertTrue(result.getTriggeredSignals().contains("Repeated abnormal readings"));
    }
}
