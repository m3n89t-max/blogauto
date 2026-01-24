
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  summary: string;
}

export type NewsSelectionMethod = 'trending' | 'manual';

export type Tone = 'professional' | 'soft' | 'humorous' | 'analytical' | 'friendly';

export type PhotoOption = 'news' | 'ai' | 'none';

export interface PostSettings {
  useAiTitle: boolean;
  manualTitle: string;
  tone: Tone;
  photoOption: PhotoOption;
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
