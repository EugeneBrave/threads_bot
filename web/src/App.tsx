import { useEffect } from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AiSummary from './components/AiSummary';
import PostCard from './components/PostCard';
import Footer from './components/Footer';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchPosts } from './features/posts/postsSlice';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContainer = styled.main`
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  flex: 1;

  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-strong);
`;

const SectionTitle = styled.h2`
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
`;

const PostCount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 30px;
  height: 30px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent-indigo);
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--accent-terracotta);
  font-size: 14px;
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
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
            <LoadingWrapper>
              <Spinner />
              載入中...
            </LoadingWrapper>
          )}

          {error && <ErrorMsg>⚠️ 載入失敗：{error}</ErrorMsg>}

          {!loading && !error && currentData && (
            <>
              <AiSummary summary={currentData.ai_summary} />

              <SectionHeader>
                <SectionTitle>
                  {selectedKeyword === '全部' ? '精選穿搭貼文' : `分類：${selectedKeyword}`}
                </SectionTitle>
                <PostCount>{filteredPosts.length} POSTS</PostCount>
              </SectionHeader>

              {filteredPosts.length > 0 ? (
                <PostsGrid>
                  {filteredPosts.map((post, i) => (
                    <PostCard key={post.permalink} post={post} index={i} />
                  ))}
                </PostsGrid>
              ) : (
                <EmptyMsg>此分類目前沒有貼文</EmptyMsg>
              )}
            </>
          )}

          {!loading && !error && !currentData && (
            <EmptyMsg style={{ marginTop: 32 }}>
              尚無任何資料，請等待每日自動執行後再來查看 🧵
            </EmptyMsg>
          )}
        </MainContainer>

        <Footer />
      </AppWrapper>
    </>
  );
};

export default App;
