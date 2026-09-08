package auca.ac.rw.diabetesmonitoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "glucose_readings", indexes = @Index(name = "idx_glucose_readings_patient_id", columnList = "patient_id"))
public class GlucoseReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(40)
    @Max(500)
    @Column(nullable = false)
    private Double reading;

    @NotNull
    private LocalDateTime measuredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Patient patient;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Double getReading() { return reading; }
    public void setReading(Double reading) { this.reading = reading; }
    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
