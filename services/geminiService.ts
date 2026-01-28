
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
  
  // Gemini 모델 사용 (최신 2.5 Flash - 2026년 기준 최신 모델)
  // 개발정의서.md 29줄: Gemini 2.5 Pro 명시, 현재는 2.5 Flash 사용 (빠르고 안정적)
  const model = 'gemini-2.5-flash'; // 2026년 1월 기준 최신 안정 모델
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
  
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
    const useDummyData = false; // API 키 입력 완료: 실제 Gemini API 사용
    
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

⚠️ 중요: JSON 배열 형식으로만 반환해줘. 마크다운 코드 블록(\`\`\`json) 사용하지 말 것!

각 뉴스는 다음 형식으로 작성:
[
  {
    "id": "news1",
    "title": "뉴스 제목 (핵심 키워드 포함, 20-40자)",
    "source": "언론사명",
    "summary": "뉴스 요약 (2-3줄, 핵심 내용 중심)",
    "link": "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=015&aid=0004945123",
    "published_at": "2026-01-27",
    "excerpts": [
      "본문 발췌 1 (구체적인 내용)",
      "본문 발췌 2 (추가 세부사항)"
    ],
    "key_points": [
      "핵심 수치나 인용문 1",
      "핵심 수치나 인용문 2"
    ]
  }
]

예시:
{
  "id": "news1",
  "title": "삼성전자, 3나노 반도체 양산 성공...세계 최초 상용화",
  "source": "한국경제",
  "summary": "삼성전자가 3나노 공정 반도체 양산에 성공하며 세계 최초로 상용화에 나섰다. 기존 5나노 대비 성능 30% 향상, 전력 소모 50% 감소를 실현했다.",
  "link": "https://news.naver.com/main/read.naver?mode=LSD&mid=shm&sid1=105&oid=015&aid=0004945123",
  "published_at": "2026-01-27",
  "excerpts": [
    "삼성전자는 27일 평택 반도체 공장에서 3나노 GAA(Gate-All-Around) 공정을 적용한 차세대 반도체 양산을 시작했다고 밝혔다.",
    "업계에서는 이번 성과로 삼성이 TSMC와의 기술 격차를 좁히고 AI 반도체 시장에서 경쟁력을 확보할 것으로 전망하고 있다."
  ],
  "key_points": [
    "성능 30% 향상, 전력 소모 50% 감소",
    "연구개발비 20조원 투자, 엔지니어 5천명 투입"
  ]
}`;

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
    // API 실패 시 더미 데이터 10개 반환
    console.warn("⚠️ API 실패로 인해 더미 데이터 10개 사용");
    return [
      {
        id: "fallback1",
        title: "삼성전자, 차세대 AI 반도체 개발 본격화...글로벌 시장 공략 나서",
        source: "한국경제",
        summary: "삼성전자가 인공지능(AI) 반도체 시장 선점을 위해 차세대 제품 개발에 박차를 가하고 있다.",
        link: "https://news.naver.com/",
        published_at: "2026-01-27",
        excerpts: [
          "삼성전자는 AI 반도체 시장에서 경쟁력을 확보하기 위해 3나노 공정 기반의 차세대 제품 개발에 집중하고 있다.",
          "업계에서는 2026년 하반기 본격 양산을 목표로 하고 있으며, 글로벌 시장 점유율 30% 달성을 목표로 하고 있다."
        ],
        key_points: [
          "R&D 투자 15조원 규모",
          "AI 반도체 전문 인력 3,000명 확보"
        ]
      },
      {
        id: "fallback2",
        title: "전기차 배터리 성능 2배 향상...충전 시간 10분으로 단축",
        source: "IT조선",
        summary: "국내 연구진이 전기차 배터리 충전 속도를 획기적으로 개선하는 기술을 개발했다.",
        link: "https://news.naver.com/",
        published_at: "2026-01-27",
        excerpts: [
          "한국과학기술원(KAIST) 연구팀이 리튬이온 배터리의 에너지 밀도를 2배 향상시키는 신소재를 개발했다.",
          "이 기술은 완전 충전 시간을 기존 1시간에서 10분으로 단축할 수 있어 전기차 보급 확대에 크게 기여할 것으로 기대된다."
        ],
        key_points: [
          "에너지 밀도 2배 향상",
          "충전 시간 10분으로 단축",
          "2027년 상용화 목표"
        ]
      },
      {
        id: "fallback3",
        title: "서울 아파트 평균 매매가 12억 돌파...강남권은 20억 육박",
        source: "매일경제",
        summary: "서울 아파트 평균 매매가가 사상 처음으로 12억원을 넘어섰다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback4",
        title: "ChatGPT 한국어 버전 업데이트...K-컬처 특화 기능 추가",
        source: "디지털타임스",
        summary: "오픈AI가 ChatGPT 한국어 버전에 K-pop, K-드라마 등 한국 문화 콘텐츠에 특화된 기능을 추가했다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback5",
        title: "2026년 최저임금 1만 2천원 확정...전년 대비 5.3% 인상",
        source: "연합뉴스",
        summary: "최저임금위원회가 2026년 최저임금을 시간당 1만 2천원으로 최종 확정했다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback6",
        title: "BTS 정국, 솔로 앨범 빌보드 1위...K-POP 역사 새로 써",
        source: "중앙일보",
        summary: "방탄소년단 정국의 솔로 앨범이 빌보드 메인 차트에서 1위를 차지했다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback7",
        title: "우리나라 출산율 0.68명...역대 최저 경신",
        source: "서울신문",
        summary: "통계청이 발표한 2025년 합계출산율이 0.68명으로 집계됐다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback8",
        title: "손흥민, EPL 통산 200골 달성...아시아 선수 최초",
        source: "조선일보",
        summary: "토트넘의 손흥민이 프리미어리그 통산 200골을 달성했다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback9",
        title: "서울 지하철 9호선 연장 개통...김포공항역까지 직결",
        source: "한겨레",
        summary: "서울 지하철 9호선이 김포공항역까지 연장 개통됐다.",
        link: "https://news.naver.com/"
      },
      {
        id: "fallback10",
        title: "AI가 진단하는 암 조기 발견율 95%...의료 혁명 예고",
        source: "IT조선",
        summary: "인공지능(AI)을 활용한 암 진단 시스템이 조기 발견율 95%를 달성했다.",
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
  // 글쓰기 스타일 결정 (기본값: news 기사체)
  const writingStyle = settings.writingStyle || 'news';
  
  console.log(`✍️ 글쓰기 스타일: ${writingStyle === 'news' ? '전문 뉴스 기사체' : '블로거 스타일'}`);
  
  // 실제 Gemini API 호출
  const toneDescriptions: Record<Tone, string> = {
    professional: "전문적이고 신뢰감 있는 뉴스 브리핑 스타일",
    soft: "부드럽고 따뜻한 공감형 에세이 스타일",
    humorous: "재치 있고 유머러스한 블로그 포스팅 스타일",
    analytical: "냉철하고 상세한 데이터 기반 분석 스타일",
    friendly: "친근하고 편안한 이웃과 대화하는 듯한 스타일"
  };

  // 관점 설명
  const angleDescriptions = {
    investment: '투자 (주식, 자산, 수익성 중심)',
    policy: '정책 (정부 정책, 규제, 제도 중심)',
    technology: '기술 (혁신, 기술 발전, 구현 방법 중심)',
    life: '생활영향 (일상 변화, 소비자 영향 중심)'
  };

  // 스크랩한 기사 준비
  const scrapedArticles = `[1] (${news.source}) ${news.title}
URL: ${news.link}
${news.published_at ? `발행: ${news.published_at}` : ''}
본문 발췌/요약:
${news.excerpts ? news.excerpts.map(e => `- ${e}`).join('\n') : `- ${news.summary}`}
${news.key_points ? `핵심 수치/인용:\n${news.key_points.map(k => `- ${k}`).join('\n')}` : ''}`;

  // 내 생각 메모
  const myNotes = thoughts || '';

  // 프롬프트 선택: news 기사체 vs blogger 스타일
  let prompt = '';

  if (writingStyle === 'news') {
    // ===== 전문 뉴스 기사체 프롬프트 (naver_news_blog_ko.md 기반) =====
    prompt = `## 역할
당신은 한국 뉴스 전문 분석가이며 네이버 블로그 뉴스 기사 작성 전문가입니다.
목표는 **사실 기반의 안전하고 검색 친화적인 뉴스 기사**를 작성하는 것입니다.

## 핵심 원칙 (절대 준수)
- 상위 기사 원문에 없는 사실, 수치, 일정, 전망은 절대 추가하지 않습니다.
- 추측, 해석, 개인 의견, 투자 조언을 포함하지 않습니다.
- 클릭베이트, 자극적 표현, 감정적 수사, 이모지를 사용하지 않습니다.
- 기사체(담백하고 중립적인 문체)를 유지합니다.
- 출력은 반드시 JSON만. JSON 외 텍스트 금지. 마크다운 코드 블록(\`\`\`json) 사용 금지.

## 입력값
- 주제/키워드: ${settings.topic || '(자동 추출)'}
- 시간 범위: 최근 24시간
- 글 목적: ${angleDescriptions[settings.angle || 'technology']}

## 스크랩한 기사 원문
${scrapedArticles}

## 제목 작성 규칙
- 사실 + 핵심 수치 중심으로 작성합니다.
- 물음표, 감탄사, 이모지 사용 금지.
- 과장·유도 문구 금지.

## 본문 구조 (고정)
아래 구조를 **자연스럽게** 따르되, 섹션 제목이나 번호는 본문에 포함하지 마세요:

1. **핵심 요약** (3줄 이내)
   - 사건 또는 발표의 핵심 사실
   - 발표 주체와 시점
   - 가장 중요한 수치 또는 결과

2. **주요 내용**
   - 상위 기사 원문에 포함된 정보만 사용합니다.
   - 수치는 단위와 증감률을 함께 표기합니다.
   - 인과관계는 기사에서 명시된 범위까지만 설명합니다.

3. **배경 및 원인**
   - 기사에 명시된 원인만 정리합니다.
   - 추론, 해석, 확대 해석 금지.

4. **향후 일정 또는 추가 절차** (있는 경우에만)
   - 공식적으로 언급된 일정이나 절차만 작성합니다.

## 작성 규칙
⚠️ 중요: **순수 텍스트**로만 작성! HTML 태그, 마크다운 문법 절대 사용 금지!
- 문단 구분은 빈 줄(\\n\\n)로만
- 절대로 <p>, <h2>, ##, #, **, * 같은 HTML/마크다운 기호 사용 금지!
- 이모지 섹션 제목 사용 금지!
- 본문 내 출처는 "○○에 따르면", "공시에 따르면" 형태로 자연스럽게 명시

## 안전 필터
아래 표현은 절대 사용하지 마세요:
"내가 보기엔", "전망", "투자자", "충격", "반전", "대박", "폭락", 모든 이모지

## 출처 표기 (필수)
글 마지막에 반드시 아래 형식으로 출처를 명확히 표기하세요:

━━━━━━━━━━━━━━━━━━━━

※ 출처: ${news.source}
※ 기사 링크: ${news.link}
${news.published_at ? `※ 발행일: ${news.published_at}` : ''}

## 출력 기준
- 분량: 800~1,200자 내외
- 정보 밀도 높은 단문 위주
- 뉴스 기사형 문체 유지

## 출력 JSON 스키마
⚠️ 반드시 아래 JSON 형식으로만 출력! 다른 텍스트 절대 금지!
{
  "title": "string (${settings.useAiTitle ? '사실 + 핵심 수치 중심 제목, 20-40자' : settings.manualTitle || news.title})",
  "body": "string (위 구조를 따르는 순수 텍스트 본문, HTML/마크다운/이모지 없음)"
}

이제 위 입력값과 스크랩 자료를 바탕으로, 스키마에 맞춰 JSON만 출력하세요.`;
  } else {
    // ===== 블로거 스타일 프롬프트 (기존) =====
    prompt = `당신은 한국 네이버 뉴스 블로그를 운영하는 시사 해설 블로거입니다.
목표는 "기사 요약 + 맥락 + 내 생각(1인칭)"이 섞인, 사람이 쓴 듯한 블로그 글을 만드는 것입니다.

[중요 원칙]
- 원문 문장을 그대로 복사하지 마세요(표절 금지). 같은 의미라도 문장을 새로 작성하세요.
- 사실과 의견을 구분하세요. 확인되지 않은 내용은 단정하지 말고 "보도에 따르면" 등으로 표현하세요.
- 과장/선동/자극적인 표현 금지. 차분하고 이해하기 쉬운 한국어 블로그 톤.
- 출력은 반드시 JSON만. JSON 외 텍스트 금지. 마크다운 코드 블록(\`\`\`json) 사용 금지.

[입력값]
- 주제/키워드: ${settings.topic || '(자동 추출)'}
- 글의 목적/관점: ${angleDescriptions[settings.angle || 'technology']}
- 톤: ${toneDescriptions[settings.tone]}
- 내 생각 메모: ${myNotes ? `"${myNotes}"` : '(없음)'}

[스크랩한 기사/자료]
${scrapedArticles}

[content 작성 규칙]
⚠️ 중요: **순수 텍스트**로만 작성! HTML 태그, 마크다운 문법 절대 사용 금지!
- 문단 구분은 빈 줄(\\n\\n)로만
- 절대로 <p>, <h2>, ##, #, **, * 같은 HTML/마크다운 기호 사용 금지!
- 이모지 섹션 제목(예: 📰 오늘의 핵심 뉴스 요약) 사용 금지!
- 자연스럽게 흐르는 블로그 글처럼 작성

[글의 흐름 및 구조]
아래 내용을 **자연스럽게 통합**하여 한 편의 블로그 글로 작성하세요:

1. **도입부**: 핵심 뉴스를 2-3줄로 요약하며 시작
2. **사실 전달**: 무슨 일이 있었는지 구체적으로 설명 (출처, 날짜, 수치 포함)
3. **의미 분석**: 왜 중요한지, 누구에게 영향을 미치는지 설명
4. **맥락 제공**: 배경과 흐름
5. **전망**: 앞으로 주목할 포인트
6. **개인 의견** (1인칭 사용): "저는...", "제 생각에는..."
   - 내 생각 메모가 있으면 그 내용을 우선 반영하여 확장
7. **마무리**: 한 문장으로 핵심 요약

⚠️ 중요: 위 번호(1, 2, 3...)나 이모지 제목을 글에 넣지 마세요! 자연스럽게 이어지는 한 편의 블로그 글로 작성하세요.

[출처 표기] (필수)
글 마지막에 반드시 아래 형식으로 출처를 명확히 표기하세요:

━━━━━━━━━━━━━━━━━━━━

📌 참고 자료
• 출처: ${news.source}
• 기사 링크: ${news.link}
${news.published_at ? `• 발행일: ${news.published_at}` : ''}

⚠️ 이 글은 위 출처를 바탕으로 작성되었으며, 블로거의 개인적인 해석과 의견이 포함되어 있습니다.

[출력 JSON 스키마]
⚠️ 반드시 아래 JSON 형식으로만 출력! 다른 텍스트 절대 금지!
{
  "title": "string (${settings.useAiTitle ? '뉴스 내용과 내 생각을 결합한 매력적인 제목, 20-40자' : settings.manualTitle || news.title})",
  "body": "string (위 구조를 따르는 순수 텍스트 본문, HTML/마크다운 없음)"
}

이제 위 입력값과 스크랩 자료를 바탕으로, 스키마에 맞춰 JSON만 출력하세요.`;
  }

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
      body: `${news.summary}\n\n${thoughts}`,
      imageUrl
    };
  }
};

