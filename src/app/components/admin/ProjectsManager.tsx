import { useState, useRef } from 'react';
import useSWR from 'swr';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  ExternalLink, Check
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

interface Repository {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  html_url: string;
  cover_image: string | null;
  has_portfolio_meta: boolean;
}

interface RepositoryListResponse {
  repositories: Repository[];
  total: number;
  last_updated: string | null;
}

// 이미지 URL 변환 (key -> API URL)
function getImageUrl(imageKey: string | null): string | null {
  if (!imageKey) return null;
  // presigned URL이면 그대로 사용
  if (imageKey.startsWith('http')) {
    return imageKey;
  }
  // 로컬 업로드 경로 (/uploads/...)면 백엔드 URL과 결합
  if (imageKey.startsWith('/uploads/')) {
    return `${API_BASE}${imageKey}`;
  }
  // key만 저장된 경우 API를 통해 조회
  return `${API_BASE}/api/upload/file/${imageKey}`;
}

export default function ProjectsManager() {
  const { data, isLoading, mutate } = useSWR<RepositoryListResponse>(
    `${API_BASE}/api/repos`,
    fetcher
  );
  
  const repositories = data?.repositories || [];

  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [savingFor, setSavingFor] = useState<number | null>(null);
  const [successFor, setSuccessFor] = useState<number | null>(null);

  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // 대표이미지 업로드 처리
  const handleCoverImageUpload = async (projectId: number, file: File) => {
    const token = localStorage.getItem('admin_token');
    setUploadingFor(projectId);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('project_id', projectId.toString());

      const uploadRes = await fetch(`${API_BASE}/api/upload/screenshots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const result = await uploadRes.json();
      const imageKey = result.keys?.[0] || result.urls?.[0];
      
      if (!imageKey) throw new Error('No image key returned');

      // 대표이미지 업데이트
      setSavingFor(projectId);
      const updateRes = await fetch(`${API_BASE}/api/repos/${projectId}/cover-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cover_image: imageKey })
      });

      if (!updateRes.ok) throw new Error('Update failed');
      
      // 성공 표시
      setSuccessFor(projectId);
      setTimeout(() => setSuccessFor(null), 2000);
      
      // 데이터 새로고침
      mutate();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setUploadingFor(null);
      setSavingFor(null);
    }
  };

  // 대표이미지 삭제
  const handleRemoveCoverImage = async (projectId: number) => {
    const token = localStorage.getItem('admin_token');
    setSavingFor(projectId);

    try {
      const res = await fetch(`${API_BASE}/api/repos/${projectId}/cover-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cover_image: null })
      });

      if (!res.ok) throw new Error('Delete failed');
      
      mutate();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setSavingFor(null);
    }
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
        <p className="text-sm text-gray-500 mt-1">
          각 프로젝트의 대표이미지를 설정합니다. 포트폴리오 목록에 표시됩니다.
        </p>
      </div>

      {/* 프로젝트 목록 */}
      <div className="grid gap-4">
        {repositories.map((project) => {
          const coverImageUrl = getImageUrl(project.cover_image);
          const isUploading = uploadingFor === project.id;
          const isSaving = savingFor === project.id;
          const isSuccess = successFor === project.id;
          const isProcessing = isUploading || isSaving;

          return (
            <div 
              key={project.id} 
              className="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* 대표이미지 미리보기 */}
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 group">
                  {coverImageUrl ? (
                    <>
                      <img
                        src={coverImageUrl}
                        alt={project.title || project.name}
                        className="w-full h-full object-cover"
                      />
                      {/* 삭제 버튼 (호버시 표시) */}
                      <button
                        onClick={() => handleRemoveCoverImage(project.id)}
                        disabled={isProcessing}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  
                  {/* 로딩 오버레이 */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                  
                  {/* 성공 표시 */}
                  {isSuccess && (
                    <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* 프로젝트 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {project.title || project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {project.cover_image ? '대표이미지 설정됨' : '대표이미지 없음'}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(project.id, el);
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCoverImageUpload(project.id, file);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRefs.current.get(project.id)?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {project.cover_image ? '변경' : '업로드'}
                  </button>
                  
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {repositories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            프로젝트가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
