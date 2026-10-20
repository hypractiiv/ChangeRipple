import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegressionTestView } from '../features/regression-tests/RegressionTestView';
import { RegressionTestSelection } from '../types';

describe('RegressionTestView component', () => {
  const mockGreedy: RegressionTestSelection = {
    strategy: 'GREEDY',
    candidateTestCount: 4,
    selectedTestCount: 2,
    testSuiteReductionPercent: 50.0,
    testCoveragePercent: 80.0,
    affectedRuntimeComponentCount: 5,
    coveredComponentCount: 4,
    uncoveredComponentCount: 1,
    coveredComponentIds: ['c1', 'c2', 'c3', 'c4'],
    uncoveredComponentIds: ['c5'],
    uncoveredComponentNames: ['UncoveredNotificationWorker'],
    selectedTests: [
      {
        id: 'st-1',
        testComponentId: 't1',
        testComponentName: 'E2EOrderPlacementSuite',
        selectionStrategy: 'GREEDY',
        selectionRank: 1,
        coveredComponentNames: ['OrderService', 'OrderRepository'],
        selectionReason: 'Covers 2 affected components',
      },
    ],
  };

  it('renders test suite reduction percentage and selected test suites', () => {
    render(<RegressionTestView greedySelection={mockGreedy} />);
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('E2EOrderPlacementSuite')).toBeInTheDocument();
    expect(screen.getByText('Covers 2 affected components')).toBeInTheDocument();
  });

  it('displays uncovered components warning banner when uncovered targets exist', () => {
    render(<RegressionTestView greedySelection={mockGreedy} />);
    expect(screen.getByText(/Uncovered Affected Components Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/UncoveredNotificationWorker/i)).toBeInTheDocument();
  });
});
