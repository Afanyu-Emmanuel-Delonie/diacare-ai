package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.RateLimitExceededException;
import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.security.JwtService;
import auca.ac.rw.diabetesmonitoring.security.LoginRateLimiter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    /** How long past expiry a token may still be used to renew the session (see JwtService#extractClaimsWithinGrace). */
    private static final long REFRESH_GRACE_MS = 10 * 60 * 1000L;

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

    /**
     * Issues a fresh access token for a session whose token has recently expired (see
     * {@link #REFRESH_GRACE_MS}), without requiring the user to log in again. Re-checks the
     * account is still active/not archived on every renewal, so a deactivated or deleted
     * account cannot keep renewing its way past that block.
     */
    public String refresh(String expiredOrValidToken) {
        Claims claims;
        try {
            claims = jwtService.extractClaimsWithinGrace(expiredOrValidToken, REFRESH_GRACE_MS);
        } catch (JwtException | IllegalArgumentException ex) {
            auditLogService.log("SESSION_RENEWAL_FAILED", "FAILURE", null, null, "Refresh token invalid or expired beyond the renewal window");
            throw new IllegalArgumentException("Your session has expired. Please log in again.");
        }

        String username = claims.getSubject();
        User user = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        if (user == null || Boolean.TRUE.equals(user.getDeleted()) || Boolean.FALSE.equals(user.getActive())) {
            auditLogService.log("SESSION_RENEWAL_FAILED", "FAILURE", username, null, "Account no longer active");
            throw new IllegalArgumentException("Your session has expired. Please log in again.");
        }

        auditLogService.log("SESSION_RENEWED", "SUCCESS", user.getEmail(), user.getRole(), "Access token renewed");
        return jwtService.generateToken(user.getUsername(), user.getRole());
    }
}
