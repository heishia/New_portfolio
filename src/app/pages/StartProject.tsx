import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, User, Mail, Phone, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OUTPUT_OPTIONS = [
  { id: 'website', label: '웹사이트' },
  { id: 'webapp', label: '웹 애플리케이션' },
  { id: 'mobile', label: '모바일 앱' },
  { id: 'automation', label: '자동화 프로그램' },
  { id: 'dashboard', label: '대시보드/관리자 페이지' },
  { id: 'other', label: '기타' },
];

const BUDGET_OPTIONS = [
  { id: 'under_100', label: '100만원 미만' },
  { id: '100_300', label: '100~300만원' },
  { id: '300_500', label: '300~500만원' },
  { id: '500_1000', label: '500~1000만원' },
  { id: 'over_1000', label: '1000만원 이상' },
  { id: 'discuss', label: '협의 후 결정' },
];

export default function StartProject() {
  const navigate = useNavigate();
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [otherOutput, setOtherOutput] = useState('');
  const [features, setFeatures] = useState('');
  const [idea, setIdea] = useState('');
  // Contact information
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/project-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          output_type: selectedOutput,
          output_other: selectedOutput === 'other' ? otherOutput : null,
          features: features || null,
          idea: idea || null,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          budget: budget || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">감사합니다!</h2>
          <p className="text-gray-600 mb-8">요청이 성공적으로 전송되었습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 md:px-8 py-8 md:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8 md:mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wide">Back</span>
        </motion.button>

        {/* Title */}
        <motion.div
          className="mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1
            className="text-3xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Start a Project
          </h1>
          <p className="text-gray-500">아이디어를 알려주세요</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Contact Information */}
          <div className="space-y-4">
            <label className="block text-sm font-medium uppercase tracking-wide mb-4">
              담당자 정보
            </label>
            
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="담당자 이름"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="이메일"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="전화번호"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-4">
              <Wallet className="inline-block w-4 h-4 mr-2" />
              예산
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBudget(option.id)}
                  className={`px-4 py-3 border rounded-lg text-sm transition-all ${
                    budget === option.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Output Type */}
          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-4">
              원하는 아웃풋
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {OUTPUT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOutput(option.id)}
                  className={`px-4 py-3 border rounded-lg text-sm transition-all ${
                    selectedOutput === option.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedOutput === 'other' && (
              <motion.input
                type="text"
                placeholder="어떤 결과물을 원하시나요?"
                value={otherOutput}
                onChange={(e) => setOtherOutput(e.target.value)}
                className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              />
            )}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-4">
              원하는 기능
            </label>
            <textarea
              placeholder="예: 회원가입, 결제 시스템, 관리자 페이지..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          {/* Idea Description */}
          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-4">
              전체적인 아이디어
            </label>
            <textarea
              placeholder="프로젝트에 대해 자유롭게 설명해주세요..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting || !selectedOutput}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-full uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              '전송 중...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                제출하기
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
