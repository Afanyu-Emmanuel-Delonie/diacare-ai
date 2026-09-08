package auca.ac.rw.diabetesmonitoring.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginRateLimiterTest {

    @Test
    void allowsUpToTheConfiguredLimitThenBlocks() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        String key = "attacker@example.com";

        for (int i = 0; i < 8; i++) {
            assertTrue(limiter.tryAcquire(key), "attempt " + (i + 1) + " should be allowed");
        }
        assertFalse(limiter.tryAcquire(key), "9th attempt within the window should be blocked");
    }

    @Test
    void keysAreIndependent() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int i = 0; i < 8; i++) {
            limiter.tryAcquire("userA@example.com");
        }
        assertTrue(limiter.tryAcquire("userB@example.com"), "a different key must not be affected by another key's attempts");
    }

    @Test
    void resetClearsTheCounterForSuccessfulLogins() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        String key = "user@example.com";
        for (int i = 0; i < 8; i++) {
            limiter.tryAcquire(key);
        }
        limiter.reset(key);
        assertTrue(limiter.tryAcquire(key), "counter should restart after a successful login resets it");
    }

    @Test
    void keyMatchingIsCaseInsensitiveAndTrimmed() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int i = 0; i < 8; i++) {
            limiter.tryAcquire("  User@Example.com  ");
        }
        assertFalse(limiter.tryAcquire("user@example.com"), "differently-cased/whitespace key should share the same bucket");
    }
}
