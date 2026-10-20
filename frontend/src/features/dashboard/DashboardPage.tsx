import React, { useState, useEffect } from 'react';
import { Project, SoftwareComponent, ChangeRequest, AnalysisRunSummary } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, getCriticalityBadge, getRiskColor } from '../../lib/utils';
import {
  Network,
  Layers,
  GitPullRequest,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Activity,
  PlusCircle,
  FileCode2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface DashboardPageProps {
  project: Project;
  onNavigateTab: (tab: string) => void;
  onOpenPresets: () => void;
  onSelectAnalysis: (analysisId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  project,
  onNavigateTab,
  onOpenPresets,
  onSelectAnalysis,
}) => {
  const [components, setComponents] = useState<SoftwareComponent[]>([]);
  const [recentChanges, setRecentChanges] = useState<ChangeRequest[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRunSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (project?.id) {
      setIsLoading(true);
      Promise.all([
        api.components.list(project.id, { size: 100 }),
        api.changes.list(project.id, 0, 5),
        api.analysis.listProjectAnalyses(project.id, 0, 5),
      ])
        .then(([comps, changes, analyses]) => {
          setComponents(comps.content);
          setRecentChanges(changes.content);
          setRecentAnalyses(analyses.content);
        })
        .finally(() => setIsLoading(false));
    }
  }, [project?.id]);

  // Aggregate stats
  const typeCounts = components.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const criticalityCounts = components.reduce((acc, c) => {
    acc[c.criticality] = (acc[c.criticality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const critColors: Record<string, string> = {
    CRITICAL: '#C62828',
    HIGH: '#FF8F00',
    MEDIUM: '#FBC02D',
    LOW: '#10B981',
  };

  const critChartData = Object.entries(criticalityCounts).map(([name, count]) => ({
    name,
    value: count,
    color: critColors[name] || '#FBC02D',
  }));

  if (isLoading) {
    return <LoadingSpinner message="Loading architecture dashboard..." />;
  }

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Project Banner & Quick Action Buttons */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FBC02D] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Active Architecture Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            {project.description || 'Enterprise software dependency graph and change impact platform.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={onOpenPresets} size="sm">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Quick Presets
          </Button>
          <Button variant="secondary" onClick={() => onNavigateTab('graph')} size="sm">
            <Network className="w-4 h-4 mr-1.5 text-brand-400" />
            Explore Graph
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab('changes')} size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5 text-slate-400" />
            New Change
          </Button>
        </div>
      </div>

      {/* Top Metric KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Components</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {project.componentCount || components.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Modules, APIs, Classes, Tests</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Directed Dependencies</span>
            <Network className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {project.dependencyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Coupling edges in graph</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Change Requests</span>
            <GitPullRequest className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {project.changeRequestCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending and evaluated</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Analysis Runs</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {recentAnalyses.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stored impact snapshots</div>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Types Bar Chart */}
        <Card className="p-5 bg-slate-900/80 border-slate-800">
          <div className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Architecture Composition by Component Type</span>
            <span className="text-xs font-mono text-slate-400">{components.length} nodes</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Criticality Tier Pie Chart */}
        <Card className="p-5 bg-slate-900/80 border-slate-800">
          <div className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Criticality Tier Distribution</span>
            <span className="text-xs font-mono text-slate-400">Risk calibration baseline</span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={critChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {critChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 text-xs font-mono pl-4 border-l border-slate-800 shrink-0">
              {critChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}:</span>
                  <span className="text-slate-400">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Analyses and High-Risk Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analysis Runs */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FBC02D]" />
              Recent Impact Analyses
            </h3>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-[#FBC02D] hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              View History &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAnalyses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">No analyses executed yet.</p>
            ) : (
              recentAnalyses.map((run) => (
                <div
                  key={run.id}
                  onClick={() => onSelectAnalysis(run.id)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{run.changeRequestTitle}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getRiskColor(run.overallRiskBand)}`}>
                        {run.overallRiskBand}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {run.totalAffectedComponents} affected components &bull; {run.testSuiteReductionPercent.toFixed(0)}% test reduction
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-slate-100">{run.overallRiskScore.toFixed(1)}</div>
                    <div className="text-[10px] text-slate-500">{formatDate(run.executedAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Highest Risk Components in Project */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Critical Architecture Nodes
            </h3>
            <button
              onClick={() => onNavigateTab('components')}
              className="text-xs text-[#FBC02D] hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              All Components &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {components
              .filter((c) => c.criticality === 'CRITICAL' || c.criticality === 'HIGH')
              .slice(0, 5)
              .map((c) => {
                const crit = getCriticalityBadge(c.criticality);
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100 font-mono">{c.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.description || c.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.incomingDependencyCount} dependents
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${crit.color}`}>
                        {crit.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
};
