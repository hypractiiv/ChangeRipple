import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PresetInfo } from '../../types';
import { api } from '../../services/api';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisLoaded: (analysisId: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose, onAnalysisLoaded }) => {
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      api.presets.list()
        .then(setPresets)
        .catch(() => {
          // Fallback static preset definitions
          setPresets([
            {
              key: 'core-db-schema',
              title: 'Core Data Model Mutation (OrderRepository)',
              description: 'Refactor Order persistence entity to support fractional multi-currency balances and VAT isolation.',
              componentName: 'OrderRepository',
              category: 'DATA_MODEL_CHANGE',
              severity: 'CRITICAL',
              expectedOutcome: 'High blast radius across 5 components (OrderService, CheckoutController, Checkout API) with 50% test suite reduction.',
            },
            {
              key: 'public-api-interface',
              title: 'Payment Webhook Interface Alteration (PaymentService)',
              description: 'Stripe v2 API upgrade updating token validation and webhook signatures.',
              componentName: 'PaymentService',
              category: 'INTERFACE_CHANGE',
              severity: 'HIGH',
              expectedOutcome: 'Affects OrderService and public payment APIs; traces to PCI-DSS compliance requirement.',
            },
            {
              key: 'isolated-utility-fix',
              title: 'Isolated Notification Template Fix (EmailTemplateHelper)',
              description: 'Patch character escaping in email receipt template helper.',
              componentName: 'EmailTemplateHelper',
              category: 'LOGIC_CHANGE',
              severity: 'LOW',
              expectedOutcome: 'Low blast radius affecting only NotificationWorker; LOW risk score with minimal regression test needed.',
            },
            {
              key: 'cycle-diamond-mesh',
              title: 'Circular & Diamond Mesh Demonstration',
              description: 'Demonstrates cycle-breaking traversal safety, multi-path convergence, and deterministic tie-breaking.',
              componentName: 'DiamondServiceA',
              category: 'LOGIC_CHANGE',
              severity: 'HIGH',
              expectedOutcome: 'Safely traverses diamond dependency and circular loop without infinite recursion.',
            },
          ]);
        });
    }
  }, [isOpen]);

  const handleRunPreset = async (key: string) => {
    setLoadingKey(key);
    setError(null);
    try {
      const result = await api.presets.load(key);
      onAnalysisLoaded(result.summary.id);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to load and execute demonstration preset.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Demonstration Presets"
      description="One-click realistic software change scenarios demonstrating full-stack impact intelligence with zero manual data entry."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3.5">
          {presets.map((preset) => (
            <div
              key={preset.key}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                    {preset.title}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="info" size="sm">{preset.category}</Badge>
                    <Badge
                      variant={preset.severity === 'CRITICAL' ? 'danger' : preset.severity === 'HIGH' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {preset.severity}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-2">{preset.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-200">Expected Outcome:</strong> {preset.expectedOutcome}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-400">
                  Target: <strong className="text-brand-400">{preset.componentName}</strong>
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  isLoading={loadingKey === preset.key}
                  onClick={() => handleRunPreset(preset.key)}
                  className="shadow-sm shadow-brand-900/40 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Run Preset Now
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
