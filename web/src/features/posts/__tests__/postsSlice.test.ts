import { describe, it, expect } from 'vitest';
import reducer, { setSelectedDate, setSelectedKeyword } from '../postsSlice';

describe('postsSlice reducer', () => {
  const initialState = {
    data: {},
    availableDates: [],
    selectedDate: '',
    selectedKeyword: '全部',
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSelectedDate', () => {
    const actual = reducer(initialState, setSelectedDate('2025-03-18'));
    expect(actual.selectedDate).toBe('2025-03-18');
  });

  it('should handle setSelectedKeyword', () => {
    const actual = reducer(initialState, setSelectedKeyword('阿美咔嘰'));
    expect(actual.selectedKeyword).toBe('阿美咔嘰');
  });

  it('should handle fetchPosts.fulfilled', () => {
    const mockPayload = {
      '2025-03-18': {
        keyword_tags: ['test'],
        ai_summary: 'summary',
        posts: []
      },
      '2025-03-17': {
        keyword_tags: ['test'],
        ai_summary: 'summary',
        posts: []
      }
    };
    
    // Simulate the fulfilled action from createAsyncThunk
    const action = { type: 'posts/fetchPosts/fulfilled', payload: mockPayload };
    const state = reducer(initialState, action);
    
    expect(state.data).toEqual(mockPayload);
    expect(state.loading).toBe(false);
    expect(state.availableDates).toEqual(['2025-03-18', '2025-03-17']);
    expect(state.selectedDate).toBe('2025-03-18');
  });

  it('should handle fetchPosts.pending', () => {
    const action = { type: 'posts/fetchPosts/pending' };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPosts.rejected', () => {
    const action = { type: 'posts/fetchPosts/rejected', error: { message: 'Network Error' } };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network Error');
  });
});
