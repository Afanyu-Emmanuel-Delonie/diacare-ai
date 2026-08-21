package auca.ac.rw.diabetesmonitoring.security;

public final class InputSanitizer {

    private InputSanitizer() {
    }

    public static String cleanSearchToken(String value, String fieldName, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new IllegalArgumentException(fieldName + " must not exceed " + maxLength + " characters");
        }
        if (!trimmed.matches("[A-Za-z0-9 _./-]+")) {
            throw new IllegalArgumentException(fieldName + " contains unsupported characters");
        }
        return trimmed;
    }
}
