import styled, { keyframes } from 'styled-components';
import type { Post } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CardWrapper = styled.article<{ $index: number }>`
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  animation: ${fadeIn} 0.4s ease forwards;
  animation-delay: ${(props) => props.$index * 0.06}s;
  opacity: 0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #833AB4, #FD1D1D, #F77737);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  color: #f5f5f5;
  font-weight: 600;
  font-size: 14px;
`;

const KeywordBadge = styled.span`
  color: #666;
  font-size: 12px;
  margin-top: 2px;
`;

const PostText = styled.p`
  color: #e0e0e0;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 14px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const LinkRow = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4a9eff;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #7cb8ff;
  }
`;

interface PostCardProps {
  post: Post;
  index: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
  // Extract username from the permalink if possible
  const getEmoji = (keyword?: string) => {
    if (!keyword) return '👤';
    if (keyword.includes('復古')) return '🧥';
    if (keyword.includes('咔嘰')) return '👘';
    return '👔';
  };

  return (
    <CardWrapper $index={index}>
      <CardHeader>
        <Avatar>{getEmoji(post.keyword)}</Avatar>
        <UserInfo>
          <Username>Threads 用戶</Username>
          {post.keyword && <KeywordBadge>#{post.keyword}</KeywordBadge>}
        </UserInfo>
      </CardHeader>
      <PostText>{post.text}</PostText>
      <LinkRow href={post.permalink} target="_blank" rel="noopener noreferrer">
        查看原文 →
      </LinkRow>
    </CardWrapper>
  );
};

export default PostCard;
