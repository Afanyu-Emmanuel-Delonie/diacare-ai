package auca.ac.rw.diabetesmonitoring.controller;

import auca.ac.rw.diabetesmonitoring.dto.AuthRequest;
import auca.ac.rw.diabetesmonitoring.dto.UserRequestDto;
import auca.ac.rw.diabetesmonitoring.dto.UserResponseDto;
import auca.ac.rw.diabetesmonitoring.service.AuthService;
import auca.ac.rw.diabetesmonitoring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest credentials) {
        String token = authService.authenticate(credentials.getUsernameOrEmail(), credentials.getPassword());
        return ResponseEntity.ok(Map.of("message", "Login successful", "token", token));
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
