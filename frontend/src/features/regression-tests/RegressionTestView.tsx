import React, { useState } from 'react';
import { RegressionTestSelection } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CheckCircle, AlertTriangle, Gauge, Sparkles, Filter } from 'lucide-react';

interface RegressionTestViewProps {
  basicSelection?: RegressionTestSelection;
  greedySelection?: RegressionTestSelection;
}

export const RegressionTestView: React.FC<RegressionTestViewProps> = ({
  basicSelection,
  greedySelection,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'GREEDY' | 'BASIC'>('GREEDY');

  const currentSelection = selectedStrategy === 'GREEDY' ? greedySelection : basicSelection;

  if (!currentSelection) {
    return (
      <div className="p-8 text-center text-slate-500 italic">
        No regression test suite computed for this run.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-200">Selection Strategy:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedStrategy('GREEDY')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                selectedStrategy === 'GREEDY'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Strategy B: Greedy Set-Cover (Optimized)
            </button>
            <button
              onClick={() => setSelectedStrategy('BASIC')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                selectedStrategy === 'BASIC'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strategy A: Basic Selection (All Candidates)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Algorithm: <strong className="text-brand-400">{selectedStrategy}</strong>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/80">
          <div className="text-xs text-slate-400 mb-1">Candidate Tests</div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {currentSelection.candidateTestCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tests with coverage mappings</div>
        </Card>

        <Card className="p-4 bg-slate-900/80">
          <div className="text-xs text-slate-400 mb-1">Selected Test Suite</div>
          <div className="text-2xl font-bold font-mono text-brand-400">
            {currentSelection.selectedTestCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedStrategy === 'GREEDY' ? 'Optimized minimal test set' : 'Full regression set'}
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/80">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Suite Size Reduction</span>
            <Gauge className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {currentSelection.testSuiteReductionPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Fewer test runs required</div>
        </Card>

        <Card className="p-4 bg-slate-900/80">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Affected Runtime Coverage</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {currentSelection.testCoveragePercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentSelection.coveredComponentCount} covered / {currentSelection.uncoveredComponentCount} uncovered
          </div>
        </Card>
      </div>

      {/* Uncovered Warning Alert */}
      {currentSelection.uncoveredComponentNames && currentSelection.uncoveredComponentNames.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Uncovered Affected Components Warning ({currentSelection.uncoveredComponentNames.length})
          </div>
          <p className="text-xs text-amber-300/80 mb-3">
            The following components are impacted by the change but lack explicit automated test coverage in the registry:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentSelection.uncoveredComponentNames.map((name, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800 font-mono text-xs text-amber-200"
              >
                &times; {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tests Table */}
<<<<<<< HEAD
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[850px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 whitespace-nowrap">Rank</th>
                <th className="py-3.5 px-4 min-w-[220px]">Test Suite</th>
                <th className="py-3.5 px-4 min-w-[300px]">Covered Affected Components</th>
                <th className="py-3.5 px-4 min-w-[220px]">Selection Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {currentSelection.selectedTests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No automated tests selected.
                  </td>
                </tr>
              ) : (
                currentSelection.selectedTests.map((test) => (
                  <tr key={test.testComponentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FBC02D] whitespace-nowrap">
                      #{test.selectionRank}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {test.testComponentName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {test.coveredComponentNames.map((cName, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {cName}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {test.selectionReason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
=======
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Test Suite</th>
              <th className="py-3 px-4">Covered Affected Components</th>
              <th className="py-3 px-4">Selection Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {currentSelection.selectedTests.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No automated tests selected.
                </td>
              </tr>
            ) : (
              currentSelection.selectedTests.map((test) => (
                <tr key={test.testComponentId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-400">
                    #{test.selectionRank}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                    {test.testComponentName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {test.coveredComponentNames.map((cName, idx) => (
                        <Badge key={idx} variant="default" size="sm">
                          {cName}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {test.selectionReason}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
      </div>
    </div>
  );
};
