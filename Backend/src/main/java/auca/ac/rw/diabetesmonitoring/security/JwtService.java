package auca.ac.rw.diabetesmonitoring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String INSECURE_DEFAULT = "INSECURE-DEFAULT-DO-NOT-USE-IN-PRODUCTION";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @PostConstruct
    void validateSecret() {
        if (INSECURE_DEFAULT.equals(secret) || secret.length() < 32) {
            log.error("!!! JWT_SECRET is missing, using the insecure default, or too short (< 32 chars). "
                    + "Set a long, random JWT_SECRET environment variable before deploying to production. "
                    + "Tokens signed with a weak secret can be forged for any user, including admins. !!!");
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return extractedUsername.equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    /**
     * Validates the token's signature (always required) and returns its claims even if the
     * token has expired, as long as it expired no more than {@code graceMs} ago. Used only by
     * the session-refresh flow: it lets an actively-used session renew seamlessly for a short
     * window after expiry, without keeping a separate long-lived refresh token. A token that
     * fails signature verification (tampered, or signed with an old/rotated secret) never
     * qualifies - only {@link ExpiredJwtException} is treated leniently.
     */
    public Claims extractClaimsWithinGrace(String token, long graceMs) {
        try {
            return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
        } catch (ExpiredJwtException ex) {
            Claims claims = ex.getClaims();
            long expiredForMs = System.currentTimeMillis() - claims.getExpiration().getTime();
            if (expiredForMs <= graceMs) {
                return claims;
            }
            throw ex;
        }
    }
}
