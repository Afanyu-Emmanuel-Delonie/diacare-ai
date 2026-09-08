package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.SystemSettingsDto;
import auca.ac.rw.diabetesmonitoring.service.SystemSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    public SystemSettingsController(SystemSettingsService systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }

    @GetMapping("/report-branding")
    public ResponseEntity<SystemSettingsDto> getReportBranding() {
        return ResponseEntity.ok(systemSettingsService.getBranding());
    }

    @PutMapping("/report-branding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettingsDto> updateReportBranding(@Valid @RequestBody SystemSettingsDto request,
                                                                    Authentication authentication) {
        return ResponseEntity.ok(systemSettingsService.updateBranding(request, authentication.getName()));
    }
}
