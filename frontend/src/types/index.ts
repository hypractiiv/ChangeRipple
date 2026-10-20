export type ComponentType = 'MODULE' | 'CLASS' | 'API' | 'REQUIREMENT' | 'TEST';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DependencyType = 'RUNTIME' | 'TEST_COVERAGE' | 'REQUIREMENT_TRACED';
export type ChangeCategory = 'LOGIC_CHANGE' | 'INTERFACE_CHANGE' | 'DATA_MODEL_CHANGE' | 'CONFIGURATION_CHANGE' | 'SECURITY_CHANGE';
export type ChangeSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'NONE';
  componentCount: number;
  dependencyCount: number;
  changeRequestCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SoftwareComponent {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  type: ComponentType;
  description?: string;
  criticality: Criticality;
  sourcePath?: string;
  metadataJson?: string;
  incomingDependencyCount: number;
  outgoingDependencyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Dependency {
  id: string;
  projectId: string;
  sourceComponentId: string;
  sourceComponentName: string;
  targetComponentId: string;
  targetComponentName: string;
  dependencyType: DependencyType;
  description?: string;
  createdAt: string;
}

export interface TestCoverage {
  id: string;
  projectId: string;
  testComponentId: string;
  testComponentName: string;
  targetComponentId: string;
  targetComponentName: string;
  coverageType: string;
  createdAt: string;
}

export interface GraphValidation {
  valid: boolean;
  hasCycles: boolean;
  cycles: string[][];
  errors: string[];
  warnings: string[];
}

export interface GraphData {
  projectId: string;
  projectName: string;
  nodes: SoftwareComponent[];
  edges: Dependency[];
  validation?: GraphValidation;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  projectName: string;
  changedComponentId: string;
  changedComponentName: string;
  title: string;
  description?: string;
  category: ChangeCategory;
  severity: ChangeSeverity;
  status: AnalysisStatus;
  authorId: string;
  authorName: string;
  latestAnalysisRunId?: string;
  latestRiskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRunSummary {
  id: string;
  changeRequestId: string;
  changeRequestTitle: string;
  changedComponentId: string;
  changedComponentName: string;
  projectId: string;
  status: string;
  overallRiskScore: number;
  overallRiskBand: RiskBand;
  totalAffectedComponents: number;
  directAffectedCount: number;
  transitiveAffectedCount: number;
  maxImpactDepth: number;
  candidateTestCount: number;
  selectedTestCount: number;
  testSuiteReductionPercent: number;
  testCoveragePercent: number;
  uncoveredComponentCount: number;
  algorithmVersion: string;
  executedAt: string;
}

export interface ImpactResult {
  id: string;
  componentId: string;
  componentName: string;
  componentType: ComponentType;
  criticality: Criticality;
  impactType: 'DIRECT' | 'TRANSITIVE';
  depth: number;
  shortestPath: string[];
  downstreamDependentsCount: number;
  riskScore: number;
  riskBand: RiskBand;
  criticalityFactor: number;
  proximityFactor: number;
  blastRadiusFactor: number;
  categoryFactor: number;
  severityFactor: number;
  criticalReqBonus: number;
  factorContributions?: Record<string, number>;
  explanation: string;
}

export interface SelectedTest {
  id: string;
  testComponentId: string;
  testComponentName: string;
  selectionStrategy: 'BASIC' | 'GREEDY';
  selectionRank: number;
  coveredComponentIds?: string[];
  coveredComponentNames: string[];
  selectionReason: string;
}

export interface RegressionTestSelection {
  strategy: 'BASIC' | 'GREEDY';
  candidateTestCount: number;
  selectedTestCount: number;
  testSuiteReductionPercent: number;
  testCoveragePercent: number;
  affectedRuntimeComponentCount: number;
  coveredComponentCount: number;
  uncoveredComponentCount: number;
  coveredComponentIds: string[];
  uncoveredComponentIds: string[];
  uncoveredComponentNames: string[];
  selectedTests: SelectedTest[];
}

export interface AnalysisDetail {
  summary: AnalysisRunSummary;
  impactResults: ImpactResult[];
  basicTestSelection?: RegressionTestSelection;
  greedyTestSelection?: RegressionTestSelection;
}

export interface ComponentDiff {
  componentId: string;
  componentName: string;
  componentType: string;
  criticality: string;
  diffType: 'NEWLY_AFFECTED' | 'NO_LONGER_AFFECTED' | 'MODIFIED_RISK' | 'UNCHANGED';
  run1RiskScore?: number;
  run2RiskScore?: number;
  scoreDelta?: number;
  run1Depth?: number;
  run2Depth?: number;
  explanation: string;
}

export interface TestDiff {
  testComponentId: string;
  testComponentName: string;
  diffStatus: 'ADDED' | 'REMOVED' | 'RETAINED';
  selectionReason?: string;
}

export interface HistoryCompareResponse {
  baselineRun: AnalysisRunSummary;
  comparisonRun: AnalysisRunSummary;
  newlyAffectedCount: number;
  noLongerAffectedCount: number;
  commonAffectedCount: number;
  overallRiskScoreDelta: number;
  testCoverageDelta: number;
  testSuiteReductionDelta: number;
  componentDiffs: ComponentDiff[];
  testDiffs: TestDiff[];
}

export interface PresetInfo {
  key: string;
  title: string;
  description: string;
  componentName: string;
  category: ChangeCategory;
  severity: ChangeSeverity;
  expectedOutcome: string;
}

export interface ParsedProjectPreviewDto {
  packageName: string;
  detectedComponents: Array<{
    name: string;
    type: ComponentType;
    criticality: Criticality;
    description?: string;
    sourcePath?: string;
  }>;
  detectedDependencies: Array<{
    sourceComponentId: string;
    targetComponentId: string;
    dependencyType: string;
    description?: string;
  }>;
  warnings: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}
