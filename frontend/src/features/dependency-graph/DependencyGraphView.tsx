import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GraphData, SoftwareComponent, AnalysisDetail } from '../../types';
import { CustomNode, CustomNodeData } from './CustomNode';
import { GraphLegend } from './GraphLegend';
import { getLayoutedElements } from '../../lib/graphLayout';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Search, Filter, RefreshCw, X, ArrowDownRight, ArrowUpRight, Zap } from 'lucide-react';

interface DependencyGraphViewProps {
  graphData: GraphData;
  activeAnalysis?: AnalysisDetail | null;
  onSimulateChange?: (componentId: string) => void;
}

const nodeTypes = {
  custom: CustomNode,
};

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  graphData,
  activeAnalysis,
  onSimulateChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<SoftwareComponent | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('ALL');
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

  // Build raw React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    // Map of impacted components from analysis if present
    const impactMap = new Map<string, { depth: number; riskScore: number; riskBand: string }>();
    if (activeAnalysis) {
      activeAnalysis.impactResults.forEach((ir) => {
        impactMap.set(ir.componentId, {
          depth: ir.depth,
          riskScore: ir.riskScore,
          riskBand: ir.riskBand,
        });
      });
    }

    const changedComponentId = activeAnalysis?.summary?.changedComponentId;

    const rawNodes: Node[] = graphData.nodes
      .filter((comp) => {
        if (typeFilter !== 'ALL' && comp.type !== typeFilter) return false;
        if (criticalityFilter !== 'ALL' && comp.criticality !== criticalityFilter) return false;
        if (searchQuery && !comp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .map((comp) => {
        const isChanged = comp.id === changedComponentId;
        const impact = impactMap.get(comp.id);
        const isDirect = impact?.depth === 1;
        const isTransitive = (impact?.depth || 0) > 1;

        const data: CustomNodeData = {
          component: comp,
          isChanged,
          isDirectImpact: isDirect,
          isTransitiveImpact: isTransitive,
          impactDepth: impact?.depth,
          riskBand: impact?.riskBand,
          riskScore: impact?.riskScore,
        };

        return {
          id: comp.id,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: data as unknown as Record<string, unknown>,
        };
      });

    const activeNodeIds = new Set(rawNodes.map((n) => n.id));

    const rawEdges: Edge[] = graphData.edges
      .filter((edge) => activeNodeIds.has(edge.sourceComponentId) && activeNodeIds.has(edge.targetComponentId))
      .map((edge) => {
        const isSourceImpacted = impactMap.has(edge.sourceComponentId) || edge.sourceComponentId === changedComponentId;
        const isTargetImpacted = impactMap.has(edge.targetComponentId) || edge.targetComponentId === changedComponentId;
        const isImpactPath = isSourceImpacted && isTargetImpacted;

        return {
          id: edge.id,
          source: edge.sourceComponentId,
          target: edge.targetComponentId,
          animated: isImpactPath,
          style: {
            stroke: isImpactPath ? '#f59e0b' : '#475569',
            strokeWidth: isImpactPath ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isImpactPath ? '#f59e0b' : '#475569',
            width: 16,
            height: 16,
          },
        };
      });

    return { initialNodes: rawNodes, initialEdges: rawEdges };
  }, [graphData, activeAnalysis, searchQuery, typeFilter, criticalityFilter]);

  // Layout with Dagre
  const applyLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [initialNodes, initialEdges, setNodes, setEdges]
  );

  useEffect(() => {
    applyLayout(layoutDirection);
  }, [applyLayout, layoutDirection]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const comp = graphData.nodes.find((c) => c.id === node.id);
      if (comp) {
        setSelectedNode(comp);
      }
    },
    [graphData.nodes]
  );

  // Incoming and outgoing dependencies of selected node
  const nodeDependencies = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const incoming = graphData.edges
      .filter((e) => e.targetComponentId === selectedNode.id)
      .map((e) => graphData.nodes.find((n) => n.id === e.sourceComponentId))
      .filter(Boolean) as SoftwareComponent[];

    const outgoing = graphData.edges
      .filter((e) => e.sourceComponentId === selectedNode.id)
      .map((e) => graphData.nodes.find((n) => n.id === e.targetComponentId))
      .filter(Boolean) as SoftwareComponent[];

    return { incoming, outgoing };
  }, [selectedNode, graphData]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden">
      {/* Control Filter Bar */}
      <div className="z-10 p-4 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 w-44"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Types</option>
              <option value="MODULE">Modules</option>
              <option value="CLASS">Classes</option>
              <option value="API">APIs</option>
              <option value="REQUIREMENT">Requirements</option>
              <option value="TEST">Tests</option>
            </select>
          </div>

          {/* Criticality Filter */}
          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Criticalities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Layout and Overview */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const next = layoutDirection === 'TB' ? 'LR' : 'TB';
              setLayoutDirection(next);
            }}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Direction: {layoutDirection === 'TB' ? 'Top \u2193 Bottom' : 'Left \u2192 Right'}
          </Button>

          <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-slate-800 border border-slate-700">
            {nodes.length} Nodes &bull; {edges.length} Edges
          </span>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 fill-slate-300" />
          <MiniMap
            nodeColor={(node) => {
              const d = node.data as unknown as CustomNodeData;
              if (d?.isChanged) return '#ef4444';
              if (d?.isDirectImpact) return '#f97316';
              if (d?.isTransitiveImpact) return '#f59e0b';
              return '#14b8a6';
            }}
            className="!bg-slate-900/90 !border !border-slate-800 rounded-lg"
          />
        </ReactFlow>

        {/* Bottom Left Legend */}
        <div className="absolute bottom-6 left-6 z-10 max-w-xs pointer-events-auto">
          <GraphLegend />
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 max-h-[85vh] overflow-y-auto animate-in slide-in-from-right duration-200">
            <Card className="bg-slate-900/95 border-slate-700 shadow-2xl backdrop-blur-md p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">{selectedNode.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" size="sm">{selectedNode.type}</Badge>
                    <Badge
                      variant={selectedNode.criticality === 'CRITICAL' ? 'danger' : selectedNode.criticality === 'HIGH' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {selectedNode.criticality}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedNode.description && (
                <p className="text-xs text-slate-400 mb-3">{selectedNode.description}</p>
              )}

              {selectedNode.sourcePath && (
                <div className="text-[11px] font-mono text-slate-400 mb-3 p-2 rounded bg-slate-950/70 border border-slate-800 truncate">
                  {selectedNode.sourcePath}
                </div>
              )}

              {/* Action: Simulate Change */}
              {onSimulateChange && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onSimulateChange(selectedNode.id)}
                  className="w-full mb-3 text-xs"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                  Simulate Change Impact
                </Button>
              )}

              {/* Incoming Dependencies */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-brand-400" />
                  Dependents ({nodeDependencies.incoming.length})
                </div>
                {nodeDependencies.incoming.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">No incoming dependents</div>
                ) : (
                  <div className="space-y-1">
                    {nodeDependencies.incoming.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedNode(inc)}
                        className="p-1.5 rounded bg-slate-950/50 border border-slate-800 hover:border-brand-500 text-xs font-mono text-slate-300 cursor-pointer truncate"
                      >
                        {inc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Dependencies */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  Depends On ({nodeDependencies.outgoing.length})
                </div>
                {nodeDependencies.outgoing.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">No outgoing dependencies</div>
                ) : (
                  <div className="space-y-1">
                    {nodeDependencies.outgoing.map((out) => (
                      <div
                        key={out.id}
                        onClick={() => setSelectedNode(out)}
                        className="p-1.5 rounded bg-slate-950/50 border border-slate-800 hover:border-sky-500 text-xs font-mono text-slate-300 cursor-pointer truncate"
                      >
                        {out.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
