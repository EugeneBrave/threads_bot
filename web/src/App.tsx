import { useEffect } from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AiSummary from './components/AiSummary';
import PostCard from './components/PostCard';
import Footer from './components/Footer';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchPosts, setSelectedKeyword } from './features/posts/postsSlice';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContainer = styled.main`
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 28px 0;
  flex: 1;

  @media (max-width: 640px) {
    padding: 20px 16px 0;
  }
`;

const WorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: start;

  @media (min-width: 960px) {
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 32px;
  }
`;

const FeedColumn = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const FeedTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.015em;
`;

const FeedCount = styled.span`
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatusBox = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-wash);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: var(--border-strong);
  }
`;

const Spinner = styled.div`
  width: 26px;
  height: 26px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const App = () => {
  const dispatch = useAppDispatch();
  const { data, selectedDate, selectedKeyword, loading, error } = useAppSelector(
    (state) => state.posts
  );

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const currentData = data[selectedDate];
  const filteredPosts = currentData
    ? selectedKeyword === '全部'
      ? currentData.posts
      : currentData.posts.filter((p) => p.keyword === selectedKeyword)
    : [];

  return (
    <>
      <GlobalStyles />
      <AppWrapper>
        <Header />
        <FilterBar />

        <MainContainer>
          {loading && (
            <StatusBox>
              <Spinner />
              <span>正在讀取今日穿搭資料…</span>
            </StatusBox>
          )}

          {error && (
            <StatusBox role="alert">
              <span>無法載入貼文資料：{error}</span>
            </StatusBox>
          )}

          {!loading && !error && currentData && (
            <WorkspaceGrid>
              <AiSummary summary={currentData.ai_summary} />

              <FeedColumn aria-label="精選貼文清單">
                <FeedHeader>
                  <FeedTitle>
                    {selectedKeyword === '全部' ? '精選貼文' : selectedKeyword}
                  </FeedTitle>
                  <FeedCount>共 {filteredPosts.length} 則</FeedCount>
                </FeedHeader>

                {filteredPosts.length > 0 ? (
                  <PostsGrid>
                    {filteredPosts.map((post, i) => (
                      <PostCard key={post.permalink} post={post} index={i} />
                    ))}
                  </PostsGrid>
                ) : (
                  <StatusBox>
                    <span>目前沒有「{selectedKeyword}」分類的貼文。</span>
                    {selectedKeyword !== '全部' && (
                      <ResetButton
                        type="button"
                        onClick={() => dispatch(setSelectedKeyword('全部'))}
                      >
                        檢視全部貼文
                      </ResetButton>
                    )}
                  </StatusBox>
                )}
              </FeedColumn>
            </WorkspaceGrid>
          )}

          {!loading && !error && !currentData && (
            <StatusBox>
              <span>目前尚無任何日期資料，待每日排程執行後即可瀏覽。</span>
            </StatusBox>
          )}
        </MainContainer>

        <Footer />
      </AppWrapper>
    </>
  );
};

export default App;
