package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.AuthRequest;
import auca.ac.rw.diabetesmonitoring.dto.UserRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.UserResponseDto;
import auca.ac.rw.diabetesmonitoring.service.AuditLogService;
import auca.ac.rw.diabetesmonitoring.service.AuthService;
import auca.ac.rw.diabetesmonitoring.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final AuditLogService auditLogService;

    public AuthController(AuthService authService, UserService userService, AuditLogService auditLogService) {
        this.authService = authService;
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest credentials) {
        String token = authService.authenticate(credentials.getUsernameOrEmail(), credentials.getPassword());
        return ResponseEntity.ok(Map.of("message", "Login successful", "token", token));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No session token was provided."));
        }
        String token = authService.refresh(authHeader.substring(7));
        return ResponseEntity.ok(Map.of("message", "Session renewed", "token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        if (authentication != null) {
            auditLogService.log("LOGOUT", "SUCCESS", authentication.getName(), null, "User signed out");
        }
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDto user) {
        // Public self-registration may only ever create PATIENT accounts.
        // Staff accounts (ADMIN/DOCTOR/NURSE/CAREGIVER) must be created by an
        // authenticated admin via POST /api/users, which is role-gated.
        user.setRole("PATIENT");
        UserResponseDto createdUser = UserResponseDto.from(userService.create(user));
        return new ResponseEntity<>(Map.of("message", "User registered successfully", "user", createdUser), HttpStatus.CREATED);
    }
}
