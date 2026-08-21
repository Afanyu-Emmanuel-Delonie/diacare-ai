package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.model.LocalFoodGuide;
import auca.ac.rw.diabetesmonitoring.model.RecommendationLevel;
import auca.ac.rw.diabetesmonitoring.repository.LocalFoodGuideRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocalFoodGuideService {

    public static final String GENERAL_GUIDANCE_NOTE =
            "General guidance only. People with diabetes should follow advice from a qualified healthcare professional.";

    private final LocalFoodGuideRepository localFoodGuideRepository;

    public LocalFoodGuideService(LocalFoodGuideRepository localFoodGuideRepository) {
        this.localFoodGuideRepository = localFoodGuideRepository;
    }

    @PostConstruct
    public void seedRwandaLocalFoods() {
        defaultFoods().stream()
                .filter(food -> !localFoodGuideRepository.existsByFoodNameIgnoreCase(food.getFoodName()))
                .forEach(localFoodGuideRepository::save);
    }

    public List<LocalFoodGuide> getAllFoodGuides() {
        return localFoodGuideRepository.findAll();
    }

    public List<LocalFoodGuide> getFoodGuidesByCategory(String category) {
        return localFoodGuideRepository.findByCategoryIgnoreCaseOrderByFoodNameAsc(category);
    }

    public List<LocalFoodGuide> getFoodGuidesByRecommendationLevel(RecommendationLevel recommendationLevel) {
        return localFoodGuideRepository.findByRecommendationLevelOrderByFoodNameAsc(recommendationLevel);
    }

    public Optional<LocalFoodGuide> getFoodGuideById(Long id) {
        return localFoodGuideRepository.findById(id);
    }

    public LocalFoodGuide createFoodGuide(LocalFoodGuide foodGuide) {
        foodGuide.setNotes(withGeneralGuidance(foodGuide.getNotes()));
        foodGuide.setDescription(foodGuide.getNotes());
        return localFoodGuideRepository.save(foodGuide);
    }

    public Optional<LocalFoodGuide> updateFoodGuide(Long id, LocalFoodGuide updatedFoodGuide) {
        return localFoodGuideRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(updatedFoodGuide, existing, "id");
                    existing.setNotes(withGeneralGuidance(existing.getNotes()));
                    existing.setDescription(existing.getNotes());
                    return localFoodGuideRepository.save(existing);
                });
    }

    public boolean deleteFoodGuide(Long id) {
        return localFoodGuideRepository.findById(id)
                .map(existing -> {
                    localFoodGuideRepository.delete(existing);
                    return true;
                })
                .orElse(false);
    }

    private List<LocalFoodGuide> defaultFoods() {
        return List.of(
                food("Isombe", "Vegetables", RecommendationLevel.BETTER_CHOICE, "1 cup with a balanced meal", "Cassava leaves are rich in fiber; prepare with limited oil and avoid excess salt."),
                food("Ibihaza", "Vegetables", RecommendationLevel.BETTER_CHOICE, "1 cup cooked", "Pumpkin is a good vegetable choice; avoid adding sugar."),
                food("Dodo", "Vegetables", RecommendationLevel.BETTER_CHOICE, "1 to 2 cups cooked", "Leafy greens are high in fiber and fit well with beans, fish, eggs, or lean meat."),
                food("Ubugari", "Starchy Foods", RecommendationLevel.MODERATION, "Small fist-sized portion", "Cassava-based stiff porridge is carbohydrate-dense; pair with vegetables and protein."),
                food("Umuceri", "Starchy Foods", RecommendationLevel.MODERATION, "1/2 cup cooked", "Rice raises blood glucose; use modest portions and choose less refined options when available."),
                food("Ibijumba", "Starchy Foods", RecommendationLevel.MODERATION, "1 small to medium piece", "Sweet potatoes contain carbohydrate; boiled portions are generally better than fried portions."),
                food("Ibirayi", "Starchy Foods", RecommendationLevel.MODERATION, "1 small potato or 1/2 cup", "Prefer boiled potatoes and limit chips or deep-fried preparations."),
                food("Matoke", "Starchy Foods", RecommendationLevel.MODERATION, "1/2 to 1 cup cooked", "Green banana is starchy; balance with vegetables and protein."),
                food("Ibishyimbo", "Protein Foods", RecommendationLevel.BETTER_CHOICE, "1/2 to 1 cup cooked", "Beans provide fiber and plant protein; watch portions because they also contain carbohydrate."),
                food("Akawunga", "Starchy Foods", RecommendationLevel.MODERATION, "Small fist-sized portion", "Maize meal is carbohydrate-dense; avoid very large servings."),
                food("Chapati", "Starchy Foods", RecommendationLevel.LIMIT, "Small piece occasionally", "Chapati is often made with refined flour and oil; keep portions small."),
                food("Sambaza", "Protein Foods", RecommendationLevel.BETTER_CHOICE, "Palm-sized serving", "Small fish are a good protein choice; grilled, boiled, or lightly cooked is better than deep fried."),
                food("Tilapia", "Protein Foods", RecommendationLevel.BETTER_CHOICE, "Palm-sized serving", "Fish is a good protein option; limit heavy frying and salty sauces."),
                food("Goat meat", "Protein Foods", RecommendationLevel.MODERATION, "Palm-sized lean portion", "Choose lean pieces, trim visible fat, and avoid frequent fatty or fried portions."),
                food("Chicken", "Protein Foods", RecommendationLevel.BETTER_CHOICE, "Palm-sized lean portion", "Skinless grilled, boiled, or stewed chicken is a good protein choice."),
                food("Beef", "Protein Foods", RecommendationLevel.MODERATION, "Palm-sized lean portion", "Choose lean cuts, limit fatty pieces, and avoid processed meats when possible."),
                food("Milk", "Dairy", RecommendationLevel.MODERATION, "1 cup", "Unsweetened milk can fit into meals; choose lower-fat options if advised."),
                food("Yogurt", "Dairy", RecommendationLevel.BETTER_CHOICE, "1 small cup", "Choose plain unsweetened yogurt; flavored yogurt can contain added sugar."),
                food("Bananas", "Fruits", RecommendationLevel.MODERATION, "1 small banana", "Fruit contains natural sugar; avoid taking many bananas at once."),
                food("Mangoes", "Fruits", RecommendationLevel.MODERATION, "1/2 small mango", "Mango is sweet; use small portions and avoid juice."),
                food("Pineapple", "Fruits", RecommendationLevel.MODERATION, "1/2 cup pieces", "Use small portions; avoid sweetened juice or syrup."),
                food("Passion fruit", "Fruits", RecommendationLevel.BETTER_CHOICE, "1 to 2 fruits", "Whole passion fruit is preferable to sweetened juice."),
                food("Sugar cane", "Sugary Foods", RecommendationLevel.LIMIT, "Avoid or very small amount", "Sugar cane is high in sugar and can raise blood glucose quickly."),
                food("Groundnuts", "Protein Foods", RecommendationLevel.MODERATION, "Small handful", "Groundnuts provide protein and fat; use unsalted portions and avoid large amounts."),
                food("Cassava", "Starchy Foods", RecommendationLevel.MODERATION, "Small fist-sized portion", "Cassava is carbohydrate-dense; balance with vegetables and protein."),
                food("Sweet potatoes", "Starchy Foods", RecommendationLevel.MODERATION, "1 small to medium piece", "Boiled sweet potatoes are generally preferable to fried versions; keep portions moderate.")
        );
    }

    private LocalFoodGuide food(String foodName, String category, RecommendationLevel recommendationLevel,
                                String portionGuidance, String notes) {
        LocalFoodGuide food = new LocalFoodGuide();
        food.setFoodName(foodName);
        food.setCategory(category);
        food.setRecommendationLevel(recommendationLevel);
        food.setPortionGuidance(portionGuidance);
        food.setNotes(withGeneralGuidance(notes));
        food.setDescription(food.getNotes());
        return food;
    }

    private String withGeneralGuidance(String notes) {
        if (notes == null || notes.isBlank()) {
            return GENERAL_GUIDANCE_NOTE;
        }
        if (notes.contains(GENERAL_GUIDANCE_NOTE)) {
            return notes;
        }
        return notes + " " + GENERAL_GUIDANCE_NOTE;
    }
}
