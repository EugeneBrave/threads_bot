export interface Post {
  permalink: string;
  username: string;
  post_date: string;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  keyword?: string;
}

export interface AiHighlight {
  title: string;
  description: string;
  url: string;
}

export interface AiSummaryData {
  title: string;
  intro: string;
  highlights: AiHighlight[];
}

export interface DayData {
  keyword_tags: string[];
  ai_summary: string | AiSummaryData;
  posts: Post[];
}

export type PostsData = Record<string, DayData>;
