import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Project, GraphData, AnalysisDetail } from '../types';
import { api } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { AuthModal } from './AuthModal';
import { PresetsModal } from '../features/presets/PresetsModal';
import { SourceImporterModal } from '../features/importer/SourceImporterModal';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DependencyGraphView } from '../features/dependency-graph/DependencyGraphView';
import { ComponentTable } from '../features/components/ComponentTable';
import { ChangeRequestsPage } from '../features/change-requests/ChangeRequestsPage';
import { ImpactAnalysisWorkspace } from '../features/impact-analysis/ImpactAnalysisWorkspace';
import { HistoryComparePage } from '../features/history/HistoryComparePage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const App: React.FC = () => {
<<<<<<< HEAD
  const { isAuthenticated, openAuthModal, login } = useAuth();
=======
  const { isAuthenticated, openAuthModal } = useAuth();
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [activeAnalysisDetail, setActiveAnalysisDetail] = useState<AnalysisDetail | null>(null);

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load accessible projects
  const fetchProjects = async () => {
    try {
      const paged = await api.projects.list();
      setProjects(paged.content);
      if (paged.content.length > 0 && !selectedProject) {
        setSelectedProject(paged.content[0]);
      }
    } catch {
      // Not logged in or network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load graph data for selected project
  const fetchGraph = async (projectId: string) => {
    try {
      const data = await api.graph.get(projectId);
      setGraphData(data);
    } catch (err) {
      console.error('Failed to fetch graph data', err);
    }
  };

  useEffect(() => {
    if (selectedProject?.id) {
      fetchGraph(selectedProject.id);
    }
  }, [selectedProject?.id]);

  // Load analysis detail if activeAnalysisId changes
  useEffect(() => {
    if (activeAnalysisId) {
      api.analysis.get(activeAnalysisId)
        .then(setActiveAnalysisDetail)
        .catch(() => setActiveAnalysisDetail(null));
    }
  }, [activeAnalysisId]);

  const handleSimulateChange = (_componentId: string) => {
    setCurrentTab('changes');
  };

  const handleRunAnalysisFromChange = async (changeId: string) => {
    setIsLoading(true);
    try {
      const detail = await api.analysis.run(changeId);
      setActiveAnalysisId(detail.summary.id);
      setActiveAnalysisDetail(detail);
      setCurrentTab('analysis');
    } catch (err) {
      console.error('Failed to run analysis', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    setActiveAnalysisId(analysisId);
    setCurrentTab('analysis');
  };

  const handlePresetAnalysisLoaded = (analysisId: string) => {
    setActiveAnalysisId(analysisId);
    setCurrentTab('analysis');
    if (selectedProject?.id) {
      fetchGraph(selectedProject.id);
    }
  };

<<<<<<< HEAD
  const handleQuickEvaluation = async () => {
    setIsLoading(true);
    try {
      await login('admin', 'password123');
    } catch (err) {
      console.error('Quick evaluation login failed', err);
      openAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

=======
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(p) => {
          setSelectedProject(p);
          setActiveAnalysisId(null);
          setActiveAnalysisDetail(null);
        }}
<<<<<<< HEAD
        onOpenPresets={() => setIsPresetsOpen(true)}
=======
        onOpenPresets={() => {
          if (!isAuthenticated) {
            openAuthModal();
          } else {
            setIsPresetsOpen(true);
          }
        }}
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
      />

      <main className="flex-1 flex flex-col">
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
<<<<<<< HEAD
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FBC02D]/20 to-[#FF8F00]/20 border border-[#FBC02D]/40 text-[#FBC02D] flex items-center justify-center mx-auto shadow-lg shadow-orange-950/30">
=======
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
                <span className="text-2xl font-bold font-mono">CR</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                ChangeRipple Intelligence
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze software dependencies as a directed graph, evaluate downstream ripple effects,
                calculate explainable risk scores, and optimize regression suites.
              </p>
<<<<<<< HEAD

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleQuickEvaluation}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FBC02D] to-[#FF8F00] hover:from-[#FDD835] hover:to-[#FFA000] text-slate-950 font-bold text-sm transition-all shadow-md shadow-orange-950/50 flex items-center justify-center gap-2 border border-amber-300/50"
                >
                  <span>⚡ 1-Click Evaluation (Sign In as Admin)</span>
                </button>

                <button
                  onClick={() => setIsPresetsOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>✨ Explore Demonstration Presets</span>
                </button>

                <button
                  onClick={openAuthModal}
                  className="text-xs text-slate-400 hover:text-[#FBC02D] transition-colors pt-1 block mx-auto"
                >
                  Switch Account or Sign In Manually →
                </button>
              </div>
=======
              <button
                onClick={openAuthModal}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-md shadow-brand-900/40"
              >
                Sign In or Evaluate Platform
              </button>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
            </div>
          </div>
        ) : isLoading ? (
          <LoadingSpinner message="Initializing ChangeRipple workspace..." />
        ) : !selectedProject ? (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-400">
            No projects available. Please create or seed a project.
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardPage
                project={selectedProject}
                onNavigateTab={setCurrentTab}
                onOpenPresets={() => setIsPresetsOpen(true)}
                onSelectAnalysis={handleViewAnalysis}
              />
            )}

            {currentTab === 'graph' && graphData && (
              <DependencyGraphView
                graphData={graphData}
                activeAnalysis={activeAnalysisDetail}
                onSimulateChange={handleSimulateChange}
              />
            )}

            {currentTab === 'components' && (
              <ComponentTable
                project={selectedProject}
                onSimulateChange={handleSimulateChange}
              />
            )}

            {currentTab === 'changes' && (
              <ChangeRequestsPage
                project={selectedProject}
                onRunAnalysis={handleRunAnalysisFromChange}
                onViewAnalysis={handleViewAnalysis}
              />
            )}

            {currentTab === 'analysis' && (
              <ImpactAnalysisWorkspace
                project={selectedProject}
                selectedAnalysisId={activeAnalysisId}
              />
            )}

            {currentTab === 'history' && (
              <HistoryComparePage project={selectedProject} />
            )}
          </>
        )}
      </main>

      <AuthModal />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onAnalysisLoaded={handlePresetAnalysisLoaded}
      />

      {selectedProject && (
        <SourceImporterModal
          isOpen={isImporterOpen}
          onClose={() => setIsImporterOpen(false)}
          projectId={selectedProject.id}
          onImportComplete={() => {
            fetchGraph(selectedProject.id);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};
