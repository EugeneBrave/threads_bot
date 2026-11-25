import styled from 'styled-components';
import type { Post } from '../types';

const CardWrapper = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const AuthorBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bg-wash);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Username = styled.span`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostDate = styled.span`
  color: var(--text-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
`;

const KeywordTag = styled.span`
  background: var(--accent-soft);
  color: var(--accent);
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const PostText = styled.p`
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.72;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 68ch;
  flex: 1;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
  gap: 12px;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const StatItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`;

const LinkButton = styled.a`
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
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

const PostCard = ({ post }: PostCardProps) => {
  const initial = post.username ? post.username.replace(/^@/, '').charAt(0) : 'T';

  return (
    <CardWrapper>
      <CardHeader>
        <AuthorBlock>
          <Avatar aria-hidden="true">{initial}</Avatar>
          <UserInfo>
            <Username>{post.username}</Username>
            {post.post_date && <PostDate>{post.post_date}</PostDate>}
          </UserInfo>
        </AuthorBlock>
        {post.keyword && <KeywordTag>{post.keyword}</KeywordTag>}
      </CardHeader>

      <PostText>{post.content}</PostText>

      <BottomRow>
        <StatsRow>
          <StatItem aria-label={`按讚數 ${post.likes}`}>
            <span aria-hidden="true">❤️</span>
            <span>{formatNumber(post.likes)}</span>
          </StatItem>
          <StatItem aria-label={`留言數 ${post.comments}`}>
            <span aria-hidden="true">💬</span>
            <span>{formatNumber(post.comments)}</span>
          </StatItem>
          <StatItem aria-label={`轉發數 ${post.reposts}`}>
            <span aria-hidden="true">🔁</span>
            <span>{formatNumber(post.reposts)}</span>
          </StatItem>
        </StatsRow>
        <LinkButton href={post.permalink} target="_blank" rel="noopener noreferrer">
          查看原文
        </LinkButton>
      </BottomRow>
    </CardWrapper>
  );
};

export default PostCard;
