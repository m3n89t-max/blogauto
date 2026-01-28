
import React, { useState, useEffect } from 'react';
import { NewsItem, PostSettings, Tone, PhotoOption, PostingResult, NewsSelectionMethod } from './types';
import { fetchTrendingNews, generateBlogPost, generateTitleSuggestions } from './services/geminiService';

type ViewType = 'dashboard' | 'news-blog' | 'info-blog' | 'real-estate-blog';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  // Common Account State
  const [naverId, setNaverId] = useState('');
  const [naverPw, setNaverPw] = useState('');

  // --- News Blog State ---
  const [selectionMethod, setSelectionMethod] = useState<NewsSelectionMethod>('trending');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [manualNews, setManualNews] = useState<Partial<NewsItem>>({ title: '', source: '', summary: '', link: '' });
  const [thoughts, setThoughts] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState(''); // 사용자 지정 이미지 URL
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]); // AI 추천 제목들
  const [isLoadingTitles, setIsLoadingTitles] = useState(false); // 제목 생성 중
  const [settings, setSettings] = useState<PostSettings>({
    useAiTitle: true,
    manualTitle: '',
    tone: 'professional',
    photoOption: 'news',
    topic: '', // 주제/키워드
    angle: 'technology', // 관점
    writingStyle: 'news', // 글쓰기 스타일: news (전문 뉴스 기사체) / blogger (블로거 스타일)
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postingResult, setPostingResult] = useState<PostingResult | null>(null);

  useEffect(() => {
    if (activeView === 'dashboard') {
      document.body.classList.add('dashboard-bg');
    } else {
      document.body.classList.remove('dashboard-bg');
    }
  }, [activeView]);

  const handleFetchNews = async () => {
    setIsLoadingNews(true);
    try {
      const news = await fetchTrendingNews();
      setNewsList(news);
      if (news.length === 0) {
        alert('뉴스를 불러오지 못했습니다. API 키를 확인해주세요.');
      }
    } catch (error: any) {
      console.error("News fetch error", error);
      alert(error.message || '뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingNews(false);
    }
  };

  // AI 제목 추천 요청
  const handleGenerateTitleSuggestions = async () => {
    let targetNews: NewsItem | null = null;
    
    if (selectionMethod === 'trending') {
      targetNews = selectedNews;
    } else {
      if (!manualNews.title || !manualNews.summary) {
        alert('뉴스 제목과 내용을 먼저 입력해주세요.');
        return;
      }
      targetNews = {
        id: 'manual-' + Date.now(),
        title: manualNews.title || '',
        source: manualNews.source || '직접 입력',
        summary: manualNews.summary || '',
        link: manualNews.link || ''
      };
    }
    
    if (!targetNews) {
      alert('제목을 추천받을 뉴스를 선택하거나 입력해주세요.');
      return;
    }
    
    setIsLoadingTitles(true);
    setSuggestedTitles([]);
    
    try {
      const titles = await generateTitleSuggestions(targetNews);
      setSuggestedTitles(titles);
      console.log('✅ AI 제목 추천 완료:', titles);
    } catch (error: any) {
      console.error('❌ 제목 추천 오류:', error);
      alert(`제목 추천 실패: ${error.message}`);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const handleStartPosting = async () => {
    if (!naverId || !naverPw) {
      alert('네이버 계정 정보를 입력해주세요.');
      return;
    }

    let finalNews: NewsItem | null = null;
    if (selectionMethod === 'trending') {
      finalNews = selectedNews;
    } else {
      if (!manualNews.title || !manualNews.summary) {
        alert('뉴스 제목과 내용을 입력해주세요.');
        return;
      }
      finalNews = {
        id: 'manual-' + Date.now(),
        title: manualNews.title || '',
        source: manualNews.source || '직접 입력',
        summary: manualNews.summary || '',
        link: manualNews.link || ''
      };
    }

    if (!finalNews) {
      alert('포스팅할 뉴스를 선택하거나 입력해주세요.');
      return;
    }

    setIsPosting(true);
    setPostingResult(null);

    try {
      // Step 1: Gemini API로 블로그 포스트 생성
      console.log('📝 Step 1: 블로그 포스트 생성 중...');
      const content = await generateBlogPost(finalNews, thoughts, settings);
      
      // 사용자가 직접 입력한 이미지 URL이 있으면 우선 사용
      if (customImageUrl.trim()) {
        content.imageUrl = customImageUrl.trim();
        console.log('🖼️ 사용자 지정 이미지 URL 적용:', customImageUrl.trim());
      }
      
      // Step 2: 미리보기 표시
      console.log('👁️ Step 2: 생성된 콘텐츠 미리보기 표시...');
      setPostingResult({
        success: true,
        message: '블로그 포스트가 생성되었습니다. 아래에서 내용을 확인하고 "자동 포스팅 시작" 버튼을 클릭하세요.',
        generatedContent: content
      });

      // Step 3: 미리보기 영역으로 자동 스크롤
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 300);
      
    } catch (error: any) {
      setPostingResult({ success: false, message: `오류: ${error.message}` });
    } finally {
      setIsPosting(false);
    }
  };

  // 네이버 블로그에 자동 발행
  const handlePublishToNaver = async () => {
    if (!postingResult?.generatedContent) {
      alert('발행할 콘텐츠가 없습니다.');
      return;
    }

    if (!naverId || !naverPw) {
      alert('네이버 계정 정보를 입력해주세요.');
      return;
    }

    const confirmed = confirm(
      '🚀 네이버 블로그 자동 발행을 시작합니다.\n\n' +
      '• 브라우저가 자동으로 열립니다\n' +
      '• 네이버 로그인 후 블로그에 포스팅합니다\n' +
      '• 발행이 완료되면 알림을 드립니다\n\n' +
      '⚠️ 백엔드 서버(포트 3002)가 실행 중이어야 합니다.\n\n' +
      '진행하시겠습니까?'
    );

    if (!confirmed) {
      return;
    }

    // 자동화 시작 알림
    setPostingResult({
      success: true,
      message: '🚀 네이버 블로그 자동 발행을 시작합니다...',
      generatedContent: postingResult.generatedContent
    });

    try {
      console.log('🚀 백엔드 API 호출 중...');
      
      // 백엔드 API URL (환경 변수 또는 기본값)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
      
      // 백엔드 API 호출
      const response = await fetch(`${API_BASE_URL}/api/auto-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          naverId: naverId,
          naverPw: naverPw,
          title: postingResult.generatedContent.title,
          body: postingResult.generatedContent.body,
          imageUrl: postingResult.generatedContent.imageUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        // 성공
        alert(
          '✅ 블로그 포스트 발행 완료!\n\n' +
          `📌 발행된 URL: ${result.postUrl}\n\n` +
          '🎉 브라우저 창에서 결과를 확인하세요!'
        );

        setPostingResult({
          success: true,
          message: `✅ 발행 완료! URL: ${result.postUrl}`,
          generatedContent: postingResult.generatedContent
        });

        // 보안: 계정 정보 초기화
        console.log('🔒 보안 청소: 계정 정보 초기화');
        setNaverId('');
        setNaverPw('');

      } else if (result.captchaDetected) {
        // 캡차 감지
        alert(
          '⚠️ 네이버 캡차가 감지되었습니다.\n\n' +
          '수동으로 캡차를 해결한 후 다시 시도해주세요.'
        );

        setPostingResult({
          success: false,
          message: '⚠️ 캡차 감지: 수동으로 해결 후 재시도 필요',
          generatedContent: postingResult.generatedContent
        });

      } else {
        // 기타 실패
        throw new Error(result.message);
      }

    } catch (error: any) {
      console.error('❌ 자동화 실패:', error);
      
      // 네트워크 오류 특별 처리
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        alert(
          '❌ 백엔드 서버 연결 실패\n\n' +
          '백엔드 서버를 시작해주세요:\n' +
          'npm run dev:server\n\n' +
          '(포트 3002에서 실행되어야 합니다)'
        );
      } else {
        alert(
          '❌ 자동화 실패\n\n' +
          `오류: ${error.message}`
        );
      }

      setPostingResult({
        success: false,
        message: `❌ 자동화 실패: ${error.message}`,
        generatedContent: postingResult.generatedContent
      });
    }
  };

  const renderDashboard = () => (
    <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-16 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-sm font-light tracking-[0.4em] text-gray-400 uppercase">Automate Your Content</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">MEETING POINT</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-8">
        {/* 1. 뉴스 자동화 */}
        <div 
          onClick={() => setActiveView('news-blog')}
          className="group relative h-[550px] overflow-hidden rounded-md cursor-pointer transition-all duration-700 hover:scale-[1.03] shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop" 
            alt="News" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 card-gradient"></div>
          <div className="absolute bottom-12 left-10 right-10 text-white space-y-3">
            <h3 className="text-2xl font-black tracking-tight uppercase">NEWS AUTO</h3>
            <p className="text-sm text-gray-300 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              실시간 핫이슈를 분석하여<br />당신만의 스타일로 블로그에 기록하세요.
            </p>
          </div>
          <div className="absolute top-8 right-8">
             <i className="fas fa-plus text-white/40 group-hover:text-white transition-colors"></i>
          </div>
        </div>

        {/* 2. 정보 전달 자동화 */}
        <div 
          onClick={() => setActiveView('info-blog')}
          className="group relative h-[550px] overflow-hidden rounded-md cursor-pointer transition-all duration-700 hover:scale-[1.03] shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2070&auto=format&fit=crop" 
            alt="Info" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 card-gradient"></div>
          <div className="absolute bottom-12 left-10 right-10 text-white space-y-3">
            <h3 className="text-2xl font-black tracking-tight uppercase">INFO HUB</h3>
            <p className="text-sm text-gray-300 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              유용한 생활 팁과 가이드 정보를<br />체계적으로 정리하여 자동 발행합니다.
            </p>
          </div>
          <div className="absolute top-8 left-8">
             <span className="text-[10px] font-bold tracking-widest bg-white/10 px-2 py-1 backdrop-blur-md border border-white/20 text-white/60">ONLINE SHOP</span>
          </div>
        </div>

        {/* 3. 부동산 매물 자동화 */}
        <div 
          onClick={() => setActiveView('real-estate-blog')}
          className="group relative h-[550px] overflow-hidden rounded-md cursor-pointer transition-all duration-700 hover:scale-[1.03] shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop" 
            alt="Real Estate" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 card-gradient"></div>
          <div className="absolute bottom-12 left-10 right-10 text-white space-y-3">
            <h3 className="text-2xl font-black tracking-tight uppercase">REAL ESTATE</h3>
            <p className="text-sm text-gray-300 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              지역별 시세와 청약 정보를 지도로<br />시각화하여 전문성 있는 글을 작성합니다.
            </p>
          </div>
          <div className="absolute top-8 left-8">
             <span className="text-[10px] font-bold tracking-widest bg-white/10 px-2 py-1 backdrop-blur-md border border-white/20 text-white/60">STORE</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-700 ${activeView === 'dashboard' ? '' : 'bg-[#0f0f0f] pb-20'}`}>
      <header className={`sticky top-0 z-50 py-6 transition-all duration-500 ${activeView === 'dashboard' ? 'bg-transparent' : 'bg-[#1a1a1a]/90 backdrop-blur-xl border-b border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-xl transition-all ${activeView === 'dashboard' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white text-gray-900'}`}>N</div>
            <div>
              <h1 className={`text-xl font-black leading-none tracking-tight transition-colors ${activeView === 'dashboard' ? 'text-white' : 'text-white'}`}>N-AutoPost</h1>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Future Automation</span>
            </div>
          </div>
          {activeView !== 'dashboard' && (
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 transition-all group"
            >
              <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> BACK TO DASHBOARD
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeView === 'dashboard' ? renderDashboard() : (
          <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
             <div className="text-center space-y-3">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {activeView === 'news-blog' && 'NEWS AUTO ENGINE'}
                  {activeView === 'info-blog' && 'INFO HUB ENGINE'}
                  {activeView === 'real-estate-blog' && 'REAL ESTATE ENGINE'}
                </h2>
                <div className="w-12 h-1 bg-white mx-auto rounded-full"></div>
             </div>

             {activeView === 'news-blog' ? (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-4xl mx-auto">
                    {/* Account */}
                    <section className="bg-[#1a1a1a] rounded-3xl p-10 border border-gray-800 shadow-2xl shadow-black/40">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8">01. 네이버 계정 정보</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <input type="text" value={naverId} onChange={e => setNaverId(e.target.value)} placeholder="네이버 아이디" className="w-full px-6 py-5 rounded-2xl bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-white/5 outline-none transition-all font-bold" />
                        <input type="password" value={naverPw} onChange={e => setNaverPw(e.target.value)} placeholder="비밀번호" className="w-full px-6 py-5 rounded-2xl bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-white/5 outline-none transition-all font-bold" />
                      </div>
                      <div className="mt-6 p-4 bg-blue-950/30 border border-blue-900/50 rounded-xl">
                        <p className="text-xs text-blue-300 leading-relaxed">
                          🔒 <strong>보안 안내:</strong> 입력된 계정 정보는 서버에 저장되지 않으며, 블로그 발행 완료 즉시 메모리에서 안전하게 파기됩니다.
                        </p>
                      </div>
                    </section>

                    {/* Content */}
                    <section className="bg-[#1a1a1a] rounded-3xl p-10 border border-gray-800 shadow-2xl shadow-black/40">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8">02. 뉴스 선택</h3>
                      <div className="flex bg-[#0f0f0f] p-1.5 rounded-2xl mb-10">
                        <button onClick={() => setSelectionMethod('trending')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all ${selectionMethod === 'trending' ? 'bg-white shadow-lg text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}>인기 뉴스</button>
                        <button onClick={() => setSelectionMethod('manual')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all ${selectionMethod === 'manual' ? 'bg-white shadow-lg text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}>직접 입력</button>
                      </div>
                      {selectionMethod === 'trending' ? (
                        <div className="space-y-6">
                            <button onClick={handleFetchNews} disabled={isLoadingNews} className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">
                                {isLoadingNews ? '불러오는 중...' : '인기 뉴스 불러오기'}
                            </button>
                            <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {newsList.map(n => (
                                <label key={n.id} className={`flex items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedNews?.id === n.id ? 'bg-[#0f0f0f] border-white' : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-700'}`}>
                                    <input type="radio" checked={selectedNews?.id === n.id} onChange={() => setSelectedNews(n)} className="w-4 h-4 accent-white mr-6" />
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 mb-1">{n.source}</div>
                                        <div className="text-lg font-bold text-gray-200 leading-tight">{n.title}</div>
                                    </div>
                                </label>
                                ))}
                            </div>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <input value={manualNews.title} onChange={e => setManualNews({...manualNews, title: e.target.value})} placeholder="뉴스 제목" className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 rounded-2xl font-bold outline-none" />
                            <textarea value={manualNews.summary} onChange={e => setManualNews({...manualNews, summary: e.target.value})} rows={8} placeholder="뉴스 내용을 여기에 붙여넣으세요" className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 rounded-2xl font-bold outline-none resize-none" />
                        </div>
                      )}
                    </section>

                    {/* Settings */}
                    <section className="bg-[#1a1a1a] rounded-3xl p-10 border border-gray-800 shadow-2xl shadow-black/40">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8">03. 작성 옵션</h3>
                      
                      {/* 주제/키워드 */}
                      <div className="mb-6">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">주제/키워드 (선택사항)</label>
                        <input 
                          type="text" 
                          value={settings.topic} 
                          onChange={e => setSettings({ ...settings, topic: e.target.value })} 
                          placeholder="예: AI 반도체, 전기차 보조금, 부동산 정책..." 
                          className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 rounded-2xl outline-none font-bold"
                        />
                      </div>

                      {/* 관점 */}
                      <div className="mb-6">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">글의 관점</label>
                        <select 
                          value={settings.angle} 
                          onChange={e => setSettings({ ...settings, angle: e.target.value as any })} 
                          className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white rounded-2xl font-bold outline-none appearance-none"
                        >
                          <option value="investment">💰 투자 관점</option>
                          <option value="policy">📜 정책 관점</option>
                          <option value="technology">💻 기술 관점</option>
                          <option value="life">🏠 생활 영향 관점</option>
                        </select>
                      </div>

                      {/* 글쓰기 스타일 */}
                      <div className="mb-6">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">글쓰기 스타일</label>
                        <div className="flex bg-[#0f0f0f] p-1.5 rounded-2xl border border-gray-800">
                          <button 
                            onClick={() => setSettings({ ...settings, writingStyle: 'news' })} 
                            className={`flex-1 py-4 text-xs font-black rounded-xl transition-all ${settings.writingStyle === 'news' ? 'bg-white shadow-lg text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            📰 뉴스 기사체
                            <div className="text-[9px] mt-1 font-normal opacity-70">중립적, 사실 중심</div>
                          </button>
                          <button 
                            onClick={() => setSettings({ ...settings, writingStyle: 'blogger' })} 
                            className={`flex-1 py-4 text-xs font-black rounded-xl transition-all ${settings.writingStyle === 'blogger' ? 'bg-white shadow-lg text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            ✍️ 블로거 스타일
                            <div className="text-[9px] mt-1 font-normal opacity-70">1인칭, 친근, 의견 포함</div>
                          </button>
                        </div>
                      </div>

                      {/* AI 제목 추천 */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                            ✨ AI 제목 추천 (선택사항)
                          </label>
                          <button
                            onClick={handleGenerateTitleSuggestions}
                            disabled={isLoadingTitles}
                            className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${
                              isLoadingTitles 
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'
                            }`}
                          >
                            {isLoadingTitles ? '🔄 생성 중...' : '🎯 제목 추천 받기'}
                          </button>
                        </div>
                        
                        {suggestedTitles.length > 0 && (
                          <div className="space-y-3 p-6 bg-[#0a0a0a] border border-purple-900/30 rounded-2xl">
                            <p className="text-xs text-gray-500 font-bold mb-3">
                              💡 클릭하면 해당 제목이 자동으로 선택됩니다
                            </p>
                            {suggestedTitles.map((title, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSettings({ ...settings, useAiTitle: false, manualTitle: title });
                                  alert(`제목이 선택되었습니다:\n"${title}"`);
                                }}
                                className="w-full text-left px-6 py-4 bg-[#1a1a1a] border border-gray-800 text-white rounded-xl font-bold hover:border-purple-500 hover:bg-purple-950/20 transition-all group"
                              >
                                <span className="text-purple-400 font-black mr-2">{index + 1}.</span>
                                <span className="group-hover:text-purple-300">{title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 나의 생각 */}
                      <div className="mb-10">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">나의 생각 (2-5줄 권장)</label>
                        <textarea 
                          value={thoughts} 
                          onChange={e => setThoughts(e.target.value)} 
                          rows={6} 
                          placeholder="뉴스에 대한 나의 생각이나 의견을 적어주세요..." 
                          className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 rounded-2xl outline-none font-bold resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">글의 톤</label>
                            <select value={settings.tone} onChange={e => setSettings({...settings, tone: e.target.value as Tone})} className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white rounded-2xl font-bold outline-none appearance-none">
                                <option value="professional">전문적인</option>
                                <option value="soft">부드러운</option>
                                <option value="humorous">유머러스한</option>
                                <option value="analytical">분석적인</option>
                                <option value="friendly">친근한</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">사진 추가</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['news', 'ai', 'none'] as PhotoOption[]).map(opt => {
                                    const labels: Record<PhotoOption, string> = {
                                        news: '뉴스 사진',
                                        ai: 'AI 생성',
                                        none: '사진 없음'
                                    };
                                    return (
                                        <button 
                                            key={opt}
                                            onClick={() => setSettings({...settings, photoOption: opt})}
                                            className={`py-5 text-[10px] font-black rounded-2xl border-2 transition-all ${settings.photoOption === opt ? 'bg-white border-white text-gray-900' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                        >
                                            {labels[opt]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                      </div>
                      
                      {/* 이미지 URL 입력 필드 */}
                      <div className="mb-6">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">
                          🖼️ 이미지 URL (선택사항)
                        </label>
                        <input 
                          type="text" 
                          value={customImageUrl} 
                          onChange={e => setCustomImageUrl(e.target.value)} 
                          placeholder="https://example.com/image.jpg (직접 이미지 URL 입력)" 
                          className="w-full px-6 py-5 bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-600 rounded-2xl outline-none font-bold"
                        />
                        <p className="text-xs text-gray-600 mt-2 ml-1">
                          💡 팁: 이미지 URL을 입력하면 위의 "사진 추가" 옵션보다 우선 적용됩니다
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10" style={{display: 'none'}}>
                      </div>
                    </section>

                    <button 
                        onClick={handleStartPosting} 
                        disabled={isPosting}
                        className={`w-full py-8 rounded-[2rem] font-black text-2xl shadow-2xl transition-all transform active:scale-95 ${isPosting ? 'bg-gray-800 text-gray-600' : 'bg-white text-gray-900 hover:bg-gray-200 hover:-translate-y-1'}`}
                    >
                        {isPosting ? '작성 중...' : '📝 미리보기'}
                    </button>
                </div>
             ) : (
                <div className="bg-white rounded-[3rem] p-24 text-center space-y-8 shadow-2xl shadow-gray-100/50 max-w-3xl mx-auto">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <i className="fas fa-layer-group text-3xl text-gray-200 animate-pulse"></i>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-gray-900 uppercase">Modular Engine Under Construction</h3>
                        <p className="text-gray-400 font-medium leading-relaxed">더 나은 자동화 경험을 위해 해당 모듈의 AI 알고리즘을 튜닝하고 있습니다. 곧 업데이트될 예정입니다.</p>
                    </div>
                    <button onClick={() => setActiveView('dashboard')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all">RETURN TO HUB</button>
                </div>
             )}

             {postingResult && (
                <div className={`p-12 rounded-[3rem] border-4 animate-in zoom-in-95 duration-500 ${postingResult.success ? 'bg-[#1a1a1a] border-white shadow-2xl shadow-black/40' : 'bg-red-950/30 border-red-900/50'}`}>
                    <div className="flex items-center gap-6 mb-10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl text-white ${postingResult.success ? 'bg-white text-gray-900' : 'bg-red-500'}`}>
                            <i className={`fas ${postingResult.success ? 'fa-check' : 'fa-times'}`}></i>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{postingResult.success ? '포스팅 성공' : '오류 발생'}</h3>
                            <p className="text-gray-400 font-bold">{postingResult.message}</p>
                        </div>
                    </div>
                    {postingResult.generatedContent && (
                        <div className="space-y-8 pt-8 border-t border-gray-800">
                            {postingResult.generatedContent.imageUrl && (
                                <img src={postingResult.generatedContent.imageUrl} className="w-full aspect-video object-cover rounded-[2rem] shadow-lg" alt="미리보기" />
                            )}
                            <h4 className="text-3xl font-black text-white leading-tight">{postingResult.generatedContent.title}</h4>
                            <div className="text-gray-400 leading-loose font-medium text-lg whitespace-pre-wrap">
                              {postingResult.generatedContent.body
                                .replace(/^#{1,6}\s+/gm, '') // 줄 시작의 # 제거
                                .replace(/\s*#{1,6}\s+/g, ' ') // 줄 중간의 # 제거
                                .replace(/\*\*/g, '') // ** 볼드 제거
                                .replace(/\*/g, '') // * 이탤릭 제거
                              }
                            </div>
                        </div>
                    )}
                    {postingResult.success && postingResult.generatedContent && (
                        <div className="mt-10 space-y-4">
                            <button
                                onClick={handlePublishToNaver}
                                className="w-full py-8 bg-gradient-to-r from-[#03c75a] to-[#00d564] text-white rounded-2xl font-black text-2xl hover:shadow-2xl hover:shadow-green-500/30 transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                🚀 자동 포스팅 시작
                            </button>
                            <div className="p-6 bg-blue-950/30 border border-blue-900/50 rounded-xl space-y-2">
                                <p className="text-sm text-blue-300 font-bold">
                                    💡 자동 포스팅 안내
                                </p>
                                <p className="text-xs text-blue-400 leading-relaxed">
                                    • 버튼 클릭 시 네이버 계정 정보가 임시 저장됩니다<br/>
                                    • Cursor AI 채팅창에서 "네이버 블로그 자동 발행 실행"을 입력하면 AI가 자동으로 로그인 → 글쓰기 → 발행을 진행합니다<br/>
                                    • 모든 작업 완료 후 계정 정보는 자동으로 삭제됩니다
                                </p>
                            </div>
                        </div>
                    )}
                </div>
             )}
          </div>
        )}
      </main>

      <footer className={`text-center py-20 opacity-20 text-[10px] font-black tracking-[0.5em] uppercase transition-colors ${activeView === 'dashboard' ? 'text-white' : 'text-gray-600'}`}>
        N-AutoPost v3.0 • Premium AI Suite
      </footer>
    </div>
  );
};

export default App;
