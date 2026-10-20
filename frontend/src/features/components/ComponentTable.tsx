import React, { useState, useEffect } from 'react';
import { Project, SoftwareComponent, ComponentType, Criticality } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ComponentModal } from './ComponentModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getCriticalityBadge } from '../../lib/utils';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Zap,
  Box,
  Code,
  Globe,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';

interface ComponentTableProps {
  project: Project;
  onSimulateChange: (componentId: string) => void;
}

export const ComponentTable: React.FC<ComponentTableProps> = ({ project, onSimulateChange }) => {
  const [components, setComponents] = useState<SoftwareComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [critFilter, setCritFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SoftwareComponent | null>(null);

  const fetchComponents = () => {
    if (!project?.id) return;
    setIsLoading(true);
    api.components
      .list(project.id, {
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        criticality: critFilter !== 'ALL' ? critFilter : undefined,
        search: search ? search : undefined,
        size: 100,
      })
      .then((paged) => setComponents(paged.content))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchComponents();
  }, [project?.id, typeFilter, critFilter, search]);

  const handleCreateOrUpdate = async (data: Partial<SoftwareComponent>) => {
    if (editingComponent) {
      await api.components.update(editingComponent.id, data);
    } else {
      await api.components.create(project.id, data);
    }
    fetchComponents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete component "${name}"? All connected dependencies will be removed.`)) {
      await api.components.delete(id);
      fetchComponents();
    }
  };

  const typeIcons = {
    MODULE: Box,
    CLASS: Code,
    API: Globe,
    REQUIREMENT: ShieldCheck,
    TEST: CheckSquare,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Component Architecture Explorer</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage architectural components, structural tiers, and dependency connections.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingComponent(null);
            setIsModalOpen(true);
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Component
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Types</option>
              <option value="MODULE">MODULE</option>
              <option value="CLASS">CLASS</option>
              <option value="API">API</option>
              <option value="REQUIREMENT">REQUIREMENT</option>
              <option value="TEST">TEST</option>
            </select>
          </div>

          <select
            value={critFilter}
            onChange={(e) => setCritFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Criticalities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {components.length} components registered
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading architecture components..." />
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">Dependents (Incoming)</th>
                <th className="py-3 px-4">Dependencies (Outgoing)</th>
                <th className="py-3 px-4">Source Path</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {components.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No components found matching filters.
                  </td>
                </tr>
              ) : (
                components.map((comp) => {
                  const Icon = typeIcons[comp.type] || Code;
                  const crit = getCriticalityBadge(comp.criticality);

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-slate-800 text-brand-400 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-slate-100">{comp.name}</div>
                            {comp.description && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{comp.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" size="sm">{comp.type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${crit.color}`}>
                          {crit.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {comp.incomingDependencyCount} components
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {comp.outgoingDependencyCount} components
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 truncate max-w-xs">
                        {comp.sourcePath || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSimulateChange(comp.id)}
                            title="Simulate Change Impact"
                            className="p-1.5 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingComponent(comp);
                              setIsModalOpen(true);
                            }}
                            title="Edit Component"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp.id, comp.name)}
                            title="Delete Component"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <ComponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingComponent}
      />
    </div>
  );
};
