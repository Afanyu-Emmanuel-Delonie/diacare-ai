package auca.ac.rw.diabetesmonitoring.dto;

import java.util.List;
import java.util.Map;

public class MlPredictionResponseDto {

    private String riskCategory;
    private List<String> triggeredSignals;
    private Double confidence;
    private Map<String, Double> probabilities;

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }
    public List<String> getTriggeredSignals() { return triggeredSignals; }
    public void setTriggeredSignals(List<String> triggeredSignals) { this.triggeredSignals = triggeredSignals; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public Map<String, Double> getProbabilities() { return probabilities; }
    public void setProbabilities(Map<String, Double> probabilities) { this.probabilities = probabilities; }
}