/**
 * AI가 뉴스 본문을 분석하여 후크성 있는 제목 5개를 추천
 */
export const generateTitleSuggestions = async (news: NewsItem): Promise<string[]> => {
  const useDummyData = false; // API 키 입력 완료: 실제 Gemini API 사용

  if (useDummyData) {
    console.log('🔧 개발 모드: 더미 제목 추천 사용');
    return [
      `🚨 ${news.title.substring(0, 20)}... 이게 진짜일까?`,
      `💰 돈 되는 정보! ${news.title.substring(0, 15)}의 숨은 의미`,
      `⚠️ 놓치면 후회할 ${news.title.substring(0, 20)}`,
      `🔥 지금 핫한 ${news.title.substring(0, 15)}, 전문가 분석`,
      `✨ ${news.title.substring(0, 25)}의 모든 것`
    ];
  }

  const prompt = `당신은 네이버 블로그의 전문 카피라이터입니다.
아래 뉴스 기사를 읽고, 클릭을 유도하는 **후크성 강한 제목 5개**를 제안해주세요.

[뉴스 정보]
제목: ${news.title}
출처: ${news.source}
요약: ${news.summary}
${news.excerpts ? `본문 발췌:\n${news.excerpts.join('\n')}` : ''}
${news.key_points ? `핵심 포인트:\n${news.key_points.join('\n')}` : ''}

[제목 작성 원칙]
1. 20~40자 사이로 작성
2. 호기심 유발 + 구체적 정보 포함
3. 숫자/이모지 활용 (예: 🚨, 💰, ⚠️, 🔥, ✨)
4. 1인칭 또는 독자 직접 호명 (예: "당신이 꼭 알아야 할", "지금 내가 보는")
5. 긴급성/희소성 표현 (예: "지금", "오늘", "놓치면 후회")
6. 감정 자극 (예: "충격", "반전", "의외의")

[출력 형식]
반드시 JSON 배열로만 출력하세요. 다른 텍스트 금지!
["제목1", "제목2", "제목3", "제목4", "제목5"]

이제 위 뉴스를 바탕으로 5개의 후크성 제목을 JSON 배열로 출력하세요.`;

  try {
    const resultText = await callGeminiAPI(prompt);
    
    // JSON 배열 추출
    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("JSON 배열 형식을 찾을 수 없습니다.");
    }
    
    const titles = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error("유효한 제목 배열을 생성하지 못했습니다.");
    }
    
    console.log('✅ AI 제목 추천 성공:', titles);
    return titles.slice(0, 5); // 최대 5개만
    
  } catch (error: any) {
    console.error('❌ AI 제목 추천 실패:', error);
    
    // 오류 발생 시 기본 제목 반환
    return [
      `${news.title}`,
      `🔍 ${news.title} - 심층 분석`,
      `💡 ${news.title}의 숨은 의미`,
      `⚠️ ${news.title}, 알고 보니...`,
      `✨ ${news.title} - 전문가 해설`
    ];
  }
};
