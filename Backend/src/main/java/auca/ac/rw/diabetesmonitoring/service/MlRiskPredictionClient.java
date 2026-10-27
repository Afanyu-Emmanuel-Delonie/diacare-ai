package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.MlPredictionResponseDto;
import auca.ac.rw.diabetesmonitoring.dto.RiskPredictionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Calls the Python ML risk-prediction service for a learned classification. Any failure
 * (service down, timeout, bad response) returns empty so the caller can fall back to the
 * deterministic rule-based RiskPredictionService - the ML path is an enhancement, never
 * a hard dependency for a safety-relevant feature.
 */
@Service
public class MlRiskPredictionClient {

    private static final Logger log = LoggerFactory.getLogger(MlRiskPredictionClient.class);

    private final RestClient restClient;

    public MlRiskPredictionClient(RestClient.Builder restClientBuilder,
                                   @Value("${ml.risk-service.url:http://127.0.0.1:8001}") String mlServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(mlServiceUrl).build();
    }

    public Optional<RiskPredictionResult> predict(Double currentReading, LocalDateTime measuredAt,
                                                    List<Double> recentReadings, boolean medicationAdherenceMissed,
                                                    Double hba1cResult) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("currentReading", currentReading);
            payload.put("measuredAt", measuredAt != null ? measuredAt.toString() : null);
            payload.put("recentReadings", recentReadings != null ? recentReadings : List.of());
            payload.put("medicationAdherenceMissed", medicationAdherenceMissed);
            payload.put("hba1cResult", hba1cResult);

            MlPredictionResponseDto response = restClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(MlPredictionResponseDto.class);

            if (response == null || response.getRiskCategory() == null) {
                return Optional.empty();
            }

            List<String> signals = response.getTriggeredSignals() != null ? response.getTriggeredSignals() : List.of();
            String alertMessage = RiskPredictionService.buildAlertMessage(response.getRiskCategory(), signals);
            return Optional.of(new RiskPredictionResult(response.getRiskCategory(), signals, alertMessage));
        } catch (RestClientException ex) {
            log.warn("ML risk-prediction service unavailable, falling back to rule-based classifier: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
