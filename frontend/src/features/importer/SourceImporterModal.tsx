import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ParsedProjectPreviewDto } from '../../types';
import { apiClient } from '../../services/api';
import { Code2, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SourceImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onImportComplete: () => void;
}

export const SourceImporterModal: React.FC<SourceImporterModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onImportComplete,
}) => {
  const [sourceCode, setSourceCode] = useState(`package com.example.billing;

import com.example.orders.OrderService;
import com.example.common.AuditLogger;

public class BillingGatewayService {
    private OrderService orderService;
    private AuditLogger auditLogger;

    public void processPayment() {
        // ...
    }
}`);
  const [fileName, setFileName] = useState('BillingGatewayService.java');
  const [preview, setPreview] = useState<ParsedProjectPreviewDto | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePreview = async () => {
    setIsParsing(true);
    setError(null);
    setPreview(null);
    try {
      const res = await apiClient.post(`/projects/${projectId}/import/preview`, {
        fileName,
        sourceCode,
      });
      setPreview(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to parse Java source syntax.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    setIsApplying(true);
    setError(null);
    try {
      const res = await apiClient.post(`/projects/${projectId}/import/apply`, preview);
      setSuccessMessage(
        `Import applied! Added ${res.data.data.componentsImported} components and ${res.data.data.dependenciesImported} dependencies.`
      );
      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to apply imported components.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Static Java Source Code Importer"
      description="Extract architectural components and dependency relationships directly from Java syntax AST using JavaParser."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Architecture Disclaimer */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Notice on Static Import Analysis</strong>: Code AST scanning identifies explicit class imports and
            declarations without executing code. Runtime dynamic reflection, Spring dependency injection, and database
            triggers must be supplemented with runtime dependency mappings.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Java Source Code</label>
          <textarea
            rows={7}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="secondary" size="sm" onClick={handlePreview} isLoading={isParsing}>
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Parse AST & Preview
          </Button>

          {preview && (
            <Button variant="primary" size="sm" onClick={handleApply} isLoading={isApplying}>
              Confirm & Import Architecture
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>

        {/* Preview Results */}
        {preview && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200">
              AST Parse Preview: Package <code className="text-brand-400">{preview.packageName}</code>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Detected Components:</div>
              <div className="flex flex-wrap gap-1.5">
                {preview.detectedComponents.map((c, i) => (
                  <Badge key={i} variant="default" size="sm">
                    {c.name} ({c.type})
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Detected Static Import Edges:</div>
              <div className="flex flex-wrap gap-1.5">
                {preview.detectedDependencies.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    {d.sourceComponentId} &rarr; {d.targetComponentId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
