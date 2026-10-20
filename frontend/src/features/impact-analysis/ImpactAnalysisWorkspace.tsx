import React, { useState, useEffect } from 'react';
import { AnalysisDetail, ChangeRequest, Project } from '../../types';
import { api } from '../../services/api';
import { RiskGauge } from './RiskGauge';
import { AffectedComponentsTable } from './AffectedComponentsTable';
import { RegressionTestView } from '../regression-tests/RegressionTestView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Download,
  FileText,
  Layers,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  GitPullRequest,
  Activity,
} from 'lucide-react';

interface ImpactAnalysisWorkspaceProps {
  project: Project;
  selectedAnalysisId?: string | null;
  onSelectChange?: (changeId: string) => void;
}

export const ImpactAnalysisWorkspace: React.FC<ImpactAnalysisWorkspaceProps> = ({
  project,
  selectedAnalysisId,
  onSelectChange,
}) => {
  const [analysisDetail, setAnalysisDetail] = useState<AnalysisDetail | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [selectedChangeId, setSelectedChangeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'components' | 'tests' | 'methodology'>('components');

  // Load change requests for project
  useEffect(() => {
    if (project?.id) {
      api.changes.list(project.id).then((paged) => {
        setChangeRequests(paged.content);
        if (paged.content.length > 0 && !selectedChangeId) {
          setSelectedChangeId(paged.content[0].id);
        }
      });
    }
  }, [project?.id]);

  // Load specific analysis run if requested
  useEffect(() => {
    if (selectedAnalysisId) {
      setIsLoading(true);
      api.analysis.get(selectedAnalysisId)
        .then((detail) => {
          setAnalysisDetail(detail);
          setSelectedChangeId(detail.summary.changeRequestId);
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedAnalysisId]);

  const handleRunAnalysis = async () => {
    if (!selectedChangeId) return;
    setIsExecuting(true);
    try {
      const detail = await api.analysis.run(selectedChangeId);
      setAnalysisDetail(detail);
    } catch (err) {
      console.error('Failed to execute analysis', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownload = (type: 'markdown' | 'csv') => {
    if (!analysisDetail) return;
    const url =
      type === 'markdown'
        ? api.reports.downloadMarkdownUrl(analysisDetail.summary.id)
        : api.reports.downloadCsvUrl(analysisDetail.summary.id);

    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Header & Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FBC02D] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Impact Intelligence Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Change Analysis Workspace</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate downstream blast radius, compute explainable risk scores, and optimize regression suites.
          </p>
        </div>

        {/* Change Request Selector and Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedChangeId}
            onChange={(e) => setSelectedChangeId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 max-w-[280px] truncate"
          >
            {changeRequests.map((cr) => (
              <option key={cr.id} value={cr.id}>
                {cr.title} ({cr.category})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={handleRunAnalysis}
            isLoading={isExecuting}
            disabled={!selectedChangeId}
            size="md"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>

          {analysisDetail && (
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('markdown')}
                title="Download Markdown Report"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('csv')}
                title="Download CSV"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Retrieving analysis execution snapshot..." />
      ) : !analysisDetail ? (
        <Card className="text-center py-16">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">No Active Analysis Loaded</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select a proposed change request above and click <strong>"Run Analysis"</strong> to traverse the
              dependency graph, calculate explainable risk scores, and derive the optimal test suite.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Executive KPI Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Risk Gauge Card */}
            <Card className="p-4 flex items-center gap-4 bg-slate-900/90 border-slate-800">
              <RiskGauge
                score={analysisDetail.summary.overallRiskScore}
                band={analysisDetail.summary.overallRiskBand}
                size={96}
              />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">Overall Change Risk</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Calibrated heuristic score based on criticality and blast reach.
                </p>
              </div>
            </Card>

            {/* Affected Components Summary */}
            <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400">Total Affected Components</div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
                  {analysisDetail.summary.totalAffectedComponents}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Direct: <strong className="text-slate-200">{analysisDetail.summary.directAffectedCount}</strong></span>
                <span>Transitive: <strong className="text-slate-200">{analysisDetail.summary.transitiveAffectedCount}</strong></span>
                <span>Depth: <strong className="text-slate-200">{analysisDetail.summary.maxImpactDepth} hops</strong></span>
              </div>
            </Card>

            {/* Regression Test Suite Optimization */}
            <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400">Greedy Test Suite Reduction</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                  {analysisDetail.summary.testSuiteReductionPercent.toFixed(1)}%
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Selected <strong className="text-slate-200">{analysisDetail.summary.selectedTestCount}</strong> of{' '}
                <strong className="text-slate-200">{analysisDetail.summary.candidateTestCount}</strong> candidates
              </div>
            </Card>

            {/* Coverage & Uncovered Warning */}
            <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400">Test Coverage</div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
                  {analysisDetail.summary.testCoveragePercent.toFixed(1)}%
                </div>
              </div>
              <div className="text-[11px] pt-2 border-t border-slate-800/80 flex items-center justify-between">
                {analysisDetail.summary.uncoveredComponentCount > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {analysisDetail.summary.uncoveredComponentCount} Uncovered Targets
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">100% Covered</span>
                )}
              </div>
            </Card>
          </div>

          {/* Explainable Risk Intelligence Breakdown & Synthesis Card */}
          <Card className="p-5 bg-slate-900/95 border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full animate-pulse ${
                  analysisDetail.summary.overallRiskBand === 'CRITICAL' ? 'bg-[#C62828]' :
                  analysisDetail.summary.overallRiskBand === 'HIGH' ? 'bg-[#FF8F00]' :
                  analysisDetail.summary.overallRiskBand === 'MEDIUM' ? 'bg-[#FBC02D]' : 'bg-emerald-500'
                }`} />
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Explainable Risk Breakdown</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (Score: <strong className="text-[#FBC02D]">{analysisDetail.summary.overallRiskScore.toFixed(1)} / 100</strong> — {analysisDetail.summary.overallRiskBand} RISK)
                  </span>
                </h3>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Target:</span>
                <span className="px-2 py-0.5 rounded bg-[#FBC02D]/10 border border-[#FBC02D]/30 text-[#FDD835] font-mono font-semibold">
                  {analysisDetail.summary.changedComponentName}
                </span>
              </div>
            </div>

            {/* Risk Spectrum Visual Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold">Low (0 - 34)</span>
                <span className="text-[#FDD835] font-semibold">Medium (35 - 69)</span>
                <span className="text-[#FFA726] font-semibold">High (70 - 89)</span>
                <span className="text-[#EF5350] font-semibold">Critical (90 - 100)</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-[35%] bg-emerald-500/30 border-r border-slate-800" />
                  <div className="w-[35%] bg-[#FBC02D]/40 border-r border-slate-800" />
                  <div className="w-[20%] bg-[#FF8F00]/50 border-r border-slate-800" />
                  <div className="w-[10%] bg-[#C62828]/60" />
                </div>
                {/* Score Needle Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-[#F5F5DC] shadow-lg shadow-white/80 rounded-full transition-all duration-700"
                  style={{ left: `calc(${Math.min(99, Math.max(1, analysisDetail.summary.overallRiskScore))}% - 4px)` }}
                />
              </div>
            </div>

            {/* 4 Factor Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>💥 Blast Radius</span>
                  <span className="font-mono text-slate-300">{analysisDetail.summary.totalAffectedComponents} nodes</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF8F00] rounded-full"
                    style={{ width: `${Math.min(100, (analysisDetail.summary.totalAffectedComponents / 15) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {analysisDetail.summary.directAffectedCount} direct, {analysisDetail.summary.transitiveAffectedCount} transitive
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>📏 Cascade Depth</span>
                  <span className="font-mono text-slate-300">{analysisDetail.summary.maxImpactDepth} hops</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FBC02D] rounded-full"
                    style={{ width: `${Math.min(100, (analysisDetail.summary.maxImpactDepth / 4) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Deepest ripple distance
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>⚡ Test Reduction</span>
                  <span className="font-mono text-emerald-400 font-bold">{analysisDetail.summary.testSuiteReductionPercent.toFixed(0)}% saved</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${analysisDetail.summary.testSuiteReductionPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {analysisDetail.summary.selectedTestCount} of {analysisDetail.summary.candidateTestCount} tests needed
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>🛡️ Coverage Safety</span>
                  <span className="font-mono text-slate-300">{analysisDetail.summary.testCoveragePercent.toFixed(0)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${analysisDetail.summary.uncoveredComponentCount > 0 ? 'bg-[#FF8F00]' : 'bg-emerald-500'}`}
                    style={{ width: `${analysisDetail.summary.testCoveragePercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {analysisDetail.summary.uncoveredComponentCount === 0
                    ? '100% of affected code covered'
                    : `${analysisDetail.summary.uncoveredComponentCount} component(s) lack tests`}
                </div>
              </div>
            </div>

            {/* Plain English Takeaway */}
            <div className="p-3 rounded-xl bg-[#FBC02D]/10 border border-[#FBC02D]/30 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FBC02D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#FDD835]">Engineering Recommendation: </strong>
                {analysisDetail.summary.overallRiskBand === 'CRITICAL' || analysisDetail.summary.overallRiskBand === 'HIGH' ? (
                  <span>
                    This change to <strong className="text-slate-100">{analysisDetail.summary.changedComponentName}</strong> cascades across {analysisDetail.summary.maxImpactDepth} architectural tiers to public-facing APIs. Run the <strong>{analysisDetail.summary.selectedTestCount} greedy-optimized regression tests</strong> below before merging.
                  </span>
                ) : (
                  <span>
                    This change has a localized blast radius affecting {analysisDetail.summary.totalAffectedComponents} component(s). The <strong>{analysisDetail.summary.selectedTestCount} recommended test(s)</strong> provide complete regression coverage with minimal CI/CD pipeline duration.
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis View Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('components')}
              className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'components'
                  ? 'border-brand-500 text-brand-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Affected Components ({analysisDetail.impactResults.length})
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'tests'
                  ? 'border-brand-500 text-brand-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Regression Test Recommendations
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'methodology'
                  ? 'border-brand-500 text-brand-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Algorithmic Methodology & Limitations
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'components' && (
            <AffectedComponentsTable impactResults={analysisDetail.impactResults} />
          )}

          {activeTab === 'tests' && (
            <RegressionTestView
              basicSelection={analysisDetail.basicTestSelection}
              greedySelection={analysisDetail.greedyTestSelection}
            />
          )}

          {activeTab === 'methodology' && (
            <Card className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900/80">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Change Impact Analysis & Risk Model Specifications
              </h3>
              <p>
                <strong>1. Reverse Edge Traversal Convention</strong>: In software architecture models, dependencies are directed as <code>Component A &rarr; Component B</code> (A depends on B). When B changes, impact flows backwards to find all dependents by traversing incoming edges in <code>O(V + E)</code> time.
              </p>
              <p>
                <strong>2. Explainable Heuristic Risk Scoring</strong>: Scores range between 0 and 100 based on weighted factor decomposition: Criticality (35%), Impact Proximity (25%), Blast Radius (15%), Change Category (15%), and Severity (10%), with compliance requirement bonuses. <em>Notice: Heuristic scores represent engineering prioritization rankings, not statistically certified probabilities of system failure.</em>
              </p>
              <p>
                <strong>3. Greedy Set-Cover Regression Selection</strong>: Uses deterministic greedy approximation to select minimal candidate test suites covering the maximum number of impacted runtime components.
              </p>
              <p>
                <strong>4. Known Architectural Limitations</strong>: Static dependency graphs do not reflect reflection calls, dynamic runtime polymorphism, or runtime network proxying.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
