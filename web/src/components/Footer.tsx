import styled from 'styled-components';

const FooterWrapper = styled.footer`
  border-top: 1px solid var(--border-subtle);
  margin-top: 48px;
  padding: 28px 24px 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12.5px;
  letter-spacing: 0.04em;
`;

const FooterLink = styled.a`
  color: var(--text-secondary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--accent-indigo);
    text-decoration: underline;
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      THREADS DAILY STYLE ARCHIVE · Powered by{' '}
      <FooterLink
        href="https://github.com/EugeneBrave/threads_bot"
        target="_blank"
        rel="noopener noreferrer"
      >
        Threads Bot
      </FooterLink>{' '}
      🧵
    </FooterWrapper>
  );
};

export default Footer;
