import React from 'react';
import { useAuth } from '../../app/AuthContext';
import { Project } from '../../types';
import { Button } from './Button';
import {
  GitPullRequest,
  Network,
  Layers,
  LayoutDashboard,
  History,
  Sparkles,
  LogOut,
  LogIn,
  FolderGit2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onOpenPresets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  selectedProject,
  onSelectProject,
  onOpenPresets,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'changes', label: 'Change Requests', icon: GitPullRequest },
    { id: 'analysis', label: 'Impact Workspace', icon: Sparkles },
    { id: 'history', label: 'History Compare', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBC02D] via-[#FF8F00] to-[#C62828] flex items-center justify-center shadow-md shadow-orange-950/60">
                <Network className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-[#F5F5DC] to-[#FBC02D] bg-clip-text text-transparent">
                  ChangeRipple
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#FBC02D]/10 text-[#FBC02D] border border-[#FBC02D]/30">
                  v2.0
                </span>
              </div>
            </div>

            {/* Project Selector */}
            {isAuthenticated && projects.length > 0 && (
              <div className="relative flex items-center">
                <FolderGit2 className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const p = projects.find((proj) => proj.id === e.target.value);
                    if (p) onSelectProject(p);
                  }}
                  className="pl-8 pr-8 py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer transition-colors max-w-[210px] truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-[#FDD835] border border-amber-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FBC02D]' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Toolbar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Presets Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenPresets}
              className="border-brand-500/40 text-brand-300 hover:bg-brand-950/40 hover:text-brand-200 text-xs shadow-sm shadow-brand-950/50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-400 animate-pulse" />
              <span className="hidden sm:inline">Demo Presets</span>
              <span className="sm:hidden">Presets</span>
            </Button>

            {/* Auth / Profile Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200 leading-tight">{user?.fullName || user?.username}</span>
                  <span className="text-[10px] text-brand-400/80 font-mono">{user?.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-slate-800 hover:border-red-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button size="sm" variant="primary" onClick={openAuthModal}>
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
