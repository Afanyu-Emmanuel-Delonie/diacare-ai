package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.GlucoseReading;
import auca.ac.rw.diabetesmonitoring.repository.GlucoseReadingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GlucoseReadingService {

    private final GlucoseReadingRepository glucoseReadingRepository;

    public GlucoseReadingService(GlucoseReadingRepository glucoseReadingRepository) {
        this.glucoseReadingRepository = glucoseReadingRepository;
    }

    public GlucoseReading create(GlucoseReading reading) {
        validate(reading);
        return glucoseReadingRepository.save(reading);
    }

    public List<GlucoseReading> getAll() {
        return glucoseReadingRepository.findAll();
    }

    public GlucoseReading getById(Long id) {
        return glucoseReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Glucose reading not found with id: " + id));
    }

    public GlucoseReading update(Long id, GlucoseReading updatedReading) {
        GlucoseReading existing = getById(id);
        validate(updatedReading);
        existing.setReading(updatedReading.getReading());
        existing.setMeasuredAt(updatedReading.getMeasuredAt());
        return glucoseReadingRepository.save(existing);
    }

    public void delete(Long id) {
        GlucoseReading existing = getById(id);
        glucoseReadingRepository.delete(existing);
    }

    private void validate(GlucoseReading reading) {
        if (reading.getReading() == null || reading.getReading() < 40 || reading.getReading() > 500) {
            throw new IllegalArgumentException("Glucose reading must be between 40 and 500");
        }
        if (reading.getMeasuredAt() == null) {
            throw new IllegalArgumentException("Measurement time is required");
        }
    }
}
