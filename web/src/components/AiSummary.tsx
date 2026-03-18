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

const SummaryText = styled.p`
  color: #c8c8c8;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
`;

interface AiSummaryProps {
  summary: string;
}

const AiSummary = ({ summary }: AiSummaryProps) => {
  return (
    <SummaryWrapper>
      <SummaryBox>
        <SummaryTitle>✨ AI 今日穿搭趨勢速報</SummaryTitle>
        <SummaryText>{summary}</SummaryText>
      </SummaryBox>
    </SummaryWrapper>
  );
};

export default AiSummary;
