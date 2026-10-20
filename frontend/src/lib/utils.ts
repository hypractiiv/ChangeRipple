import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Criticality, RiskBand } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getRiskColor(band: RiskBand | undefined): string {
  switch (band) {
    case 'CRITICAL':
      return 'text-[#FF5252] bg-[#C62828]/20 border-[#C62828]/60';
    case 'HIGH':
      return 'text-[#FFA726] bg-[#FF8F00]/20 border-[#FF8F00]/60';
    case 'MEDIUM':
      return 'text-[#FDD835] bg-[#FBC02D]/20 border-[#FBC02D]/60';
    case 'LOW':
    default:
      return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
  }
}

export function getCriticalityBadge(crit: Criticality | undefined): { color: string; label: string } {
  switch (crit) {
    case 'CRITICAL':
      return { color: 'bg-[#C62828]/15 text-[#FF5252] border-[#C62828]/40', label: 'CRITICAL' };
    case 'HIGH':
      return { color: 'bg-[#FF8F00]/15 text-[#FFA726] border-[#FF8F00]/40', label: 'HIGH' };
    case 'MEDIUM':
      return { color: 'bg-[#FBC02D]/15 text-[#FDD835] border-[#FBC02D]/40', label: 'MEDIUM' };
    case 'LOW':
    default:
      return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'LOW' };
  }
}
