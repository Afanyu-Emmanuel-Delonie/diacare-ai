package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.LocalFoodGuide;
import auca.ac.rw.diabetesmonitoring.model.RecommendationLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalFoodGuideRepository extends JpaRepository<LocalFoodGuide, Long> {
    List<LocalFoodGuide> findByCategoryIgnoreCaseOrderByFoodNameAsc(String category);
    List<LocalFoodGuide> findByRecommendationLevelOrderByFoodNameAsc(RecommendationLevel recommendationLevel);
    boolean existsByFoodNameIgnoreCase(String foodName);
}
