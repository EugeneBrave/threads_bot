import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PostCard from '../PostCard';
import { Post } from '../../types';

const mockPost: Post = {
  permalink: 'https://www.threads.net/post/test-123',
  username: 'testuser',
  post_date: '2025-03-18',
  content: '這是一篇測試貼文內容！ #Threads',
  likes: 1250,
  comments: 45,
  reposts: 12,
  shares: 8,
  keyword: '男生穿搭'
};

describe('PostCard', () => {
  it('renders correctly with post data', () => {
    render(<PostCard post={mockPost} index={0} />);
    
    // Check username
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Check date
    expect(screen.getByText('2025-03-18')).toBeInTheDocument();
    
    // Check content
    expect(screen.getByText(/這是一篇測試貼文內容/)).toBeInTheDocument();
    
    // Check keyword badge
    expect(screen.getByText('男生穿搭')).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    // 1250 -> 1.3k based on formatNumber logic (n >= 1000)
    // 1250 / 1000 = 1.25 -> 1.3k
    render(<PostCard post={mockPost} index={0} />);
    
    expect(screen.getByText('1.3k')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('formats very large numbers correctly (萬)', () => {
    const hugePost = { ...mockPost, likes: 54321 };
    render(<PostCard post={hugePost} index={0} />);
    
    // 54321 -> 5.4萬
    expect(screen.getByText('5.4萬')).toBeInTheDocument();
  });

  it('provides correct permalink', () => {
    render(<PostCard post={mockPost} index={0} />);
    const link = screen.getByRole('link', { name: /查看原文/i });
    expect(link).toHaveAttribute('href', mockPost.permalink);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
