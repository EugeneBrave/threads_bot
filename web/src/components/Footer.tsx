import styled from 'styled-components';

const FooterWrapper = styled.footer`
  border-top: 1px solid var(--border-subtle);
  margin-top: 56px;
  padding: 24px 28px 36px;
  color: var(--text-muted);
  font-size: 13px;
`;

const FooterInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const FooterLink = styled.a`
  color: var(--text-secondary);
  font-weight: 600;

  &:hover {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterInner>
        <span>Threads 每日穿搭精選</span>
        <span>
          由{' '}
          <FooterLink
            href="https://github.com/EugeneBrave/threads_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            Threads Bot
          </FooterLink>{' '}
          每日自動更新
        </span>
      </FooterInner>
    </FooterWrapper>
  );
};

export default Footer;
