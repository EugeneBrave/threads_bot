export interface Post {
  text: string;
  permalink: string;
  keyword?: string;
}

export interface DayData {
  keyword_tags: string[];
  ai_summary: string;
  posts: Post[];
}

export type PostsData = Record<string, DayData>;
