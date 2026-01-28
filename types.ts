
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  summary: string;
  published_at?: string; // 발행일 (YYYY-MM-DD)
  excerpts?: string[]; // 본문 발췌/요약
  key_points?: string[]; // 핵심 수치/인용
}

export type NewsSelectionMethod = 'trending' | 'manual';

export type Tone = 'professional' | 'soft' | 'humorous' | 'analytical' | 'friendly';

export type PhotoOption = 'news' | 'ai' | 'none';

export type Angle = 'investment' | 'policy' | 'technology' | 'life';

export type WritingStyle = 'blogger' | 'news'; // blogger: 블로거 스타일 (1인칭, 친근), news: 뉴스 기사체 (중립, 사실 중심)

export interface PostSettings {
  useAiTitle: boolean;
  manualTitle: string;
  tone: Tone;
  photoOption: PhotoOption;
  topic?: string; // 주제/키워드 (선택사항)
  angle?: Angle; // 관점
  writingStyle?: WritingStyle; // 글쓰기 스타일 (기본값: news)
}

export interface PostingResult {
  success: boolean;
  message: string;
  generatedContent?: {
    title: string;
    body: string;
    imageUrl?: string;
  };
}
