package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.model.DiabetesKnowledgeBase;
import auca.ac.rw.diabetesmonitoring.repository.DiabetesKnowledgeBaseRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiabetesKnowledgeBaseService {

    private final DiabetesKnowledgeBaseRepository diabetesKnowledgeBaseRepository;

    public DiabetesKnowledgeBaseService(DiabetesKnowledgeBaseRepository diabetesKnowledgeBaseRepository) {
        this.diabetesKnowledgeBaseRepository = diabetesKnowledgeBaseRepository;
    }

    @PostConstruct
    public void seedEducationalContent() {
        defaultEntries().stream()
                .filter(entry -> !diabetesKnowledgeBaseRepository.existsByTopicKey(entry.getTopicKey()))
                .forEach(diabetesKnowledgeBaseRepository::save);
    }

    public List<DiabetesKnowledgeBase> getAllEntries() {
        return diabetesKnowledgeBaseRepository.findAll();
    }

    public List<DiabetesKnowledgeBase> getEntriesByCategory(String category) {
        return diabetesKnowledgeBaseRepository.findByCategoryIgnoreCaseOrderByTitleAsc(category);
    }

    public Optional<DiabetesKnowledgeBase> getEntryById(Long id) {
        return diabetesKnowledgeBaseRepository.findById(id);
    }

    public Optional<DiabetesKnowledgeBase> getEntryByTopicKey(String topicKey) {
        return diabetesKnowledgeBaseRepository.findByTopicKey(topicKey);
    }

    public DiabetesKnowledgeBase createEntry(DiabetesKnowledgeBase entry) {
        entry.setDisclaimer(DiabetesKnowledgeBase.EDUCATIONAL_DISCLAIMER);
        return diabetesKnowledgeBaseRepository.save(entry);
    }

    public Optional<DiabetesKnowledgeBase> updateEntry(Long id, DiabetesKnowledgeBase updatedEntry) {
        return diabetesKnowledgeBaseRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedEntry, existing, "id");
                    existing.setDisclaimer(DiabetesKnowledgeBase.EDUCATIONAL_DISCLAIMER);
                    return diabetesKnowledgeBaseRepository.save(existing);
                });
    }

    public boolean deleteEntry(Long id) {
        return diabetesKnowledgeBaseRepository.findById(id)
                .map(existing -> {
                    diabetesKnowledgeBaseRepository.delete(existing);
                    return true;
                })
                .orElse(false);
    }

    private List<DiabetesKnowledgeBase> defaultEntries() {
        return List.of(
                entry("type-1-diabetes", "Diabetes Types", "Type 1 Diabetes",
                        "Type 1 diabetes is an autoimmune form of diabetes where the body makes little or no insulin. It can occur at any age, often starts suddenly, and usually requires insulin treatment. Common warning signs include increased thirst, frequent urination, unexplained weight loss, tiredness, nausea, vomiting, stomach pain, or signs of diabetic ketoacidosis.",
                        "CDC Diabetes Basics and Symptoms"),
                entry("type-2-diabetes", "Diabetes Types", "Type 2 Diabetes",
                        "Type 2 diabetes happens when the body does not use insulin well and blood glucose remains higher than normal. It often develops gradually and may have few symptoms. Healthy eating, physical activity, weight management, regular monitoring, and prescribed medicines can help people manage it.",
                        "CDC Diabetes Basics; WHO Diabetes Fact Sheet"),
                entry("gestational-diabetes", "Diabetes Types", "Gestational Diabetes",
                        "Gestational diabetes is high blood glucose first recognized during pregnancy. It is usually found through prenatal screening rather than symptoms. It can increase health risks during pregnancy and delivery, and it also increases the future risk of type 2 diabetes for the mother and child.",
                        "CDC Symptoms of Diabetes; WHO Diabetes Fact Sheet"),
                entry("prediabetes", "Diabetes Types", "Prediabetes",
                        "Prediabetes means blood glucose is higher than normal but not high enough for a diabetes diagnosis. It increases the risk of type 2 diabetes, heart disease, and stroke. Lifestyle changes such as healthy eating, regular physical activity, and weight management can reduce risk.",
                        "CDC Diabetes Basics; ADA Diabetes Diagnosis"),
                entry("other-specific-types", "Diabetes Types", "Other Specific Types of Diabetes",
                        "Other specific types of diabetes can occur because of genetic conditions, pancreatic disease, endocrine disorders, medicines such as long-term steroids, infections, or other medical causes. These types need assessment by a qualified healthcare professional because causes and care plans differ.",
                        "WHO Diabetes Fact Sheet"),
                entry("blood-sugar-ranges", "Monitoring Ranges", "Blood Sugar Ranges",
                        "Common diagnostic ranges are: fasting plasma glucose below 100 mg/dL is generally normal, 100-125 mg/dL is in the prediabetes range, and 126 mg/dL or higher is in the diabetes range. A two-hour oral glucose tolerance test below 140 mg/dL is generally normal, 140-199 mg/dL is in the prediabetes range, and 200 mg/dL or higher is in the diabetes range. Personal targets can differ.",
                        "ADA Diabetes Diagnosis"),
                entry("hba1c-ranges", "Monitoring Ranges", "HbA1c Ranges",
                        "HbA1c estimates average blood glucose over about two to three months. Common diagnostic ranges are: below 5.7% is generally normal, 5.7% to 6.4% is in the prediabetes range, and 6.5% or higher is in the diabetes range. Many adults with diabetes have an HbA1c goal below 7%, but individual targets should be set with a healthcare professional.",
                        "ADA Understanding A1C"),
                entry("diabetes-complications", "Safety", "Diabetes Complications",
                        "Long-term high blood glucose can damage blood vessels and nerves. Possible complications include heart disease, stroke, kidney disease, vision loss, nerve damage, foot ulcers, infections, sexual health problems, and pregnancy complications. Regular checkups and early treatment help reduce risk.",
                        "CDC Diabetes Basics; WHO Diabetes Fact Sheet"),
                entry("emergency-signs", "Safety", "Emergency Signs",
                        "Seek urgent medical help for severe dehydration, confusion, fainting, chest pain, trouble breathing, persistent vomiting, severe abdominal pain, very high blood glucose with ketones, symptoms of diabetic ketoacidosis, seizures, or severe low blood glucose that does not improve with fast-acting carbohydrate.",
                        "CDC Symptoms of Diabetes"),
                entry("exercise-recommendations", "Lifestyle", "Exercise Recommendations",
                        "Physical activity helps diabetes care. General education guidance includes aiming for regular moderate activity, such as brisk walking, most days of the week when safe. WHO notes at least 150 minutes of moderate exercise each week can help prevent type 2 diabetes and complications. People using insulin or glucose-lowering medicines should learn how activity affects blood glucose.",
                        "CDC Living with Diabetes; WHO Diabetes Fact Sheet"),
                entry("food-guidance", "Lifestyle", "Food Guidance",
                        "A diabetes-friendly eating pattern focuses on vegetables, beans, lentils, whole grains in appropriate portions, lean proteins, healthy fats, water, and limiting sugary drinks, refined starches, and saturated fat. Carbohydrate portions matter because carbohydrate foods raise blood glucose. Meal plans should respect culture, budget, and clinical needs.",
                        "CDC Living with Diabetes; WHO Diabetes Fact Sheet"),
                entry("rwanda-local-foods", "Local Food Guidance", "Rwanda Local Foods",
                        "Rwanda local foods can fit into diabetes education when portions and preparation are considered. Examples include beans, lentils, peas, isombe, dodo, other green vegetables, avocado, fish, eggs, small portions of sweet potatoes, Irish potatoes, maize, sorghum, brown rice, or plantain. Prefer boiled, steamed, grilled, or lightly cooked foods, limit added sugar and deep frying, and balance starchy foods with vegetables and protein.",
                        "Local nutrition education guidance")
        );
    }

    private DiabetesKnowledgeBase entry(String topicKey, String category, String title, String content, String source) {
        DiabetesKnowledgeBase entry = new DiabetesKnowledgeBase();
        entry.setTopicKey(topicKey);
        entry.setCategory(category);
        entry.setTitle(title);
        entry.setContent(content);
        entry.setDisclaimer(DiabetesKnowledgeBase.EDUCATIONAL_DISCLAIMER);
        entry.setSource(source);
        return entry;
    }
}
