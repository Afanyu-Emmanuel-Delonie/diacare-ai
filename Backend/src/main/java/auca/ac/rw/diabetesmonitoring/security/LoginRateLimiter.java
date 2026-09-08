package auca.ac.rw.diabetesmonitoring.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory sliding-window rate limiter for login attempts, keyed by
 * username/email. Not distributed - fine for a single-instance deployment;
 * a multi-instance deployment should move this to a shared store (e.g. Redis).
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 8;
    private static final long WINDOW_MS = 15 * 60 * 1000L; // 15 minutes

    private record Window(AtomicInteger count, long windowStart) { }

    private final ConcurrentHashMap<String, Window> attemptsByKey = new ConcurrentHashMap<>();

    /** Returns true if the request should be allowed, false if the caller is rate-limited. */
    public boolean tryAcquire(String key) {
        if (key == null || key.isBlank()) {
            return true;
        }
        String normalizedKey = key.trim().toLowerCase();
        long now = Instant.now().toEpochMilli();

        Window window = attemptsByKey.compute(normalizedKey, (k, existing) -> {
            if (existing == null || now - existing.windowStart() > WINDOW_MS) {
                return new Window(new AtomicInteger(1), now);
            }
            existing.count().incrementAndGet();
            return existing;
        });

        return window.count().get() <= MAX_ATTEMPTS;
    }

    /** Clears the limiter for a key after a successful login. */
    public void reset(String key) {
        if (key != null) {
            attemptsByKey.remove(key.trim().toLowerCase());
        }
    }
}
