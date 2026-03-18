import styled from 'styled-components';

const FooterWrapper = styled.footer`
  text-align: center;
  padding: 32px 20px 48px;
  color: #444;
  font-size: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 16px;
`;

const FooterLink = styled.a`
  color: #555;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #888;
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      Powered by{' '}
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
