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

const FeedContainer = styled.main`
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
`;

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 15px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: #a78bfa;
  border-radius: 50%;
  margin: 0 auto 16px;
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
  color: #f87171;
  font-size: 14px;
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #555;
  font-size: 14px;
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

        <FeedContainer>
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
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, i) => (
                  <PostCard key={post.permalink} post={post} index={i} />
                ))
              ) : (
                <EmptyMsg>此分類目前沒有貼文</EmptyMsg>
              )}
            </>
          )}

          {!loading && !error && !currentData && (
            <EmptyMsg>尚無任何資料，請等待每日自動執行後再來查看 🧵</EmptyMsg>
          )}
        </FeedContainer>

        <Footer />
      </AppWrapper>
    </>
  );
};

export default App;
