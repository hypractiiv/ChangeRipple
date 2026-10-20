package com.changeripple.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SelectedTestRepository extends JpaRepository<SelectedTest, String> {

    List<SelectedTest> findAllByAnalysisRunIdOrderBySelectionRankAsc(String analysisRunId);

    List<SelectedTest> findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(
            String analysisRunId, String selectionStrategy);

    void deleteAllByAnalysisRunId(String analysisRunId);
}
