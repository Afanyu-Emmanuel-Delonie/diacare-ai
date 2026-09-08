package auca.ac.rw.diabetesmonitoring.dto;

import auca.ac.rw.diabetesmonitoring.model.SystemSettings;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class SystemSettingsDto {

    @NotBlank(message = "System name is required")
    @Size(max = 200)
    private String systemName;

    @NotBlank(message = "Logo URL is required")
    @Size(max = 1000)
    private String logoUrl;

    @NotBlank(message = "Watermark URL is required")
    @Size(max = 1000)
    private String watermarkUrl;

    @NotBlank(message = "Watermark text is required")
    @Size(max = 300)
    private String watermarkText;

    @Size(max = 500)
    private String footer;

    @Size(max = 1000)
    private String confidentialityNotice;

    private LocalDateTime updatedAt;

    public static SystemSettingsDto from(SystemSettings settings) {
        SystemSettingsDto dto = new SystemSettingsDto();
        dto.systemName = settings.getSystemName();
        dto.logoUrl = settings.getLogoUrl();
        dto.watermarkUrl = settings.getWatermarkUrl();
        dto.watermarkText = settings.getWatermarkText();
        dto.footer = settings.getFooter();
        dto.confidentialityNotice = settings.getConfidentialityNotice();
        dto.updatedAt = settings.getUpdatedAt();
        return dto;
    }

    public String getSystemName() { return systemName; }
    public void setSystemName(String systemName) { this.systemName = systemName; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getWatermarkUrl() { return watermarkUrl; }
    public void setWatermarkUrl(String watermarkUrl) { this.watermarkUrl = watermarkUrl; }
    public String getWatermarkText() { return watermarkText; }
    public void setWatermarkText(String watermarkText) { this.watermarkText = watermarkText; }
    public String getFooter() { return footer; }
    public void setFooter(String footer) { this.footer = footer; }
    public String getConfidentialityNotice() { return confidentialityNotice; }
    public void setConfidentialityNotice(String confidentialityNotice) { this.confidentialityNotice = confidentialityNotice; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
