package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.dto.AuditLogResponseDto;
import auca.ac.rw.diabetesmonitoring.model.AuditLog;
import auca.ac.rw.diabetesmonitoring.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Records one audit event. Reads IP address and device from the current HTTP
     * request (if any) via RequestContextHolder, so call sites stay simple.
     */
    public void log(String actionType, String status, String email, String role, String message) {
        AuditLog entry = new AuditLog();
        entry.setActionType(actionType);
        entry.setStatus(status);
        entry.setEmail(email);
        entry.setUserRole(role);
        entry.setMessage(message);

        HttpServletRequest request = currentRequest();
        if (request != null) {
            entry.setIpAddress(extractClientIp(request));
            entry.setDevice(describeDevice(request.getHeader("User-Agent")));
        }

        try {
            auditLogRepository.save(entry);
        } catch (RuntimeException ex) {
            // Never let audit logging break the action being audited.
        }
    }

    public List<AuditLogResponseDto> getLogs(Map<String, String> filters) {
        LocalDate startDate = parseDate(filters.get("startDate"));
        LocalDate endDate = parseDate(filters.get("endDate"));
        String email = normalize(filters.get("email"));
        String ip = normalize(filters.get("ip"));
        String role = normalize(filters.get("role"));
        String actionType = normalize(filters.get("actionType"));
        String status = normalize(filters.get("status"));

        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(l -> matchesDate(l.getCreatedAt(), startDate, endDate))
                .filter(l -> email == null || containsIgnoreCase(l.getEmail(), email))
                .filter(l -> ip == null || containsIgnoreCase(l.getIpAddress(), ip))
                .filter(l -> role == null || role.equalsIgnoreCase(l.getUserRole()))
                .filter(l -> actionType == null || actionType.equalsIgnoreCase(l.getActionType()))
                .filter(l -> status == null || status.equalsIgnoreCase(l.getStatus()))
                .map(AuditLogResponseDto::from)
                .collect(Collectors.toList());
    }

    private boolean matchesDate(LocalDateTime createdAt, LocalDate start, LocalDate end) {
        if (createdAt == null) return start == null && end == null;
        LocalDate date = createdAt.toLocalDate();
        if (start != null && date.isBefore(start)) return false;
        return end == null || !date.isAfter(end);
    }

    private boolean containsIgnoreCase(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase().contains(needle.toLowerCase());
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private HttpServletRequest currentRequest() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            return servletAttrs.getRequest();
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String describeDevice(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown device";
        }
        String ua = userAgent.toLowerCase();
        String browser = ua.contains("edg/") ? "Edge"
                : ua.contains("chrome/") && !ua.contains("chromium") ? "Chrome"
                : ua.contains("firefox/") ? "Firefox"
                : ua.contains("safari/") && !ua.contains("chrome") ? "Safari"
                : "Browser";
        String os = ua.contains("windows") ? "Windows"
                : ua.contains("mac os") ? "macOS"
                : ua.contains("android") ? "Android"
                : ua.contains("iphone") || ua.contains("ipad") ? "iOS"
                : ua.contains("linux") ? "Linux"
                : "Unknown OS";
        return browser + " on " + os;
    }
}
