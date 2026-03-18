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
  flex: 1;
`;

const Username = styled.span`
  color: #f5f5f5;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MetaRow = styled.div`
  color: #777;
  font-size: 12px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KeywordBadge = styled.span`
  background: rgba(167, 139, 250, 0.1);
  color: #a78bfa;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(167, 139, 250, 0.2);
`;

const PostText = styled.div`
  color: #eee;
  font-size: 15px;
  line-height: 1.5;
  margin: 0 0 16px;
  white-space: pre-wrap;
  word-break: break-word;
  letter-spacing: -0.01em;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #777;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #a78bfa;
  font-size: 13px;
  text-decoration: none;
  font-weight: 600;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

function formatNumber(n: number): string {
  if (n === 0) return '0';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}萬`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface PostCardProps {
  post: Post;
  index: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
  const getEmoji = (keyword?: string) => {
    if (!keyword) return '👤';
    const kw = keyword.toLowerCase();
    if (kw.includes('復古')) return '🧥';
    if (kw.includes('咔嘰')) return '👖';
    if (kw.includes('穿搭')) return '👔';
    return '👤';
  };

  return (
    <CardWrapper $index={index}>
      <CardHeader>
        <Avatar>{getEmoji(post.keyword)}</Avatar>
        <UserInfo>
          <Username>{post.username}</Username>
          <MetaRow>
            {post.post_date && <span>{post.post_date}</span>}
            {post.keyword && <KeywordBadge>{post.keyword}</KeywordBadge>}
          </MetaRow>
        </UserInfo>
      </CardHeader>
      <PostText>{post.content}</PostText>
      <BottomRow>
        <StatsRow>
          <StatItem><span>❤️</span> {formatNumber(post.likes)}</StatItem>
          <StatItem><span>💬</span> {formatNumber(post.comments)}</StatItem>
          <StatItem><span>🔁</span> {formatNumber(post.reposts)}</StatItem>
        </StatsRow>
        <LinkButton href={post.permalink} target="_blank" rel="noopener noreferrer">
          查看原文 →
        </LinkButton>
      </BottomRow>
    </CardWrapper>
  );
};

export default PostCard;
