package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.RateLimitExceededException;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.security.JwtService;
import auca.ac.rw.diabetesmonitoring.security.LoginRateLimiter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final LoginRateLimiter loginRateLimiter;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                        AuditLogService auditLogService, LoginRateLimiter loginRateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
        this.loginRateLimiter = loginRateLimiter;
    }

    public String authenticate(String usernameOrEmail, String password) {
        String sanitizedUsernameOrEmail = usernameOrEmail == null ? null : usernameOrEmail.trim();

        if (!loginRateLimiter.tryAcquire(sanitizedUsernameOrEmail)) {
            auditLogService.log("REPEATED_LOGIN_FAILED", "FAILURE", sanitizedUsernameOrEmail, null,
                    "Too many login attempts - temporarily rate limited");
            throw new RateLimitExceededException("Too many login attempts. Please try again in a few minutes.");
        }

        User user = userRepository.findByUsername(sanitizedUsernameOrEmail)
                .or(() -> userRepository.findByEmail(sanitizedUsernameOrEmail))
                .orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            auditLogService.log("LOGIN_FAILED", "FAILURE", sanitizedUsernameOrEmail, null, "Invalid credentials");
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (Boolean.TRUE.equals(user.getDeleted())) {
            auditLogService.log("ACCOUNT_LOCKOUT", "FAILURE", user.getEmail(), user.getRole(), "Login attempt on an archived account");
            throw new IllegalArgumentException("This account has been archived. Contact an administrator.");
        }
        if (Boolean.FALSE.equals(user.getActive())) {
            auditLogService.log("ACCOUNT_LOCKOUT", "FAILURE", user.getEmail(), user.getRole(), "Login attempt on a deactivated account");
            throw new IllegalArgumentException("This account has been deactivated. Contact an administrator.");
        }

        loginRateLimiter.reset(sanitizedUsernameOrEmail);
        auditLogService.log("LOGIN", "SUCCESS", user.getEmail(), user.getRole(), "Successful login");
        return jwtService.generateToken(user.getUsername(), user.getRole());
    }
}
