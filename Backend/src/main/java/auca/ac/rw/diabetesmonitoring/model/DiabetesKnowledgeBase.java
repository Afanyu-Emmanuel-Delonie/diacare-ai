package auca.ac.rw.diabetesmonitoring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "diabetes_knowledge_base")
public class DiabetesKnowledgeBase {

    public static final String EDUCATIONAL_DISCLAIMER =
            "This information is for education only and does not replace advice from a qualified healthcare professional.";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(unique = true)
    private String topicKey;

    @NotBlank
    @Size(max = 100)
    private String category;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;

    @NotBlank
    @Size(max = 300)
    private String disclaimer = EDUCATIONAL_DISCLAIMER;

    @Size(max = 300)
    private String source;

    public Long getId() { return id; }
    public String getTopicKey() { return topicKey; }
    public void setTopicKey(String topicKey) { this.topicKey = topicKey; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
