package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.model.Message;
import auca.ac.rw.diabetesmonitoring.repository.MessageRepository;
import auca.ac.rw.diabetesmonitoring.service.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT','CAREGIVER')")
public class MessageController {

    private final MessageRepository messageRepository;
    private final PatientAccessService patientAccessService;

    public MessageController(MessageRepository messageRepository, PatientAccessService patientAccessService) {
        this.messageRepository = messageRepository;
        this.patientAccessService = patientAccessService;
    }

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages(Authentication authentication) {
        if (patientAccessService.isAdmin(authentication)) {
            return ResponseEntity.ok(messageRepository.findAll());
        }
        var patientIds = patientAccessService.accessiblePatientIds(authentication);
        if (patientIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(messageRepository.findByPatientIdIn(patientIds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id, Authentication authentication) {
        return messageRepository.findById(id)
                .map(message -> canAccess(message, authentication)
                        ? ResponseEntity.ok(message)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<Message>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Message> createMessage(@Valid @RequestBody Message message, Authentication authentication) {
        if (message.getPatient() == null || message.getPatient().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!patientAccessService.canAccessPatientId(authentication, message.getPatient().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return new ResponseEntity<>(messageRepository.save(message), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @Valid @RequestBody Message updatedMessage,
                                                  Authentication authentication) {
        return messageRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication) || !canAccessTarget(updatedMessage, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Message>build();
                    }
                    BeanUtils.copyProperties(updatedMessage, existing, "id");
                    return ResponseEntity.ok(messageRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id, Authentication authentication) {
        return messageRepository.findById(id)
                .map(existing -> {
                    if (!canAccess(existing, authentication)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    messageRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean canAccess(Message message, Authentication authentication) {
        return message.getPatient() != null && patientAccessService.canAccessPatient(authentication, message.getPatient());
    }

    private boolean canAccessTarget(Message message, Authentication authentication) {
        return message.getPatient() == null || message.getPatient().getId() == null
                || patientAccessService.canAccessPatientId(authentication, message.getPatient().getId());
    }
}
