package auca.ac.rw.diabetesmonitoring.dto;

import java.util.ArrayList;
import java.util.List;

public class RiskPredictionResult {

    private final String riskCategory;
    private final List<String> triggeredSignals;
    private final String alertMessage;

    public RiskPredictionResult(String riskCategory, List<String> triggeredSignals, String alertMessage) {
        this.riskCategory = riskCategory;
        this.triggeredSignals = new ArrayList<>(triggeredSignals);
        this.alertMessage = alertMessage;
    }

    public String getRiskCategory() {
        return riskCategory;
    }

    public List<String> getTriggeredSignals() {
        return triggeredSignals;
    }

    public String getAlertMessage() {
        return alertMessage;
    }
}
