import { useState, useEffect } from 'react';
import { Save, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { FaThreads, FaYoutube, FaGithub, FaLinkedin } from 'react-icons/fa6';
import { Mail } from 'lucide-react';

interface Settings {
  [key: string]: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// SNS 설정 정의
const snsSettings = [
  { 
    key: 'sns_threads', 
    label: 'Threads', 
    icon: FaThreads, 
    placeholder: 'https://www.threads.com/@username',
    description: 'Threads 프로필 URL'
  },
  { 
    key: 'sns_youtube', 
    label: 'YouTube', 
    icon: FaYoutube, 
    placeholder: 'https://youtube.com/channel/...',
    description: 'YouTube 채널 URL'
  },
  { 
    key: 'sns_github', 
    label: 'GitHub', 
    icon: FaGithub, 
    placeholder: 'https://github.com/username',
    description: 'GitHub 프로필 URL'
  },
  { 
    key: 'sns_linkedin', 
    label: 'LinkedIn', 
    icon: FaLinkedin, 
    placeholder: 'https://linkedin.com/in/username',
    description: 'LinkedIn 프로필 URL'
  },
  { 
    key: 'contact_email', 
    label: '이메일', 
    icon: Mail, 
    placeholder: 'example@email.com',
    description: '연락처 이메일'
  },
];

export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings>({});
  const [originalSettings, setOriginalSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setOriginalSettings(data.settings);
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '인증이 만료되었습니다. 다시 로그인해주세요.' });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: '설정을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || ''
      }));

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ settings: settingsArray })
      });

      if (response.ok) {
        setOriginalSettings(settings);
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">사이트 설정</h2>
        <p className="mt-1 text-gray-600">SNS 링크 및 연락처 정보를 관리합니다.</p>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* SNS 설정 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">SNS & 연락처</h3>
          <p className="text-sm text-gray-500 mt-1">
            URL을 입력하면 Hero 섹션에 아이콘이 표시됩니다. 비워두면 숨겨집니다.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {snsSettings.map((item) => {
            const IconComponent = item.icon;
            const value = settings[item.key] || '';
            
            return (
              <div key={item.key} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {item.label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={item.key === 'contact_email' ? 'email' : 'url'}
                        value={value}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        placeholder={item.placeholder}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {value && item.key !== 'contact_email' && (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {hasChanges() ? '저장되지 않은 변경사항이 있습니다.' : '모든 변경사항이 저장되었습니다.'}
        </p>
        <button
          onClick={handleSave}
          disabled={!hasChanges() || saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
            hasChanges() && !saving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          저장
        </button>
      </div>
    </div>
  );
}
