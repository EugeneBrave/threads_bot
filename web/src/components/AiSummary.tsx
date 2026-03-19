import React from 'react';
import styled from 'styled-components';
import { AiSummaryData, AiHighlight } from '../types';

interface AiSummaryProps {
  summary: string | AiSummaryData | null | undefined;
}

const SummaryWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px 20px;
`;

const SummaryBox = styled.div`
  background: linear-gradient(135deg, rgba(75, 0, 130, 0.15), rgba(40, 40, 80, 0.2));
  border: 1px solid rgba(130, 80, 220, 0.2);
  border-radius: 14px;
  padding: 18px 20px;
`;

const SummaryTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SummaryContent = styled.div`
  color: #c8c8c8;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;

  a {
    color: #a78bfa;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #c4b5fd;
      text-decoration: underline;
    }
  }

  strong {
    color: #e0d4fc;
    font-weight: 600;
  }
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

const HighlightSectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #e0d4fc;
  margin-bottom: 12px;
`;

const HighlightItem = styled.div`
  margin-bottom: 16px;
  
  p {
    margin: 0 0 6px;
  }

  a {
    font-size: 13px;
    display: inline-block;
    margin-top: 2px;
  }
`;

/**
 * Parse the AI summary text (Legacy support for string format):
 * 1. Convert [text](url) markdown links into <a> tags
 * 2. Convert bare URLs (https://...) into <a> tags with shortened labels
 * 3. Convert *text* into <strong> tags
 * 4. Convert \n into <br>
 */
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

  // Legacy support for string format
  if (typeof summary === 'string') {
    return (
      <SummaryWrapper>
        <SummaryBox>
          <SummaryTitle>✨ AI 今日穿搭趨勢速報</SummaryTitle>
          <SummaryContent>{parseAiSummary(summary)}</SummaryContent>
        </SummaryBox>
      </SummaryWrapper>
    );
  }

  // Structured format (AiSummaryData)
  const data = summary as AiSummaryData;
  
  return (
    <SummaryWrapper>
      <SummaryBox>
        <SummaryTitle>✨ {data.title || "AI 今日穿搭趨勢速報"}</SummaryTitle>
        <SummaryContent>
          {data.intro && <p style={{ margin: '0 0 12px' }}>{data.intro}</p>}
          
          {data.highlights && Array.isArray(data.highlights) && data.highlights.length > 0 && (
            <>
              <Divider />
              <HighlightSectionTitle>精華貼文精選</HighlightSectionTitle>
              {data.highlights.map((item: AiHighlight, index: number) => (
                <HighlightItem key={index}>
                  <p>
                    <strong>{item.title}：</strong> {item.description}
                  </p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    點我觀看原文
                  </a>
                </HighlightItem>
              ))}
            </>
          )}
        </SummaryContent>
      </SummaryBox>
    </SummaryWrapper>
  );
};

export default AiSummary;
