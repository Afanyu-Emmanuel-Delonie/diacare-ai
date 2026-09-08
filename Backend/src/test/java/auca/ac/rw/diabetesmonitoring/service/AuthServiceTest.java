package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.RateLimitExceededException;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.security.JwtService;
import auca.ac.rw.diabetesmonitoring.security.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuditLogService auditLogService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Real rate limiter so its behavior is exercised end-to-end through AuthService.
        authService = new AuthService(userRepository, passwordEncoder, jwtService, auditLogService, new LoginRateLimiter());
    }

    private User activeUser() {
        User user = new User();
        user.setUsername("doctor.demo");
        user.setEmail("doctor@example.com");
        user.setPassword("hashed");
        user.setRole("DOCTOR");
        user.setActive(true);
        user.setDeleted(false);
        return user;
    }

    @Test
    void rejectsInvalidCredentials() {
        when(userRepository.findByUsername("doctor.demo")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("doctor.demo")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.authenticate("doctor.demo", "wrongpassword"));
    }

    @Test
    void rejectsDeactivatedAccountEvenWithCorrectPassword() {
        User user = activeUser();
        user.setActive(false);
        when(userRepository.findByUsername("doctor.demo")).thenReturn(Optional.of(user));
        lenient().when(passwordEncoder.matches(any(), any())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.authenticate("doctor.demo", "correctpassword"));
        assertEquals("This account has been deactivated. Contact an administrator.", ex.getMessage());
    }

    @Test
    void rejectsArchivedAccountEvenWithCorrectPassword() {
        User user = activeUser();
        user.setDeleted(true);
        when(userRepository.findByUsername("doctor.demo")).thenReturn(Optional.of(user));
        lenient().when(passwordEncoder.matches(any(), any())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.authenticate("doctor.demo", "correctpassword"));
        assertEquals("This account has been archived. Contact an administrator.", ex.getMessage());
    }

    @Test
    void issuesTokenForValidActiveAccount() {
        User user = activeUser();
        when(userRepository.findByUsername("doctor.demo")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctpassword", "hashed")).thenReturn(true);
        when(jwtService.generateToken("doctor.demo", "DOCTOR")).thenReturn("signed-token");

        String token = authService.authenticate("doctor.demo", "correctpassword");

        assertEquals("signed-token", token);
    }

    @Test
    void blocksAfterRepeatedFailedAttempts() {
        when(userRepository.findByUsername("attacker")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("attacker")).thenReturn(Optional.empty());

        for (int i = 0; i < 8; i++) {
            assertThrows(IllegalArgumentException.class, () -> authService.authenticate("attacker", "wrongpassword"));
        }

        assertThrows(RateLimitExceededException.class, () -> authService.authenticate("attacker", "wrongpassword"));
    }
}
