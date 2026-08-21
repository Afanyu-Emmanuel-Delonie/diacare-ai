package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.LabResult;
import auca.ac.rw.diabetesmonitoring.repository.LabResultRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
@CrossOrigin(origins = "*")
public class LabResultController {

    private final LabResultRepository labResultRepository;

    public LabResultController(LabResultRepository labResultRepository) {
        this.labResultRepository = labResultRepository;
    }

    @GetMapping
    public ResponseEntity<List<LabResult>> getAllLabResults() {
        return ResponseEntity.ok(labResultRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResult> getLabResultById(@PathVariable Long id) {
        return labResultRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LabResult> createLabResult(@Valid @RequestBody LabResult labResult) {
        return new ResponseEntity<>(labResultRepository.save(labResult), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabResult> updateLabResult(@PathVariable Long id, @Valid @RequestBody LabResult updatedLabResult) {
        return labResultRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedLabResult, existing, "id");
                    return ResponseEntity.ok(labResultRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabResult(@PathVariable Long id) {
        return labResultRepository.findById(id)
                .map(existing -> {
                    labResultRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
