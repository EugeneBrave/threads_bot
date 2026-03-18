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

export interface DayData {
  keyword_tags: string[];
  ai_summary: string;
  posts: Post[];
}

export type PostsData = Record<string, DayData>;
