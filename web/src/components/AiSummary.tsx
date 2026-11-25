import React from 'react';
import styled from 'styled-components';
import { AiSummaryData, AiHighlight } from '../types';

interface AiSummaryProps {
  summary: string | AiSummaryData | null | undefined;
}

const RailPanel = styled.aside`
  background: var(--bg-wash);
  border-radius: 10px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 960px) {
    position: sticky;
    top: 84px;
    max-height: calc(100vh - 108px);
    overflow-y: auto;
  }
`;

const DigestHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Headline = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(22px, 2.2vw, 26px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  letter-spacing: -0.02em;
`;

const IntroText = styled.p`
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.75;
`;

const LegacyBody = styled.div`
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.75;

  a {
    color: var(--accent);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const HighlightsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
`;

const HighlightsHeading = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

const HighlightList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const HighlightItem = styled.li`
  padding-left: 14px;
  border-left: 2px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-left-color: var(--accent);
  }
`;

const HighlightTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
`;

const HighlightDesc = styled.p`
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.65;
`;

const HighlightLink = styled.a`
  align-self: flex-start;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  margin-top: 2px;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

function parseAiSummary(text: string): React.ReactNode[] {
  const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)|\*([^*]+)\*/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      nodes.push(...splitNewlines(before, key));
      key += before.split('\n').length;
    }

    if (match[1] && match[2]) {
      nodes.push(
        <a key={`link-${key++}`} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      const url = match[3];
      nodes.push(
        <a key={`url-${key++}`} href={url} target="_blank" rel="noopener noreferrer">
          {shortenUrl(url)}
        </a>
      );
    } else if (match[4]) {
      nodes.push(<strong key={`bold-${key++}`}>{match[4]}</strong>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(...splitNewlines(text.slice(lastIndex), key));
  }

  return nodes;
}

function splitNewlines(text: string, startKey: number): React.ReactNode[] {
  const parts = text.split('\n');
  const result: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i > 0) result.push(<br key={`br-${startKey + i}`} />);
    if (part) result.push(part);
  });
  return result;
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.split('/');
    const user = path.find((p) => p.startsWith('@'));
    if (user) return user;
    return '閱讀原貼文';
  } catch {
    return '閱讀原貼文';
  }
}

const AiSummary = ({ summary }: AiSummaryProps) => {
  if (!summary) return null;

  if (typeof summary === 'string') {
    return (
      <RailPanel aria-label="今日穿搭趨勢摘要">
        <DigestHeader>
          <Headline>今日穿搭趨勢摘要</Headline>
          <LegacyBody>{parseAiSummary(summary)}</LegacyBody>
        </DigestHeader>
      </RailPanel>
    );
  }

  const data = summary as AiSummaryData;
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];

  return (
    <RailPanel aria-label="今日穿搭趨勢摘要">
      <DigestHeader>
        <Headline>{data.title || '今日穿搭趨勢摘要'}</Headline>
        {data.intro && <IntroText>{data.intro}</IntroText>}
      </DigestHeader>

      {highlights.length > 0 && (
        <HighlightsBlock>
          <HighlightsHeading>重點貼文</HighlightsHeading>
          <HighlightList>
            {highlights.map((item: AiHighlight, index: number) => (
              <HighlightItem key={index}>
                <HighlightTitle>{item.title}</HighlightTitle>
                <HighlightDesc>{item.description}</HighlightDesc>
                <HighlightLink href={item.url} target="_blank" rel="noopener noreferrer">
                  閱讀原貼文
                </HighlightLink>
              </HighlightItem>
            ))}
          </HighlightList>
        </HighlightsBlock>
      )}
    </RailPanel>
  );
};

export default AiSummary;
