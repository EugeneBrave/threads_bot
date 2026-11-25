import styled, { keyframes } from 'styled-components';
import type { Post } from '../types';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardWrapper = styled.article<{ $index: number; $featured: boolean }>`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  animation: ${fadeIn} 0.4s ease forwards;
  animation-delay: ${(props) => Math.min(props.$index * 0.05, 0.35)}s;
  opacity: 0;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--border-strong);
    transform: translateY(-2px);
  }

  ${(props) =>
    props.$featured &&
    `
    @media (min-width: 1024px) {
      grid-column: span 2;
      border-top: 3px solid var(--accent-indigo);
    }
  `}
`;

const CardTopMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
`;

const IssueIndex = styled.span`
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.06em;
`;

const KeywordBadge = styled.span`
  background: var(--accent-indigo-soft);
  color: var(--accent-indigo);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 16px;
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
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostDate = styled.span`
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 1px;
`;

const PostText = styled.div<{ $featured: boolean }>`
  color: var(--text-primary);
  font-size: ${(props) => (props.$featured ? '16px' : '14.5px')};
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
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
  gap: 14px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-terracotta);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: opacity 0.2s;

  &:hover {
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
  const initial = post.username ? post.username.replace(/^@/, '').charAt(0) : 'T';
  const isFeatured = index === 0;

  return (
    <CardWrapper $index={index} $featured={isFeatured}>
      <div>
        <CardTopMeta>
          <IssueIndex>NO. {String(index + 1).padStart(2, '0')}</IssueIndex>
          {post.keyword && <KeywordBadge>{post.keyword}</KeywordBadge>}
        </CardTopMeta>

        <CardHeader style={{ marginTop: 14 }}>
          <Avatar aria-hidden="true">{initial}</Avatar>
          <UserInfo>
            <Username>{post.username}</Username>
            {post.post_date && <PostDate>{post.post_date}</PostDate>}
          </UserInfo>
        </CardHeader>
      </div>

      <PostText $featured={isFeatured}>{post.content}</PostText>

      <BottomRow>
        <StatsRow>
          <StatItem>
            <span aria-hidden="true">❤️</span> {formatNumber(post.likes)}
          </StatItem>
          <StatItem>
            <span aria-hidden="true">💬</span> {formatNumber(post.comments)}
          </StatItem>
          <StatItem>
            <span aria-hidden="true">🔁</span> {formatNumber(post.reposts)}
          </StatItem>
        </StatsRow>
        <LinkButton href={post.permalink} target="_blank" rel="noopener noreferrer">
          查看原文 →
        </LinkButton>
      </BottomRow>
    </CardWrapper>
  );
};

export default PostCard;
