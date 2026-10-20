import React, { useState } from 'react';
import { ImpactResult } from '../../types';
import { Badge } from '../../components/common/Badge';
import { getCriticalityBadge, getRiskColor } from '../../lib/utils';
import { PathVisualizer } from './PathVisualizer';
import { ChevronDown, ChevronRight, Info, Network } from 'lucide-react';

interface AffectedComponentsTableProps {
  impactResults: ImpactResult[];
}

export const AffectedComponentsTable: React.FC<AffectedComponentsTableProps> = ({ impactResults }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = impactResults.filter((ir) =>
    ir.componentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Filter affected components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-64"
        />
        <span className="text-xs font-mono text-slate-400">
          Showing {filtered.length} of {impactResults.length} affected components
        </span>
      </div>

      {/* Table Container */}
<<<<<<< HEAD
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-3 w-10"></th>
                <th className="py-3.5 px-4 min-w-[200px]">Component</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">Type</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">Criticality</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Impact Proximity</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[90px]">Depth</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">Risk Score</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">Blast Radius</th>
              </tr>
            </thead>
=======
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Component</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Criticality</th>
              <th className="py-3 px-4">Impact Proximity</th>
              <th className="py-3 px-4">Depth</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Blast Radius</th>
            </tr>
          </thead>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No affected components found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                const crit = getCriticalityBadge(item.criticality);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-800/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-brand-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                        {item.componentName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" size="sm">
                          {item.componentType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${crit.color}`}>
                          {crit.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={item.impactType === 'DIRECT' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {item.impactType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        Hop {item.depth}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-slate-100">{item.riskScore.toFixed(1)}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getRiskColor(
                              item.riskBand
                            )}`}
                          >
                            {item.riskBand}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {item.downstreamDependentsCount} dependents
                      </td>
                    </tr>

                    {/* Expandable Explanation & Factor Breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70 border-b border-slate-800">
                        <td colSpan={8} className="p-5">
                          <div className="space-y-4">
                            {/* Explanation Quote */}
                            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="text-xs font-semibold text-brand-300 mb-1 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-brand-400" />
                                Explainable Risk Justification
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {item.explanation}
                              </p>
                            </div>

                            {/* Shortest Path */}
                            <div>
                              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Network className="w-3.5 h-3.5 text-brand-400" />
                                Shortest Impact Propagation Chain
                              </div>
                              <PathVisualizer pathNames={item.shortestPath} />
                            </div>

                            {/* Multi-Factor Contribution Grid */}
                            <div>
                              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Sub-Factor Contributions to Risk Score
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Criticality</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.criticalityFactor.toFixed(1)}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Proximity</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.proximityFactor.toFixed(1)}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Blast Radius</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.blastRadiusFactor.toFixed(1)}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Change Category</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.categoryFactor.toFixed(1)}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Severity</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.severityFactor.toFixed(1)}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Req Bonus</div>
                                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                                    {item.criticalReqBonus.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
<<<<<<< HEAD
        </div>
=======
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
      </div>
    </div>
  );
};
