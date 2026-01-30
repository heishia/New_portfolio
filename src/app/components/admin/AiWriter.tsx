import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Loader2, RefreshCw, FileText, ChevronDown } from 'lucide-react';

interface ContentType {
  id: string;
  label: string;
  description: string;
}

const TONE_OPTIONS = [
  { id: 'professional', label: '전문적', description: '격식있고 신뢰감 있는 톤' },
  { id: 'casual', label: '친근한', description: '편안하고 접근하기 쉬운 톤' },
  { id: 'creative', label: '창의적', description: '개성있고 인상적인 톤' },
];

const LANGUAGE_OPTIONS = [
  { id: 'ko', label: '한국어' },
  { id: 'en', label: 'English' },
];

export default function AiWriter() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('resume');
  const [tone, setTone] = useState<string>('professional');
  const [language, setLanguage] = useState<string>('ko');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const fetchContentTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/content-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContentTypes(data);
      }
    } catch (err) {
      console.error('Failed to fetch content types:', err);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_type: selectedType,
          custom_prompt: customPrompt || undefined,
          tone,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const selectedTypeInfo = contentTypes.find(t => t.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 글쓰기</h2>
          <p className="text-gray-600">포트폴리오 데이터를 기반으로 다양한 글을 생성합니다</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Content Type Selection */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              글 유형 선택
            </h3>
            
            {isLoadingTypes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{type.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tone & Language */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">스타일 설정</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">톤</label>
                <div className="flex gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTone(option.id)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
                        tone === option.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                <div className="flex gap-2">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setLanguage(option.id)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        language === option.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">추가 지시사항 (선택)</h3>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={
                selectedType === 'custom'
                  ? '원하는 형식의 글을 자유롭게 설명해주세요...'
                  : '특별히 강조하고 싶은 점이나 추가 요청사항을 입력하세요...'
              }
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI로 글 생성하기
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div className="bg-white rounded-xl border overflow-hidden flex flex-col min-h-[600px]">
          {/* Output Header */}
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedTypeInfo?.label || '생성된 글'}
              </h3>
              <p className="text-sm text-gray-500">
                {generatedContent ? '생성 완료' : '왼쪽에서 옵션을 선택하고 생성 버튼을 클릭하세요'}
              </p>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="다시 생성"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="복사"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Output Content */}
          <div className="flex-1 p-6 overflow-auto">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">오류 발생</h4>
                <p className="text-sm text-red-600 max-w-sm">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-4 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI가 글을 작성하고 있습니다</h4>
                <p className="text-sm text-gray-500">포트폴리오 데이터를 분석하여 최적의 글을 생성합니다...</p>
              </div>
            ) : generatedContent ? (
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {generatedContent}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">아직 생성된 글이 없습니다</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  글 유형과 스타일을 선택한 후 "AI로 글 생성하기" 버튼을 클릭하세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h4 className="font-semibold text-purple-900 mb-2">💡 이런 용도로 사용하세요</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>이력서</strong>: 채용 지원 시 프로젝트 경력 섹션 작성</li>
          <li>• <strong>자기소개서</strong>: 회사 지원용 커버레터</li>
          <li>• <strong>외주 제안서</strong>: 프리랜서 플랫폼이나 클라이언트에게 보낼 자기소개</li>
          <li>• <strong>LinkedIn</strong>: 프로필 요약글</li>
          <li>• <strong>커스텀</strong>: 원하는 형식을 직접 지정하여 글 생성</li>
        </ul>
      </div>
    </div>
  );
}
