package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.LocalFoodGuide;
import auca.ac.rw.diabetesmonitoring.model.RecommendationLevel;
import auca.ac.rw.diabetesmonitoring.security.InputSanitizer;
import auca.ac.rw.diabetesmonitoring.service.LocalFoodGuideService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/local-food-guides")
public class LocalFoodGuideController {

    private final LocalFoodGuideService localFoodGuideService;

    public LocalFoodGuideController(LocalFoodGuideService localFoodGuideService) {
        this.localFoodGuideService = localFoodGuideService;
    }

    @GetMapping
    public ResponseEntity<List<LocalFoodGuide>> getAllFoodGuides() {
        return ResponseEntity.ok(localFoodGuideService.getAllFoodGuides());
    }

    @GetMapping("/guidance-note")
    public ResponseEntity<Map<String, String>> getGuidanceNote() {
        return ResponseEntity.ok(Map.of("note", LocalFoodGuideService.GENERAL_GUIDANCE_NOTE));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<LocalFoodGuide>> getFoodGuidesByCategory(@PathVariable String category) {
        String sanitizedCategory = InputSanitizer.cleanSearchToken(category, "Category", 50);
        return ResponseEntity.ok(localFoodGuideService.getFoodGuidesByCategory(sanitizedCategory));
    }

    @GetMapping("/recommendation-level/{recommendationLevel}")
    public ResponseEntity<List<LocalFoodGuide>> getFoodGuidesByRecommendationLevel(
            @PathVariable RecommendationLevel recommendationLevel) {
        return ResponseEntity.ok(localFoodGuideService.getFoodGuidesByRecommendationLevel(recommendationLevel));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalFoodGuide> getFoodGuideById(@PathVariable Long id) {
        return localFoodGuideService.getFoodGuideById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LocalFoodGuide> createFoodGuide(@Valid @RequestBody LocalFoodGuide foodGuide) {
        return new ResponseEntity<>(localFoodGuideService.createFoodGuide(foodGuide), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalFoodGuide> updateFoodGuide(@PathVariable Long id, @Valid @RequestBody LocalFoodGuide updatedFoodGuide) {
        return localFoodGuideService.updateFoodGuide(id, updatedFoodGuide)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodGuide(@PathVariable Long id) {
        if (localFoodGuideService.deleteFoodGuide(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
