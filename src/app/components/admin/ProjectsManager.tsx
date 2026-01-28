import { useState, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  ExternalLink, Star, X, Plus, ChevronDown, ChevronUp
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

interface ScreenshotItem {
  url: string;
  caption?: string;
  order: number;
}

interface Repository {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  html_url: string;
  cover_image: string | null;
  screenshots: ScreenshotItem[];
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

  // 확장된 프로젝트 ID
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // 업로드 상태
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [savingFor, setSavingFor] = useState<number | null>(null);

  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // 다중 파일 업로드 처리
  const handleFilesUpload = async (projectId: number, files: FileList) => {
    const token = localStorage.getItem('admin_token');
    setUploadingFor(projectId);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
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
      const uploadedUrls = result.urls || [];
      
      if (uploadedUrls.length === 0) throw new Error('No images uploaded');

      // 기존 스크린샷 가져오기
      const project = repositories.find(r => r.id === projectId);
      const existingScreenshots = project?.screenshots || [];
      
      // 새 스크린샷 추가
      const newScreenshots: ScreenshotItem[] = [
        ...existingScreenshots,
        ...uploadedUrls.map((url: string, idx: number) => ({
          url,
          caption: '',
          order: existingScreenshots.length + idx
        }))
      ];

      // 스크린샷 업데이트
      setSavingFor(projectId);
      const updateRes = await fetch(`${API_BASE}/api/repos/${projectId}/screenshots`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screenshots: newScreenshots })
      });

      if (!updateRes.ok) throw new Error('Update failed');
      
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

  // 대표이미지 설정
  const handleSetCoverImage = async (projectId: number, imageUrl: string) => {
    const token = localStorage.getItem('admin_token');
    setSavingFor(projectId);

    try {
      const res = await fetch(`${API_BASE}/api/repos/${projectId}/cover-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cover_image: imageUrl })
      });

      if (!res.ok) throw new Error('Update failed');
      mutate();
    } catch (error) {
      console.error('Set cover image failed:', error);
      alert('대표이미지 설정에 실패했습니다.');
    } finally {
      setSavingFor(null);
    }
  };

  // 스크린샷 삭제
  const handleDeleteScreenshot = async (projectId: number, imageUrl: string) => {
    const token = localStorage.getItem('admin_token');
    setSavingFor(projectId);

    try {
      const project = repositories.find(r => r.id === projectId);
      if (!project) return;

      // 스크린샷 목록에서 제거
      const updatedScreenshots = project.screenshots
        .filter(s => s.url !== imageUrl)
        .map((s, idx) => ({ ...s, order: idx }));

      const updateRes = await fetch(`${API_BASE}/api/repos/${projectId}/screenshots`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screenshots: updatedScreenshots })
      });

      if (!updateRes.ok) throw new Error('Update failed');

      // 삭제한 이미지가 대표이미지였다면 대표이미지도 제거
      if (project.cover_image === imageUrl) {
        await fetch(`${API_BASE}/api/repos/${projectId}/cover-image`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cover_image: null })
        });
      }
      
      mutate();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setSavingFor(null);
    }
  };

  // 드래그앤드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((projectId: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesUpload(projectId, files);
    }
  }, [repositories, mutate]);

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
          각 프로젝트의 스크린샷을 업로드하고 대표이미지를 설정합니다.
        </p>
      </div>

      {/* 프로젝트 목록 */}
      <div className="space-y-3">
        {repositories.map((project) => {
          const coverImageUrl = getImageUrl(project.cover_image);
          const isExpanded = expandedId === project.id;
          const isUploading = uploadingFor === project.id;
          const isSaving = savingFor === project.id;
          const isProcessing = isUploading || isSaving;
          const screenshots = project.screenshots || [];

          return (
            <div 
              key={project.id} 
              className="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
              {/* 프로젝트 헤더 - 클릭하면 확장 */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                {/* 대표이미지 미리보기 */}
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt={project.title || project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-6 h-6" />
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
                    스크린샷 {screenshots.length}개
                    {project.cover_image && ' · 대표이미지 설정됨'}
                  </p>
                </div>

                {/* 확장 아이콘 */}
                <div className="shrink-0 text-gray-400">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>

                {/* GitHub 링크 */}
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </button>

              {/* 확장된 콘텐츠 - 스크린샷 관리 */}
              {isExpanded && (
                <div className="border-t bg-gray-50 p-4">
                  {/* 로딩 오버레이 */}
                  {isProcessing && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-gray-500">
                        {isUploading ? '업로드 중...' : '저장 중...'}
                      </span>
                    </div>
                  )}

                  {!isProcessing && (
                    <>
                      {/* 업로드 영역 */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop(project.id)}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer mb-4"
                        onClick={() => fileInputRefs.current.get(project.id)?.click()}
                      >
                        <input
                          ref={(el) => {
                            if (el) fileInputRefs.current.set(project.id, el);
                          }}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleFilesUpload(project.id, files);
                              e.target.value = '';
                            }
                          }}
                        />
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          클릭하거나 이미지를 드래그하여 업로드
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          여러 이미지를 한번에 선택할 수 있습니다
                        </p>
                      </div>

                      {/* 스크린샷 그리드 */}
                      {screenshots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {screenshots.map((screenshot, idx) => {
                            const imgUrl = getImageUrl(screenshot.url);
                            const isCover = project.cover_image === screenshot.url;

                            return (
                              <div
                                key={idx}
                                className={`relative aspect-video bg-gray-200 rounded-lg overflow-hidden ${
                                  isCover ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                                }`}
                              >
                                <img
                                  src={imgUrl || ''}
                                  alt={screenshot.caption || `Screenshot ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* 대표이미지 배지 */}
                                {isCover && (
                                  <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Star className="w-3 h-3" fill="currentColor" />
                                    대표
                                  </div>
                                )}

                                {/* 액션 버튼 - 오른쪽 상단 */}
                                <div className="absolute top-1 right-1 flex gap-1">
                                  {/* 대표이미지 설정 버튼 */}
                                  {!isCover && (
                                    <button
                                      onClick={() => handleSetCoverImage(project.id, screenshot.url)}
                                      className="w-6 h-6 bg-yellow-400 text-yellow-900 rounded shadow hover:bg-yellow-300 transition-colors flex items-center justify-center"
                                      title="대표이미지로 설정"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* 삭제 버튼 */}
                                  <button
                                    onClick={() => handleDeleteScreenshot(project.id, screenshot.url)}
                                    className="w-6 h-6 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors flex items-center justify-center"
                                    title="삭제"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-gray-400 text-sm py-4">
                          아직 업로드된 스크린샷이 없습니다
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
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
