package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.model.User;
import auca.ac.rw.diabetesmonitoring.repository.UserRepository;
import auca.ac.rw.diabetesmonitoring.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String authenticate(String usernameOrEmail, String password) {
        String sanitizedUsernameOrEmail = usernameOrEmail == null ? null : usernameOrEmail.trim();
        User user = userRepository.findByUsername(sanitizedUsernameOrEmail)
                .or(() -> userRepository.findByEmail(sanitizedUsernameOrEmail))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return jwtService.generateToken(user.getUsername(), user.getRole());
    }
}
