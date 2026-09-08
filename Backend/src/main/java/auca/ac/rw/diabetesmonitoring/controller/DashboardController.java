package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getDoctorDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getDoctorDashboard(authentication.getName()));
    }

    @GetMapping("/nurse")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<Map<String, Object>> getNurseDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getNurseDashboard(authentication.getName()));
    }

    @GetMapping("/caregiver")
    @PreAuthorize("hasRole('CAREGIVER')")
    public ResponseEntity<Map<String, Object>> getCaregiverDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getCaregiverDashboard(authentication.getName()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
