import React from 'react';
import { Card } from '../../components/common/Card';
import { ArrowRight, HelpCircle } from 'lucide-react';

export const GraphLegend: React.FC = () => {
  return (
    <Card className="p-3 bg-slate-900/90 border-slate-800 text-xs backdrop-blur-md">
      <div className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
        Graph Convention & Legend
      </div>

      <div className="p-2 rounded bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 mb-2.5">
        <div className="flex items-center gap-1.5 text-brand-300 font-bold mb-0.5">
          <span>Component A</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>Component B</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Means <strong className="text-slate-200">A depends on B</strong>. If B is modified, impact flows backwards to A.
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mb-1">Impact Highlights</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] ring-2 ring-[#C62828]/50" />
          <span className="text-slate-300">Changed Root Component</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8F00] ring-2 ring-[#FF8F00]/50" />
          <span className="text-slate-300">Direct Impact (Depth 1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBC02D] ring-2 ring-[#FBC02D]/50" />
          <span className="text-slate-300">Transitive Impact (Depth &gt; 1)</span>
        </div>
      </div>
    </Card>
  );
};
