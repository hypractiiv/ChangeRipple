import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { SoftwareComponent } from '../../types';
import { getCriticalityBadge } from '../../lib/utils';
import { Box, Code, Globe, ShieldCheck, CheckSquare } from 'lucide-react';

export interface CustomNodeData {
  component: SoftwareComponent;
  isChanged?: boolean;
  isDirectImpact?: boolean;
  isTransitiveImpact?: boolean;
  impactDepth?: number;
  riskBand?: string;
  riskScore?: number;
}

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const { component, isChanged, isDirectImpact, isTransitiveImpact, impactDepth, riskScore } = nodeData;

  const typeIcons = {
    MODULE: Box,
    CLASS: Code,
    API: Globe,
    REQUIREMENT: ShieldCheck,
    TEST: CheckSquare,
  };

  const Icon = typeIcons[component.type] || Code;
  const crit = getCriticalityBadge(component.criticality);

  // Dynamic glow and border for impact highlighting
  let borderStyle = 'border-slate-800 bg-slate-900/90';
  let badgeLabel = null;

  if (isChanged) {
    borderStyle = 'border-[#C62828] bg-red-950/80 shadow-lg shadow-red-500/40 ring-2 ring-[#C62828]/60';
    badgeLabel = 'CHANGED';
  } else if (isDirectImpact) {
    borderStyle = 'border-[#FF8F00] bg-orange-950/80 shadow-md shadow-orange-500/30';
    badgeLabel = `DIRECT (depth 1)`;
  } else if (isTransitiveImpact) {
    borderStyle = 'border-[#FBC02D] bg-amber-950/60 shadow-sm shadow-amber-500/30';
    badgeLabel = `TRANSITIVE (depth ${impactDepth})`;
  } else if (selected) {
    borderStyle = 'border-amber-400 bg-slate-900 shadow-md shadow-amber-500/30 ring-2 ring-amber-400';
  }

  return (
    <div
      className={`min-w-[220px] max-w-[280px] rounded-xl border p-3.5 transition-all duration-200 cursor-pointer backdrop-blur-md ${borderStyle}`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#FBC02D] !border-slate-900" />

      {badgeLabel && (
        <div className="mb-1.5 flex justify-between items-center">
          <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-950/80 text-white border border-current">
            {badgeLabel}
          </span>
          {riskScore !== undefined && (
            <span className="text-[10px] font-mono font-bold text-slate-200">
              Score: {riskScore}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-slate-800 text-[#FBC02D] shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs font-semibold text-slate-100 truncate flex-1 font-mono" title={component.name}>
          {component.name}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="font-mono text-slate-400">{component.type}</span>
        <span className={`px-1.5 py-0.2 rounded border font-mono ${crit.color}`}>
          {crit.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-brand-500 !border-slate-900" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
