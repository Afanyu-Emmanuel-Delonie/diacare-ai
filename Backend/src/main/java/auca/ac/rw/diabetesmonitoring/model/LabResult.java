package auca.ac.rw.diabetesmonitoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "lab_results")
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String testName;

    @NotBlank
    private String result;

    @NotNull
    private LocalDate testedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Patient patient;

    public Long getId() { return id; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public LocalDate getTestedOn() { return testedOn; }
    public void setTestedOn(LocalDate testedOn) { this.testedOn = testedOn; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
}
