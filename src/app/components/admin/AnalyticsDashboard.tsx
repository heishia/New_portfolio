import { useState } from 'react';
import useSWR from 'swr';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const fetcher = async (url: string) => {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: overview, isLoading, mutate } = useSWR(
    `${API_BASE}/api/analytics/stats?period=${period}&metric=overview`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: realtime } = useSWR(
    `${API_BASE}/api/analytics/stats?metric=realtime`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: pages } = useSWR(
    activeTab === 'pages' ? `${API_BASE}/api/analytics/stats?period=${period}&metric=pages` : null,
    fetcher
  );

  const { data: sources } = useSWR(
    activeTab === 'sources' ? `${API_BASE}/api/analytics/stats?period=${period}&metric=sources` : null,
    fetcher
  );

  const { data: exits } = useSWR(
    activeTab === 'exits' ? `${API_BASE}/api/analytics/stats?period=${period}&metric=exits` : null,
    fetcher
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">사이트 방문 통계 및 사용자 행동 분석</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 실시간 표시 */}
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">
              {realtime?.active_visitors || 0} 실시간
            </span>
          </div>

          {/* 새로고침 */}
          <button
            onClick={() => mutate()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* 기간 선택 */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">최근 24시간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
          </select>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="페이지뷰" value={overview?.summary?.page_views?.toLocaleString()} loading={isLoading} />
        <StatCard label="순방문자" value={overview?.summary?.unique_visitors?.toLocaleString()} loading={isLoading} />
        <StatCard 
          label="이탈률" 
          value={overview?.summary?.bounce_rate} 
          loading={isLoading}
          alert={parseFloat(overview?.summary?.bounce_rate) > 70}
        />
        <StatCard label="평균 체류시간" value={overview?.summary?.avg_duration} loading={isLoading} />
        <StatCard label="페이지/세션" value={overview?.summary?.pages_per_session} loading={isLoading} />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {[
          { id: 'overview', label: '개요' },
          { id: 'pages', label: '인기 페이지' },
          { id: 'sources', label: '유입 경로' },
          { id: 'exits', label: '이탈 분석' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && overview?.trend && (
          <div className="h-[300px]">
            <h3 className="text-sm font-medium text-gray-700 mb-4">일별 트래픽 추이</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(d) => new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('ko-KR')} />
                <Legend />
                <Line type="monotone" dataKey="page_views" name="페이지뷰" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="unique_visitors" name="순방문자" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'overview' && !overview?.trend && !isLoading && (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            아직 데이터가 없습니다
          </div>
        )}

        {activeTab === 'pages' && pages?.pages && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">인기 페이지 Top 20</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">페이지</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">조회수</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.pages.map((page: { title: string; url: string; views: number }, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div className="font-medium truncate max-w-[400px]">{page.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[400px]">{page.url}</div>
                      </td>
                      <td className="text-right py-3 px-2">{page.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sources' && sources && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">유입 소스</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sources.referrers?.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="visits"
                      nameKey="source"
                      label={({ source, percent }: { source: string; percent: number }) => 
                        `${source} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {sources.referrers?.map((_: unknown, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {sources.utm?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">UTM 캠페인</h3>
                <div className="space-y-2">
                  {sources.utm.map((utm: { source: string; medium: string; sessions: number }, i: number) => (
                    <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{utm.source} / {utm.medium}</span>
                      <span className="text-sm font-medium">{utm.sessions}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exits' && exits && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">이탈이 가장 많은 페이지</h3>
            <div className="space-y-2">
              {exits.top_exit_pages?.map((page: { page: string; bounces: number }, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{page.page}</div>
                  </div>
                  <span className="text-sm font-medium text-red-500">{page.bounces} 이탈</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, loading = false, alert = false }: {
  label: string;
  value?: string;
  loading?: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      alert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {loading ? (
        <div className="h-7 w-20 bg-gray-200 animate-pulse rounded" />
      ) : (
        <p className={`text-xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>
          {value || '-'}
        </p>
      )}
    </div>
  );
}
