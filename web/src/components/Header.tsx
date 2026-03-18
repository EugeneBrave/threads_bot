import styled from 'styled-components';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(16, 16, 16, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 0;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ThreadsIcon = styled.span`
  font-size: 28px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0;
  letter-spacing: -0.3px;
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Logo>
        <ThreadsIcon>🧵</ThreadsIcon>
        <Title>Threads 每日穿搭精選</Title>
      </Logo>
    </HeaderWrapper>
  );
};

export default Header;
