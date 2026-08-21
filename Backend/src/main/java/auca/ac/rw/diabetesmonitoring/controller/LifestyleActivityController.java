package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.LifestyleActivity;
import auca.ac.rw.diabetesmonitoring.repository.LifestyleActivityRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lifestyle-activities")
@CrossOrigin(origins = "*")
public class LifestyleActivityController {

    private final LifestyleActivityRepository lifestyleActivityRepository;

    public LifestyleActivityController(LifestyleActivityRepository lifestyleActivityRepository) {
        this.lifestyleActivityRepository = lifestyleActivityRepository;
    }

    @GetMapping
    public ResponseEntity<List<LifestyleActivity>> getAllLifestyleActivities() {
        return ResponseEntity.ok(lifestyleActivityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LifestyleActivity> getLifestyleActivityById(@PathVariable Long id) {
        return lifestyleActivityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LifestyleActivity> createLifestyleActivity(@Valid @RequestBody LifestyleActivity activity) {
        return new ResponseEntity<>(lifestyleActivityRepository.save(activity), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LifestyleActivity> updateLifestyleActivity(@PathVariable Long id, @Valid @RequestBody LifestyleActivity updatedActivity) {
        return lifestyleActivityRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedActivity, existing, "id");
                    return ResponseEntity.ok(lifestyleActivityRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLifestyleActivity(@PathVariable Long id) {
        return lifestyleActivityRepository.findById(id)
                .map(existing -> {
                    lifestyleActivityRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
