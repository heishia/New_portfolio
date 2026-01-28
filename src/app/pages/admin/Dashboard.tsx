import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { BarChart3, FolderOpen, LogOut, Loader2, Menu, X, Settings } from 'lucide-react';
import AnalyticsDashboard from '@/app/components/admin/AnalyticsDashboard';
import ProjectsManager from '@/app/components/admin/ProjectsManager';
import SettingsManager from '@/app/components/admin/SettingsManager';

type TabType = 'analytics' | 'projects' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'projects' as TabType, label: '프로젝트 관리', icon: FolderOpen },
    { id: 'settings' as TabType, label: '사이트 설정', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 유저 정보 & 로그아웃 */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="lg:ml-64">
        {/* 모바일 헤더 */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-gray-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
        </header>

        {/* 콘텐츠 */}
        <main className="p-4 lg:p-8">
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>
    </div>
  );
}
