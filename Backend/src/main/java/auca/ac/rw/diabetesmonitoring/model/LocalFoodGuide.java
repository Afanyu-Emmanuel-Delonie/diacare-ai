package auca.ac.rw.diabetesmonitoring.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "local_food_guides")
public class LocalFoodGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String foodName;

    @NotBlank
    @Size(max = 50)
    private String category;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecommendationLevel recommendationLevel;

    @NotBlank
    @Size(max = 300)
    private String portionGuidance;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String notes;

    public Long getId() { return id; }
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public RecommendationLevel getRecommendationLevel() { return recommendationLevel; }
    public void setRecommendationLevel(RecommendationLevel recommendationLevel) { this.recommendationLevel = recommendationLevel; }
    public String getPortionGuidance() { return portionGuidance; }
    public void setPortionGuidance(String portionGuidance) { this.portionGuidance = portionGuidance; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
