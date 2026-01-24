
import { NewsItem, PostSettings, Tone } from "../types";

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env.local 파일에 VITE_GEMINI_API_KEY를 설정해주세요.');
  }
  return apiKey;
};

// Gemini REST API 호출 헬퍼 함수
const callGeminiAPI = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  // Gemini 1.5 Flash 모델 사용
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`📍 모델: ${model}`);
  console.log(`📍 URL: ${url.replace(apiKey, '***API_KEY***')}`);
  
  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };
  
  console.log(`📤 Request Body: ${JSON.stringify(requestBody, null, 2).substring(0, 200)}...`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Gemini API Error (Full):`, errorText);
    let errorMessage = `Gemini API 호출 실패: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      console.error(`❌ Parsed Error:`, JSON.stringify(errorJson, null, 2));
      if (errorJson.error && errorJson.error.message) {
        errorMessage += `\n상세: ${errorJson.error.message}`;
      }
    } catch (e) {
      console.error(`❌ Failed to parse error:`, e);
      errorMessage += `\n원본: ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`✅ 성공! Response: ${JSON.stringify(data).substring(0, 200)}...`);
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
    throw new Error('Gemini API 응답에 유효한 콘텐츠가 없습니다.');
  }
  
  return data.candidates[0].content.parts[0].text;
};

// 네이버 뉴스 가져오기 (현재는 AI 생성, 추후 네이버 API로 전환 예정)
export const fetchTrendingNews = async (): Promise<NewsItem[]> => {
  // TODO: 네이버 검색 API 연동 시 이 부분을 교체
  // 현재는 AI가 현실적인 뉴스를 생성
  return await fetchNewsWithAI();
};

// AI로 현실적인 뉴스 생성
const fetchNewsWithAI = async (): Promise<NewsItem[]> => {
  try {
    // 개발 중: API 키 문제로 인해 더미 데이터 사용
    const useDummyData = true; // TODO: API 키 문제 해결 시 false로 변경
    
    if (useDummyData) {
      console.log('🔧 개발 모드: 더미 뉴스 데이터 사용');
      return [
        {
          id: "news1",
          title: "삼성전자, 차세대 AI 반도체 개발 본격화...글로벌 시장 공략 나서",
          source: "한국경제",
          summary: "삼성전자가 인공지능(AI) 반도체 시장 선점을 위해 차세대 제품 개발에 박차를 가하고 있다. 업계에 따르면 삼성전자는 고성능 AI 칩 양산 체제를 구축하고 있으며, 2026년 상반기 출시를 목표로 하고 있다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=015&aid=0004945123"
        },
        {
          id: "news2",
          title: "전기차 배터리 성능 2배 향상...충전 시간 10분으로 단축",
          source: "IT조선",
          summary: "국내 연구진이 전기차 배터리 충전 속도를 획기적으로 개선하는 기술을 개발했다. 이 기술은 기존 배터리 대비 에너지 밀도가 2배 높고, 충전 시간은 10분으로 단축되어 전기차 보급 확대에 기여할 것으로 전망된다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=031&aid=0000812345"
        },
        {
          id: "news3",
          title: "서울 아파트 평균 매매가 12억 돌파...강남권은 20억 육박",
          source: "매일경제",
          summary: "서울 아파트 평균 매매가가 사상 처음으로 12억원을 넘어섰다. 특히 강남권은 평균 20억원에 육박하며 상승세가 지속되고 있다. 전문가들은 금리 인하 기대감과 공급 부족이 복합적으로 작용한 것으로 분석하고 있다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=101&oid=009&aid=0005345678"
        },
        {
          id: "news4",
          title: "ChatGPT 한국어 버전 업데이트...K-컬처 특화 기능 추가",
          source: "디지털타임스",
          summary: "오픈AI가 ChatGPT 한국어 버전에 K-pop, K-드라마 등 한국 문화 콘텐츠에 특화된 기능을 추가했다. 이번 업데이트로 한국 사용자들의 만족도가 크게 향상될 것으로 기대된다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=029&aid=0002812345"
        },
        {
          id: "news5",
          title: "2026년 최저임금 1만 2천원 확정...전년 대비 5.3% 인상",
          source: "연합뉴스",
          summary: "최저임금위원회가 2026년 최저임금을 시간당 1만 2천원으로 최종 확정했다. 이는 전년 대비 5.3% 인상된 수준으로, 월급으로 환산하면 약 250만원에 해당한다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=101&oid=001&aid=0014567890"
        },
        {
          id: "news6",
          title: "BTS 정국, 솔로 앨범 빌보드 1위...K-POP 역사 새로 써",
          source: "중앙일보",
          summary: "방탄소년단 정국의 솔로 앨범이 빌보드 메인 차트에서 1위를 차지하며 K-POP의 저력을 다시 한번 입증했다. 이는 한국 솔로 가수 최초로 빌보드 200 차트 정상을 차지한 쾌거다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=106&oid=025&aid=0003456789"
        },
        {
          id: "news7",
          title: "우리나라 출산율 0.68명...역대 최저 경신",
          source: "서울신문",
          summary: "통계청이 발표한 2025년 합계출산율이 0.68명으로 집계되며 역대 최저치를 또다시 경신했다. 정부는 저출산 대응 예산을 대폭 확대하고 전방위적인 대책 마련에 나섰다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=102&oid=081&aid=0003567890"
        },
        {
          id: "news8",
          title: "손흥민, EPL 통산 200골 달성...아시아 선수 최초",
          source: "조선일보",
          summary: "토트넘의 손흥민이 프리미어리그(EPL) 통산 200골을 달성하며 아시아 선수 최초의 기록을 세웠다. 손흥민은 EPL 역사에서도 손꼽히는 공격수로 자리매김했다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=107&oid=023&aid=0003678901"
        },
        {
          id: "news9",
          title: "서울 지하철 9호선 연장 개통...김포공항역까지 직결",
          source: "한겨레",
          summary: "서울 지하철 9호선이 김포공항역까지 연장 개통되며 서울 서부권 교통 편의성이 크게 개선됐다. 출퇴근 시간이 평균 20분 단축될 것으로 예상된다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=102&oid=028&aid=0002789012"
        },
        {
          id: "news10",
          title: "AI가 진단하는 암 조기 발견율 95%...의료 혁명 예고",
          source: "IT조선",
          summary: "인공지능(AI)을 활용한 암 진단 시스템이 조기 발견율 95%를 달성하며 의료계에 혁신을 가져오고 있다. 전문가들은 AI 의료 기술이 인류의 수명 연장에 크게 기여할 것으로 전망하고 있다.",
          link: "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=031&aid=0000890123"
        }
      ];
    }
    
    // 실제 Gemini API 호출 (API 키 정상 작동 시)
    const prompt = `대한민국의 최근 이슈와 트렌드를 반영한 현실적인 뉴스 10개를 생성해줘.

요구사항:
1. 2026년 1월 현재 시점의 뉴스
2. 다양한 분야: IT/기술, 경제/금융, 사회, 정치, 국제, 문화/연예, 스포츠, 생활
3. 실제 있을 법한 구체적이고 현실적인 제목과 내용
4. 다양한 언론사: 조선일보, 중앙일보, 한국경제, 매일경제, 서울신문, 한겨레, 연합뉴스, IT조선, 디지털타임스 등

JSON 배열 형식으로만 반환해줘. 각 뉴스는 다음 형식:
[
  {
    "id": "news1",
    "title": "뉴스 제목",
    "source": "언론사명",
    "summary": "뉴스 요약",
    "link": "https://news.naver.com/..."
  }
]`;

    const resultText = await callGeminiAPI(prompt);
    
    // JSON 추출 (마크다운 코드 블록이나 다른 텍스트 제거)
    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("JSON 형식을 찾을 수 없습니다:", resultText);
      return [];
    }
    
    const news = JSON.parse(jsonMatch[0]);
    console.log(`✅ AI가 생성한 뉴스 ${news.length}개 (추후 실제 네이버 API로 전환 예정)`);
    return news;
  } catch (error) {
    console.error("뉴스 생성 실패:", error);
    // API 실패 시 더미 데이터 반환
    console.warn("⚠️ API 실패로 인해 더미 데이터 사용");
    return [
      {
        id: "fallback1",
        title: "AI 기술 발전으로 일상 생활 변화...스마트 홈 시장 급성장",
        source: "한국경제",
        summary: "인공지능 기술의 발전으로 스마트 홈 시장이 급성장하고 있다. 음성 인식과 자동화 시스템이 결합되어 생활 편의성이 크게 향상되고 있으며, 관련 산업도 활기를 띠고 있다.",
        link: "https://news.naver.com/"
      }
    ];
  }
};

export const generateBlogPost = async (
  news: NewsItem,
  thoughts: string,
  settings: PostSettings
): Promise<{ title: string; body: string; imageUrl?: string }> => {
  // 개발 중: API 키 문제로 인해 더미 데이터 사용
  const useDummyData = true; // TODO: API 키 문제 해결 시 false로 변경
  
  if (useDummyData) {
    console.log('🔧 개발 모드: 더미 블로그 포스트 생성');
    
    const toneTexts: Record<Tone, string> = {
      professional: "전문적인 분석과 통찰을 담아",
      soft: "부드럽고 따뜻한 시선으로",
      humorous: "재치있고 유머러스하게",
      analytical: "냉철하고 객관적인 데이터 기반으로",
      friendly: "친근하고 편안한 대화체로"
    };
    
    let imageUrl = undefined;
    if (settings.photoOption === 'ai' || settings.photoOption === 'news') {
      imageUrl = `https://picsum.photos/seed/${news.id}/800/450`;
    }
    
    return {
      title: settings.useAiTitle 
        ? `${news.title} - 나의 생각` 
        : settings.manualTitle || news.title,
      body: `
        <h2>${news.title}</h2>
        <p class="text-gray-600 mb-4"><strong>출처:</strong> ${news.source}</p>
        
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-3">뉴스 요약</h3>
          <p class="leading-relaxed">${news.summary}</p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-3">나의 생각</h3>
          <p class="leading-relaxed">${thoughts || '이 뉴스에 대한 개인적인 견해를 작성해보세요.'}</p>
        </div>
        
        <div class="mt-8 p-4 bg-gray-100 rounded-lg">
          <p class="text-sm text-gray-600">
            <strong>작성 스타일:</strong> ${toneTexts[settings.tone]} 작성되었습니다.<br>
            <strong>사진 옵션:</strong> ${settings.photoOption === 'news' ? '뉴스 사진' : settings.photoOption === 'ai' ? 'AI 생성' : '사진 없음'}
          </p>
        </div>
        
        <p class="mt-6 text-xs text-gray-500">
          ⚠️ 개발 모드: Gemini API 연동 후 실제 AI 생성 콘텐츠로 교체됩니다.
        </p>
      `,
      imageUrl
    };
  }
  
  // 실제 Gemini API 호출 (API 키 정상 작동 시)
  const toneDescriptions: Record<Tone, string> = {
    professional: "전문적이고 신뢰감 있는 뉴스 브리핑 스타일",
    soft: "부드럽고 따뜻한 공감형 에세이 스타일",
    humorous: "재치 있고 유머러스한 블로그 포스팅 스타일",
    analytical: "냉철하고 상세한 데이터 기반 분석 스타일",
    friendly: "친근하고 편안한 이웃과 대화하는 듯한 스타일"
  };

  const prompt = `다음 뉴스를 바탕으로 네이버 블로그 포스팅을 "한국어(Korean)"로 작성해줘.

[뉴스 정보]
제목: ${news.title}
출처: ${news.source}
내용 요약: ${news.summary}

[작성자 생각]
${thoughts}

[작성 조건]
언어: 한국어 (반드시 한국어로만 작성할 것)
말투(톤): ${toneDescriptions[settings.tone]}
제목 설정: ${settings.useAiTitle ? "뉴스 내용과 작성자 생각을 결합한 매력적인 제목 생성" : `직접 입력된 제목(${settings.manualTitle}) 사용`}

[출력 형식]
JSON 형식으로만 반환해줘:
{
  "title": "블로그 제목",
  "body": "<p>본문 내용 (HTML 태그 사용 가능)</p>"
}`;

  try {
    const resultText = await callGeminiAPI(prompt);
    
    // JSON 추출 (마크다운 코드 블록이나 다른 텍스트 제거)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON 형식을 찾을 수 없습니다.");
    }
    
    const content = JSON.parse(jsonMatch[0]);

    let imageUrl = undefined;
    if (settings.photoOption === 'ai') {
      // AI 이미지 생성은 현재 SDK에서 지원하지 않으므로 placeholder 사용
      imageUrl = `https://picsum.photos/seed/${news.id}/800/450`;
    } else if (settings.photoOption === 'news') {
      imageUrl = `https://picsum.photos/seed/${news.id}/800/450`;
    }

    return { ...content, imageUrl };
  } catch (error) {
    console.error("블로그 포스트 생성 실패:", error);
    // API 실패 시 더미 콘텐츠 반환
    console.warn("⚠️ API 실패로 인해 더미 콘텐츠 사용");
    
    let imageUrl = undefined;
    if (settings.photoOption === 'ai' || settings.photoOption === 'news') {
      imageUrl = `https://picsum.photos/seed/${news.id}/800/450`;
    }
    
    return {
      title: settings.useAiTitle ? `${news.title} - 심층 분석` : settings.manualTitle || news.title,
      body: `<p>${news.summary}</p><br><p>${thoughts}</p>`,
      imageUrl
    };
  }
};
