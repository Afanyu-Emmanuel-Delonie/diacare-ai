package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RiskPredictionService {

    public RiskPredictionResult analyzeRisk(Double currentReading, LocalDateTime measuredAt,
                                            List<Double> recentReadings, boolean medicationAdherenceMissed,
                                            Double hba1cResult) {
        List<String> signals = new ArrayList<>();

        if (currentReading == null) {
            return new RiskPredictionResult("LOW_RISK", List.of(), "No glucose reading was provided.");
        }

        boolean hypoglycemia = currentReading < 70;
        boolean hyperglycemia = currentReading > 180;
        boolean severeHypoglycemia = currentReading < 54;
        boolean severeHyperglycemia = currentReading > 250;

        if (severeHypoglycemia) {
            signals.add("Possible hypoglycemia");
        } else if (hypoglycemia) {
            signals.add("Possible hypoglycemia");
        }

        if (severeHyperglycemia) {
            signals.add("Possible hyperglycemia");
        } else if (hyperglycemia) {
            signals.add("Possible hyperglycemia");
        }

        if (recentReadings != null && recentReadings.stream().anyMatch(value -> value < 70 || value > 180)) {
            long abnormalCount = recentReadings.stream().filter(value -> value < 70 || value > 180).count();
            if (abnormalCount >= 2) {
                signals.add("Repeated abnormal readings");
            }
        }

        if (medicationAdherenceMissed) {
            signals.add("Missed medication risk");
        }

        if (hba1cResult != null && hba1cResult >= 8.0) {
            signals.add("Elevated HbA1c result");
        }

        String riskCategory = classifyRisk(currentReading, signals, measuredAt);
        String alertMessage = buildAlertMessage(riskCategory, signals);

        return new RiskPredictionResult(riskCategory, signals, alertMessage);
    }

    private String classifyRisk(Double currentReading, List<String> signals, LocalDateTime measuredAt) {
        boolean isNightTime = measuredAt != null && (measuredAt.getHour() < 6 || measuredAt.getHour() > 22);

        if (currentReading != null && currentReading < 54) {
            return "EMERGENCY_RISK";
        }
        if (currentReading != null && currentReading > 300) {
            return "EMERGENCY_RISK";
        }
        if (signals.contains("Possible hypoglycemia") && isNightTime) {
            return "HIGH_RISK";
        }
        if (signals.contains("Possible hypoglycemia") && signals.contains("Missed medication risk")) {
            return "HIGH_RISK";
        }
        if (signals.contains("Possible hyperglycemia") && signals.contains("Repeated abnormal readings")) {
            return "HIGH_RISK";
        }
        // Any detected signal means the reading is not "normal" - never classify a flagged
        // reading as LOW_RISK, or the guidance text below contradicts the signal itself.
        if (signals.size() >= 2) {
            return "HIGH_RISK";
        }
        if (signals.size() == 1) {
            return "MODERATE_RISK";
        }
        return "LOW_RISK";
    }

    private String buildAlertMessage(String riskCategory, List<String> signals) {
        StringBuilder message = new StringBuilder();
        if ("EMERGENCY_RISK".equals(riskCategory)) {
            message.append("This reading is outside the normal range and may require urgent medical attention. ");
        } else if ("HIGH_RISK".equals(riskCategory)) {
            message.append("Your reading is outside the normal range and may indicate a higher level of concern. ");
        } else if ("MODERATE_RISK".equals(riskCategory)) {
            message.append("Your reading is outside the normal range. ");
        } else {
            message.append("Your reading is within a normal range. ");
        }

        if (!signals.isEmpty()) {
            message.append("Please follow your healthcare provider's advice or contact a medical professional.");
        }

        return message.toString();
    }
}
