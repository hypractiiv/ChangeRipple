import React, { useState, useEffect } from 'react';
import { Project, ChangeRequest, SoftwareComponent, ChangeCategory, ChangeSeverity } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CreateChangeModal } from './CreateChangeModal';
import { formatDate } from '../../lib/utils';
import {
  GitPullRequest,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ChangeRequestsPageProps {
  project: Project;
  onRunAnalysis: (changeRequestId: string) => void;
  onViewAnalysis: (analysisId: string) => void;
}

export const ChangeRequestsPage: React.FC<ChangeRequestsPageProps> = ({
  project,
  onRunAnalysis,
  onViewAnalysis,
}) => {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [components, setComponents] = useState<SoftwareComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    if (!project?.id) return;
    setIsLoading(true);
    Promise.all([
      api.changes.list(project.id, 0, 50),
      api.components.list(project.id, { size: 100 }),
    ])
      .then(([changesPaged, compsPaged]) => {
        setChanges(changesPaged.content);
        setComponents(compsPaged.content);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [project?.id]);

  const handleCreateChange = async (data: {
    changedComponentId: string;
    title: string;
    description: string;
    category: ChangeCategory;
    severity: ChangeSeverity;
  }) => {
    await api.changes.create(project.id, data);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 mb-1">
            <GitPullRequest className="w-4 h-4" />
            <span>Change Management Lifecycle</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Change Requests & Impact Runs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track proposed architectural revisions and trigger intelligent downstream impact evaluations.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          New Change Request
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading change requests..." />
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Target Component</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {changes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No change requests created for this project yet. Click "New Change Request" to begin.
                  </td>
                </tr>
              ) : (
                changes.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{cr.title}</div>
                      {cr.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{cr.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-brand-300">
                      {cr.changedComponentName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">{cr.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={cr.severity === 'CRITICAL' ? 'danger' : cr.severity === 'HIGH' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {cr.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        {cr.status === 'COMPLETED' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : cr.status === 'RUNNING' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : cr.status === 'FAILED' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="text-slate-300">{cr.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {cr.authorName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatDate(cr.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {cr.latestAnalysisRunId ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onViewAnalysis(cr.latestAnalysisRunId!)}
                          className="text-xs"
                        >
                          View Results
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onRunAnalysis(cr.id)}
                          className="text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        components={components}
        onSubmit={handleCreateChange}
      />
    </div>
  );
};
