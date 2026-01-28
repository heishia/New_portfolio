import { useState, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { 
  Upload, Trash2, Plus, Save, Loader2, Image as ImageIcon, 
  ExternalLink, GripVertical, X, Check
} from 'lucide-react';

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

interface Screenshot {
  url: string;  // presigned URL 또는 key
  key?: string; // Railway Bucket key
  caption?: string;
  order: number;
}

// 스크린샷 URL 변환 (key -> API URL)
function getImageUrl(screenshot: Screenshot): string {
  // key가 있으면 API를 통해 조회
  if (screenshot.key) {
    return `${API_BASE}/api/upload/file/${screenshot.key}`;
  }
  // presigned URL이면 그대로 사용
  if (screenshot.url?.startsWith('http')) {
    return screenshot.url;
  }
  // key만 저장된 경우 (url 필드에 key가 있는 경우)
  if (screenshot.url && !screenshot.url.startsWith('http')) {
    return `${API_BASE}/api/upload/file/${screenshot.url}`;
  }
  return screenshot.url;
}

interface Repository {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  html_url: string;
  screenshots: Screenshot[];
  has_portfolio_meta: boolean;
}

export default function ProjectsManager() {
  const { data, isLoading, mutate } = useSWR<Repository[]>(
    `${API_BASE}/api/repos`,
    fetcher
  );

  const [selectedProject, setSelectedProject] = useState<Repository | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [savingFor, setSavingFor] = useState<number | null>(null);
  const [localScreenshots, setLocalScreenshots] = useState<Map<number, Screenshot[]>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 스크린샷 가져오기 (로컬 수정 또는 원본)
  const getScreenshots = (project: Repository): Screenshot[] => {
    return localScreenshots.get(project.id) || project.screenshots || [];
  };

  // 파일 업로드 처리
  const handleFileUpload = async (projectId: number, files: FileList) => {
    const token = localStorage.getItem('admin_token');
    setUploadingFor(projectId);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('project_id', projectId.toString());

      const res = await fetch(`${API_BASE}/api/upload/screenshots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const result = await res.json();
      
      // 로컬 스크린샷 업데이트
      const project = data?.find(p => p.id === projectId);
      if (project) {
        const currentScreenshots = getScreenshots(project);
        // keys 배열이 있으면 key 기반으로 저장, 없으면 url 사용
        const keys = result.keys || [];
        const urls = result.urls || [];
        
        const newScreenshots = [
          ...currentScreenshots,
          ...keys.map((key: string, idx: number) => ({
            url: urls[idx] || key, // presigned URL 또는 key
            key: key,
            caption: '',
            order: currentScreenshots.length + idx
          }))
        ];
        setLocalScreenshots(prev => new Map(prev).set(projectId, newScreenshots));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setUploadingFor(null);
    }
  };

  // 스크린샷 삭제
  const handleDeleteScreenshot = (projectId: number, index: number) => {
    const project = data?.find(p => p.id === projectId);
    if (!project) return;

    const currentScreenshots = getScreenshots(project);
    const newScreenshots = currentScreenshots.filter((_, i) => i !== index);
    setLocalScreenshots(prev => new Map(prev).set(projectId, newScreenshots));
  };

  // 캡션 업데이트
  const handleCaptionChange = (projectId: number, index: number, caption: string) => {
    const project = data?.find(p => p.id === projectId);
    if (!project) return;

    const currentScreenshots = getScreenshots(project);
    const newScreenshots = currentScreenshots.map((s, i) => 
      i === index ? { ...s, caption } : s
    );
    setLocalScreenshots(prev => new Map(prev).set(projectId, newScreenshots));
  };

  // 변경사항 저장
  const handleSave = async (projectId: number) => {
    const token = localStorage.getItem('admin_token');
    const screenshots = localScreenshots.get(projectId);
    if (!screenshots) return;

    setSavingFor(projectId);

    try {
      const res = await fetch(`${API_BASE}/api/repos/${projectId}/screenshots`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screenshots })
      });

      if (!res.ok) throw new Error('Save failed');
      
      // 로컬 변경 제거 및 데이터 새로고침
      setLocalScreenshots(prev => {
        const next = new Map(prev);
        next.delete(projectId);
        return next;
      });
      mutate();
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSavingFor(null);
    }
  };

  // 변경 여부 확인
  const hasChanges = (projectId: number): boolean => {
    return localScreenshots.has(projectId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">프로젝트 관리</h2>
        <p className="text-sm text-gray-500 mt-1">프로젝트별 스크린샷을 관리합니다</p>
      </div>

      {/* 프로젝트 목록 */}
      <div className="grid gap-4">
        {data?.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-xl border shadow-sm overflow-hidden"
          >
            {/* 프로젝트 헤더 */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedProject(
                selectedProject?.id === project.id ? null : project
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {project.title || project.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getScreenshots(project).length}개 스크린샷
                    {hasChanges(project.id) && (
                      <span className="ml-2 text-amber-600">• 저장되지 않은 변경</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 확장된 스크린샷 관리 */}
            {selectedProject?.id === project.id && (
              <div className="border-t p-4 bg-gray-50">
                {/* 업로드 버튼 */}
                <div className="flex items-center gap-3 mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleFileUpload(project.id, e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFor === project.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingFor === project.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    스크린샷 업로드
                  </button>

                  {hasChanges(project.id) && (
                    <button
                      onClick={() => handleSave(project.id)}
                      disabled={savingFor === project.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {savingFor === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      변경사항 저장
                    </button>
                  )}
                </div>

                {/* 스크린샷 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getScreenshots(project).map((screenshot, index) => (
                    <div 
                      key={index}
                      className="relative group bg-white rounded-lg border overflow-hidden"
                    >
                      <img
                        src={getImageUrl(screenshot)}
                        alt={screenshot.caption || `Screenshot ${index + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDeleteScreenshot(project.id, index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* 캡션 입력 */}
                      <div className="p-2">
                        <input
                          type="text"
                          value={screenshot.caption || ''}
                          onChange={(e) => handleCaptionChange(project.id, index, e.target.value)}
                          placeholder="캡션 입력..."
                          className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}

                  {getScreenshots(project).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <p>스크린샷이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {!data?.length && (
          <div className="text-center py-12 text-gray-400">
            프로젝트가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
