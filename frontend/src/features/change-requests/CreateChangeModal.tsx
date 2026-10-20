import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { SoftwareComponent, ChangeCategory, ChangeSeverity } from '../../types';

interface CreateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: SoftwareComponent[];
  preselectedComponentId?: string;
  onSubmit: (data: {
    changedComponentId: string;
    title: string;
    description: string;
    category: ChangeCategory;
    severity: ChangeSeverity;
  }) => Promise<void>;
}

export const CreateChangeModal: React.FC<CreateChangeModalProps> = ({
  isOpen,
  onClose,
  components,
  preselectedComponentId,
  onSubmit,
}) => {
  const [changedComponentId, setChangedComponentId] = useState(preselectedComponentId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChangeCategory>('LOGIC_CHANGE');
  const [severity, setSeverity] = useState<ChangeSeverity>('MEDIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedComponentId) {
      setChangedComponentId(preselectedComponentId);
    } else if (components.length > 0 && !changedComponentId) {
      setChangedComponentId(components[0].id);
    }
  }, [preselectedComponentId, components]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        changedComponentId,
        title,
        description,
        category,
        severity,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create change request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Change Request"
      description="Propose a software change, specify the target component, and configure category and severity for impact analysis."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Changed Component</label>
          <select
            value={changedComponentId}
            onChange={(e) => setChangedComponentId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
          >
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type} &bull; {c.criticality})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Change Request Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Upgrade Stripe Webhook API Signature to v2"
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Change Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ChangeCategory)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="LOGIC_CHANGE">LOGIC_CHANGE</option>
              <option value="INTERFACE_CHANGE">INTERFACE_CHANGE</option>
              <option value="DATA_MODEL_CHANGE">DATA_MODEL_CHANGE</option>
              <option value="CONFIGURATION_CHANGE">CONFIGURATION_CHANGE</option>
              <option value="SECURITY_CHANGE">SECURITY_CHANGE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ChangeSeverity)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description & Rationales</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail proposed modifications, affected database schemas, or API signature breaks..."
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Change Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
