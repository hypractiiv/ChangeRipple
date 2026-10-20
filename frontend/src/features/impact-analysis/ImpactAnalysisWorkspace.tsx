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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Header & Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 mb-1">
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
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 max-w-[280px] truncate"
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
