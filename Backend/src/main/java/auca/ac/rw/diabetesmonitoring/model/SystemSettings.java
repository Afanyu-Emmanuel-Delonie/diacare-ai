package auca.ac.rw.diabetesmonitoring.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Singleton settings row (always id=1) holding report branding used when
 * generating patient/system reports.
 */
@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    private Long id = 1L;

    @Column(length = 200)
    private String systemName;

    @Column(length = 1000)
    private String logoUrl;

    @Column(length = 1000)
    private String watermarkUrl;

    @Column(length = 300)
    private String watermarkText;

    @Column(length = 500)
    private String footer;

    @Column(length = 1000)
    private String confidentialityNotice;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        id = 1L;
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
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
