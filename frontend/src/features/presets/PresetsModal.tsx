import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PresetInfo } from '../../types';
import { api } from '../../services/api';
<<<<<<< HEAD
import { Sparkles, ArrowRight, CheckCircle2, ShoppingCart, CreditCard, Mail, RefreshCw } from 'lucide-react';
=======
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c

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
<<<<<<< HEAD
              title: '🛒 Scenario 1: Refactoring Order Database (High Blast Radius)',
              description: 'Modifying the core Order persistence entity. Shows how database changes ripple outward to services, controllers, and public checkout APIs.',
              componentName: 'OrderRepository',
              category: 'DATA_MODEL_CHANGE',
              severity: 'CRITICAL',
              expectedOutcome: 'Affects 5 components across 3 tiers (OrderService, CheckoutController, Checkout API). Highlights 50% regression test reduction via greedy set cover.',
            },
            {
              key: 'public-api-interface',
              title: '💳 Scenario 2: Stripe Payment Gateway Upgrade (Critical Security Impact)',
              description: 'Updating payment gateway interface to Stripe v2. Touches credit card tokenization, compliance requirements, and customer billing.',
              componentName: 'PaymentService',
              category: 'INTERFACE_CHANGE',
              severity: 'HIGH',
              expectedOutcome: 'Propagates to OrderService and public APIs; links to PCI-DSS compliance requirements and triggers security test prioritization.',
            },
            {
              key: 'isolated-utility-fix',
              title: '✉️ Scenario 3: Email Receipt Formatting Fix (Low-Risk Isolated Change)',
              description: 'Fixing a minor HTML character escaping issue in the email receipt helper.',
              componentName: 'EmailTemplateHelper',
              category: 'LOGIC_CHANGE',
              severity: 'LOW',
              expectedOutcome: 'Safe, localized change affecting only NotificationWorker. Demonstrates LOW risk score (<35) and selects just 1 fast unit test.',
            },
            {
              key: 'cycle-diamond-mesh',
              title: '🔄 Scenario 4: Circular Loop & Diamond Mesh (Algorithm Safety)',
              description: 'Tests a complex architectural diamond graph with an intentional circular loop between services.',
              componentName: 'DiamondServiceA',
              category: 'LOGIC_CHANGE',
              severity: 'HIGH',
              expectedOutcome: 'Validates 3-color cycle detection preventing infinite recursion while cleanly resolving multi-path convergence.',
=======
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
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
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

<<<<<<< HEAD
  const getPresetIcon = (key: string) => {
    switch (key) {
      case 'core-db-schema':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      case 'public-api-interface':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case 'isolated-utility-fix':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'cycle-diamond-mesh':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
  };

=======
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
<<<<<<< HEAD
      title="Interactive Demonstration Presets"
      description="Pick any real-world software change scenario below to instantly run impact analysis, calculate explainable risk scores, and optimize regression tests."
=======
      title="Quick Demonstration Presets"
      description="One-click realistic software change scenarios demonstrating full-stack impact intelligence with zero manual data entry."
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
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
<<<<<<< HEAD
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80">
                      {getPresetIcon(preset.key)}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                      {preset.title}
                    </h4>
                  </div>
=======
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                    {preset.title}
                  </h4>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
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

<<<<<<< HEAD
                <p className="text-xs text-slate-300 mt-1 mb-2.5 leading-relaxed">{preset.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-emerald-300">What It Proves:</strong> {preset.expectedOutcome}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-400">
                  Target Component: <strong className="text-brand-400">{preset.componentName}</strong>
=======
                <p className="text-xs text-slate-400 mb-2">{preset.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-200">Expected Outcome:</strong> {preset.expectedOutcome}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-400">
                  Target: <strong className="text-brand-400">{preset.componentName}</strong>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  isLoading={loadingKey === preset.key}
                  onClick={() => handleRunPreset(preset.key)}
<<<<<<< HEAD
                  className="shadow-sm shadow-brand-900/40 text-xs font-semibold px-4"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  1-Click Run & Analyze
=======
                  className="shadow-sm shadow-brand-900/40 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Run Preset Now
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
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
