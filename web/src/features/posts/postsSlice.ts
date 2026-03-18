import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { PostsData } from '../../types';

interface PostsState {
  data: PostsData;
  availableDates: string[];
  selectedDate: string;
  selectedKeyword: string;
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  data: {},
  availableDates: [],
  selectedDate: '',
  selectedKeyword: '全部',
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/posts.json`);
  if (!response.ok) throw new Error('Failed to fetch posts data');
  const data: PostsData = await response.json();
  return data;
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setSelectedKeyword(state, action: PayloadAction<string>) {
      state.selectedKeyword = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.availableDates = Object.keys(action.payload).sort().reverse();
        state.selectedDate = state.availableDates[0] || '';
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unknown error';
      });
  },
});

export const { setSelectedDate, setSelectedKeyword } = postsSlice.actions;
export default postsSlice.reducer;
