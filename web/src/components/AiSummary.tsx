import React from 'react';
import styled from 'styled-components';
import { AiSummaryData, AiHighlight } from '../types';

interface AiSummaryProps {
  summary: string | AiSummaryData | null | undefined;
}

const SummarySection = styled.section`
  margin: 28px 0 36px;
`;

const EditorialSpread = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-top: 3px solid var(--border-strong);
  border-radius: 4px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: 5fr 7fr;
  }
`;

const LeadColumn = styled.div`
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);

  @media (min-width: 900px) {
    border-bottom: none;
    border-right: 1px solid var(--border-subtle);
    padding: 36px 32px;
  }
`;

const Kicker = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-terracotta);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 1.5px;
    background: var(--accent-terracotta);
  }
`;

const Headline = styled.h2`
  font-family: var(--font-serif);
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.35;
  margin-bottom: 16px;
  letter-spacing: 0.01em;
`;

const IntroText = styled.p`
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.8;
  margin: 0;
`;

const LegacyContent = styled.div`
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.8;
  padding: 28px;

  a {
    color: var(--accent-indigo);
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: var(--accent-indigo);
    }
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const HighlightsColumn = styled.div`
  padding: 24px 24px 28px;
  background: var(--bg-canvas);

  @media (min-width: 900px) {
    padding: 32px;
  }
`;

const HighlightsHeader = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
`;

const HighlightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const HighlightCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--accent-indigo);
    transform: translateY(-1px);
  }
`;

const HighlightTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HighlightNumber = styled.span`
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-indigo);
`;

const HighlightTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.45;
  margin: 0;
`;

const HighlightDesc = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
`;

const HighlightLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-indigo);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 2px;

  &:hover {
    text-decoration: underline;
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
      const label = shortenUrl(url);
      nodes.push(
        <a key={`url-${key++}`} href={url} target="_blank" rel="noopener noreferrer">
          {label}
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
    if (user) return `🔗 ${user}`;
    return '🔗 查看連結';
  } catch {
    return '🔗 查看連結';
  }
}

const AiSummary = ({ summary }: AiSummaryProps) => {
  if (!summary) return null;

  if (typeof summary === 'string') {
    return (
      <SummarySection aria-label="AI 今日穿搭趨勢速報">
        <EditorialSpread style={{ gridTemplateColumns: '1fr' }}>
          <LegacyContent>
            <Kicker>Editor&apos;s Note · AI Trend Report</Kicker>
            <Headline>AI 今日穿搭趨勢速報</Headline>
            <div>{parseAiSummary(summary)}</div>
          </LegacyContent>
        </EditorialSpread>
      </SummarySection>
    );
  }

  const data = summary as AiSummaryData;
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];

  return (
    <SummarySection aria-label="AI 今日穿搭趨勢速報">
      <EditorialSpread>
        <LeadColumn>
          <div>
            <Kicker>Editor&apos;s Note · AI Trend Report</Kicker>
            <Headline>{data.title || 'AI 今日穿搭趨勢速報'}</Headline>
            {data.intro && <IntroText>{data.intro}</IntroText>}
          </div>
        </LeadColumn>

        {highlights.length > 0 && (
          <HighlightsColumn>
            <HighlightsHeader>Curated Highlights · 精華貼文精選</HighlightsHeader>
            <HighlightsGrid>
              {highlights.map((item: AiHighlight, index: number) => (
                <HighlightCard key={index}>
                  <HighlightTop>
                    <HighlightNumber>{String(index + 1).padStart(2, '0')}</HighlightNumber>
                    <HighlightTitle>{item.title}</HighlightTitle>
                    <HighlightDesc>{item.description}</HighlightDesc>
                  </HighlightTop>
                  <HighlightLink href={item.url} target="_blank" rel="noopener noreferrer">
                    點我觀看原文 ↗
                  </HighlightLink>
                </HighlightCard>
              ))}
            </HighlightsGrid>
          </HighlightsColumn>
        )}
      </EditorialSpread>
    </SummarySection>
  );
};

export default AiSummary;
