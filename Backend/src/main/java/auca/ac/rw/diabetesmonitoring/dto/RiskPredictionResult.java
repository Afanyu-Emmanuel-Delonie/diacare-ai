package auca.ac.rw.diabetesmonitoring.dto;

import java.util.ArrayList;
import java.util.List;

public class RiskPredictionResult {

    private final String riskCategory;
    private final List<String> triggeredSignals;
    private final String alertMessage;
    private final String predictionSource;

    public RiskPredictionResult(String riskCategory, List<String> triggeredSignals, String alertMessage,
                                 String predictionSource) {
        this.riskCategory = riskCategory;
        this.triggeredSignals = new ArrayList<>(triggeredSignals);
        this.alertMessage = alertMessage;
        this.predictionSource = predictionSource;
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

    /** One of ML_MODEL, RULE_BASED, or SAFETY_FLOOR_OVERRIDE - which path actually produced this result. */
    public String getPredictionSource() {
        return predictionSource;
    }
}
