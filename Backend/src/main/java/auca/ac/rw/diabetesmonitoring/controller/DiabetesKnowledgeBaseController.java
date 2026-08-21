package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.DiabetesKnowledgeBase;
import auca.ac.rw.diabetesmonitoring.security.InputSanitizer;
import auca.ac.rw.diabetesmonitoring.service.DiabetesKnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diabetes-knowledge")
@CrossOrigin(origins = "*")
public class DiabetesKnowledgeBaseController {

    private final DiabetesKnowledgeBaseService diabetesKnowledgeBaseService;

    public DiabetesKnowledgeBaseController(DiabetesKnowledgeBaseService diabetesKnowledgeBaseService) {
        this.diabetesKnowledgeBaseService = diabetesKnowledgeBaseService;
    }

    @GetMapping
    public ResponseEntity<List<DiabetesKnowledgeBase>> getAllKnowledgeEntries() {
        return ResponseEntity.ok(diabetesKnowledgeBaseService.getAllEntries());
    }

    @GetMapping("/disclaimer")
    public ResponseEntity<Map<String, String>> getDisclaimer() {
        return ResponseEntity.ok(Map.of("disclaimer", DiabetesKnowledgeBase.EDUCATIONAL_DISCLAIMER));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<DiabetesKnowledgeBase>> getKnowledgeEntriesByCategory(@PathVariable String category) {
        String sanitizedCategory = InputSanitizer.cleanSearchToken(category, "Category", 100);
        return ResponseEntity.ok(diabetesKnowledgeBaseService.getEntriesByCategory(sanitizedCategory));
    }

    @GetMapping("/topic/{topicKey}")
    public ResponseEntity<DiabetesKnowledgeBase> getKnowledgeEntryByTopicKey(@PathVariable String topicKey) {
        String sanitizedTopicKey = InputSanitizer.cleanSearchToken(topicKey, "Topic key", 100);
        return diabetesKnowledgeBaseService.getEntryByTopicKey(sanitizedTopicKey)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiabetesKnowledgeBase> getKnowledgeEntryById(@PathVariable Long id) {
        return diabetesKnowledgeBaseService.getEntryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DiabetesKnowledgeBase> createKnowledgeEntry(@Valid @RequestBody DiabetesKnowledgeBase entry) {
        return new ResponseEntity<>(diabetesKnowledgeBaseService.createEntry(entry), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiabetesKnowledgeBase> updateKnowledgeEntry(@PathVariable Long id, @Valid @RequestBody DiabetesKnowledgeBase updatedEntry) {
        return diabetesKnowledgeBaseService.updateEntry(id, updatedEntry)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKnowledgeEntry(@PathVariable Long id) {
        if (diabetesKnowledgeBaseService.deleteEntry(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
