import React, { useState, useEffect } from 'react';
import { Project, AnalysisRunSummary, HistoryCompareResponse } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import {
  History,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  AlertCircle,
} from 'lucide-react';

interface HistoryComparePageProps {
  project: Project;
}

export const HistoryComparePage: React.FC<HistoryComparePageProps> = ({ project }) => {
  const [runs, setRuns] = useState<AnalysisRunSummary[]>([]);
  const [runId1, setRunId1] = useState<string>('');
  const [runId2, setRunId2] = useState<string>('');
  const [diffResult, setDiffResult] = useState<HistoryCompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  useEffect(() => {
    if (project?.id) {
      setIsLoading(true);
      api.analysis.listProjectAnalyses(project.id)
        .then((paged) => {
          setRuns(paged.content);
          if (paged.content.length >= 2) {
            setRunId1(paged.content[1].id); // Older run
            setRunId2(paged.content[0].id); // Newer run
          } else if (paged.content.length === 1) {
            setRunId1(paged.content[0].id);
            setRunId2(paged.content[0].id);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [project?.id]);

  const handleCompare = async () => {
    if (!runId1 || !runId2) return;
    setIsComparing(true);
    try {
      const result = await api.analysis.compare(runId1, runId2);
      setDiffResult(result);
    } catch (err) {
      console.error('Failed to compare analysis runs', err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FBC02D] mb-1">
=======
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-brand-400 mb-1">
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
          <History className="w-4 h-4" />
          <span>Multi-Run Evolution Tracking</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Historical Analysis Comparison</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Compare two analysis snapshots to detect newly impacted modules, omitted components, and risk score drifts.
        </p>

        {/* Run Selectors */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Baseline (Run 1):</span>
            <select
              value={runId1}
              onChange={(e) => setRunId1(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 max-w-[240px] truncate"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.changeRequestTitle} ({formatDate(r.executedAt)})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:inline" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Comparison (Run 2):</span>
            <select
              value={runId2}
              onChange={(e) => setRunId2(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 max-w-[240px] truncate"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.changeRequestTitle} ({formatDate(r.executedAt)})
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleCompare}
            isLoading={isComparing}
            disabled={!runId1 || !runId2}
          >
            Compare Runs
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading historical runs..." />
      ) : !diffResult ? (
        <Card className="text-center py-16">
          <p className="text-xs text-slate-400">
            Select two analysis runs above and click <strong>"Compare Runs"</strong> to evaluate differential impact metrics.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* High-level Diff Delta Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-900/80">
              <div className="text-xs text-slate-400 mb-1">Newly Impacted Components</div>
              <div className="text-2xl font-bold font-mono text-red-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-400" />
                +{diffResult.newlyAffectedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Impacted in Run 2 only</div>
            </Card>

            <Card className="p-4 bg-slate-900/80">
              <div className="text-xs text-slate-400 mb-1">No Longer Impacted</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-emerald-400" />
                -{diffResult.noLongerAffectedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Impact cleared in Run 2</div>
            </Card>

            <Card className="p-4 bg-slate-900/80">
              <div className="text-xs text-slate-400 mb-1">Overall Risk Score Delta</div>
              <div
                className={`text-2xl font-bold font-mono flex items-center gap-2 ${
                  diffResult.overallRiskScoreDelta > 0
                    ? 'text-red-400'
                    : diffResult.overallRiskScoreDelta < 0
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {diffResult.overallRiskScoreDelta > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-400" />
                ) : diffResult.overallRiskScoreDelta < 0 ? (
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                ) : null}
                {diffResult.overallRiskScoreDelta > 0 ? '+' : ''}
                {diffResult.overallRiskScoreDelta.toFixed(1)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {diffResult.baselineRun.overallRiskScore.toFixed(1)} &rarr;{' '}
                {diffResult.comparisonRun.overallRiskScore.toFixed(1)}
              </div>
            </Card>

            <Card className="p-4 bg-slate-900/80">
              <div className="text-xs text-slate-400 mb-1">Test Coverage Delta</div>
              <div className="text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
                {diffResult.testCoverageDelta > 0 ? '+' : ''}
                {diffResult.testCoverageDelta.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Suite reduction delta: {diffResult.testSuiteReductionDelta > 0 ? '+' : ''}
                {diffResult.testSuiteReductionDelta.toFixed(1)}%
              </div>
            </Card>
          </div>

          {/* Component Diffs Table */}
<<<<<<< HEAD
          <div className="border border-slate-800 rounded-xl bg-slate-900/60 shadow-xl overflow-hidden">
=======
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Component Status & Risk Shifts</h3>
              <span className="text-xs font-mono text-slate-400">
                {diffResult.componentDiffs.length} components evaluated
              </span>
            </div>
<<<<<<< HEAD
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 min-w-[220px]">Component</th>
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">Diff Status</th>
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Baseline Score (R1)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Comparison Score (R2)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Score Shift (&Delta;)</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Explanation</th>
                  </tr>
                </thead>
=======
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Diff Status</th>
                  <th className="py-3 px-4">Baseline Score (R1)</th>
                  <th className="py-3 px-4">Comparison Score (R2)</th>
                  <th className="py-3 px-4">Score Shift (&Delta;)</th>
                  <th className="py-3 px-4">Explanation</th>
                </tr>
              </thead>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {diffResult.componentDiffs.map((diff) => (
                  <tr key={diff.componentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                      {diff.componentName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          diff.diffType === 'NEWLY_AFFECTED'
                            ? 'danger'
                            : diff.diffType === 'NO_LONGER_AFFECTED'
                            ? 'success'
                            : diff.diffType === 'MODIFIED_RISK'
                            ? 'warning'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {diff.diffType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {diff.run1RiskScore !== null && diff.run1RiskScore !== undefined ? diff.run1RiskScore.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {diff.run2RiskScore !== null && diff.run2RiskScore !== undefined ? diff.run2RiskScore.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {diff.scoreDelta !== null && diff.scoreDelta !== undefined ? (
                        <span
                          className={
                            diff.scoreDelta > 0
                              ? 'text-red-400'
                              : diff.scoreDelta < 0
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }
                        >
                          {diff.scoreDelta > 0 ? '+' : ''}
                          {diff.scoreDelta.toFixed(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-sm truncate">
                      {diff.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
<<<<<<< HEAD
      </div>
    )}
  </div>
);
=======
      )}
    </div>
  );
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
};
