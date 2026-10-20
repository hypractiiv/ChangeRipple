package com.changeripple.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImpactResultRepository extends JpaRepository<ImpactResult, String> {

    List<ImpactResult> findAllByAnalysisRunIdOrderByRiskScoreDesc(String analysisRunId);

    void deleteAllByAnalysisRunId(String analysisRunId);
}
