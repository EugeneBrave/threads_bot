import React from 'react';
import styled from 'styled-components';

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

interface AiSummaryProps {
  summary: string;
}

/**
 * Parse the AI summary text:
 * 1. Convert [text](url) markdown links into <a> tags
 * 2. Convert bare URLs (https://...) into <a> tags with shortened labels
 * 3. Convert *text* into <strong> tags
 * 4. Convert \n into <br>
 */
function parseAiSummary(text: string): React.ReactNode[] {
  // Step 1: Handle markdown-style links [text](url) and bare URLs and *bold*
  // Pattern priority: markdown links first, then bare URLs, then bold
  const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)|\*([^*]+)\*/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      nodes.push(...splitNewlines(before, key));
      key += before.split('\n').length;
    }

    if (match[1] && match[2]) {
      // Markdown link: [text](url)
      nodes.push(
        <a key={`link-${key++}`} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // Bare URL
      const url = match[3];
      const label = shortenUrl(url);
      nodes.push(
        <a key={`url-${key++}`} href={url} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    } else if (match[4]) {
      // Bold text: *text*
      nodes.push(<strong key={`bold-${key++}`}>{match[4]}</strong>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
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
    // Show @username for threads.com
    const user = path.find((p) => p.startsWith('@'));
    if (user) return `🔗 ${user}`;
    return '🔗 查看連結';
  } catch {
    return '🔗 查看連結';
  }
}

const AiSummary = ({ summary }: AiSummaryProps) => {
  return (
    <SummaryWrapper>
      <SummaryBox>
        <SummaryTitle>✨ AI 今日穿搭趨勢速報</SummaryTitle>
        <SummaryContent>{parseAiSummary(summary)}</SummaryContent>
      </SummaryBox>
    </SummaryWrapper>
  );
};

export default AiSummary;
