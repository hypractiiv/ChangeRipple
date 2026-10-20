import React from 'react';
import { ArrowRight, Box } from 'lucide-react';

interface PathVisualizerProps {
  pathNames: string[];
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({ pathNames }) => {
  if (!pathNames || pathNames.length === 0) {
    return <span className="text-xs text-slate-500 italic">No path reconstructed</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {pathNames.map((name, idx) => {
        const isRoot = idx === pathNames.length - 1;
        const isSource = idx === 0;

        return (
          <React.Fragment key={idx}>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                isRoot
                  ? 'bg-red-950/80 border-red-800 text-red-300'
                  : isSource
                  ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Box className="w-3 h-3 opacity-70" />
              <span>{name}</span>
              {isRoot && <span className="text-[9px] font-bold text-red-400 uppercase ml-1">(Root)</span>}
            </div>
            {!isRoot && <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
