import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskGauge } from '../features/impact-analysis/RiskGauge';

describe('RiskGauge component', () => {
  it('renders numeric score and risk band correctly', () => {
    render(<RiskGauge score={84.5} band="CRITICAL" />);
    expect(screen.getByText('84.5')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders low risk band with formatted decimal', () => {
    render(<RiskGauge score={12.0} band="LOW" />);
    expect(screen.getByText('12.0')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });
});
