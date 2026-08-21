package auca.ac.rw.diabetesmonitoring.repository;

import auca.ac.rw.diabetesmonitoring.model.DiabetesKnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiabetesKnowledgeBaseRepository extends JpaRepository<DiabetesKnowledgeBase, Long> {
    List<DiabetesKnowledgeBase> findByCategoryIgnoreCaseOrderByTitleAsc(String category);
    Optional<DiabetesKnowledgeBase> findByTopicKey(String topicKey);
    boolean existsByTopicKey(String topicKey);
}
