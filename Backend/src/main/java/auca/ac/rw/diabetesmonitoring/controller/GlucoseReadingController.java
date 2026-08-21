package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/glucose-readings")
@CrossOrigin(origins = "*")
public class GlucoseReadingController {

    private final GlucoseReadingRepository glucoseReadingRepository;

    public GlucoseReadingController(GlucoseReadingRepository glucoseReadingRepository) {
        this.glucoseReadingRepository = glucoseReadingRepository;
    }

    @GetMapping
    public ResponseEntity<List<GlucoseReading>> getAllGlucoseReadings() {
        return ResponseEntity.ok(glucoseReadingRepository.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<GlucoseReading>> getGlucoseReadingsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(glucoseReadingRepository.findByPatientIdOrderByMeasuredAtAsc(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GlucoseReading> getGlucoseReadingById(@PathVariable Long id) {
        return glucoseReadingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GlucoseReading> createGlucoseReading(@Valid @RequestBody GlucoseReading reading) {
        return new ResponseEntity<>(glucoseReadingRepository.save(reading), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GlucoseReading> updateGlucoseReading(@PathVariable Long id, @Valid @RequestBody GlucoseReading updatedReading) {
        return glucoseReadingRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedReading, existing, "id");
                    return ResponseEntity.ok(glucoseReadingRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGlucoseReading(@PathVariable Long id) {
        return glucoseReadingRepository.findById(id)
                .map(existing -> {
                    glucoseReadingRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
