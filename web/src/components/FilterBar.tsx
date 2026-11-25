import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSelectedKeyword, setSelectedDate } from '../features/posts/postsSlice';

const FilterNav = styled.nav`
  background: var(--bg-canvas);
  border-bottom: 1px solid var(--border-subtle);
`;

const FilterInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 720px) {
    padding: 0 16px;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 0;
  }
`;

const TabRow = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 14px 2px;
  border: none;
  background: transparent;
  color: ${(props) => (props.$active ? 'var(--text-primary)' : 'var(--text-muted)')};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  white-space: nowrap;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: ${(props) => (props.$active ? 'var(--accent)' : 'transparent')};
  }

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;

const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 720px) {
    padding: 12px 0 4px;
    justify-content: space-between;
  }
`;

const DateLabel = styled.label`
  color: var(--text-muted);
  font-size: 13px;
`;

const DateSelect = styled.select`
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: var(--border-strong);
    outline: none;
  }
`;

const FilterBar = () => {
  const dispatch = useAppDispatch();
  const { selectedKeyword, selectedDate, availableDates, data } = useAppSelector(
    (state) => state.posts
  );

  const currentData = data[selectedDate];
  const keywords = currentData ? ['全部', ...currentData.keyword_tags] : ['全部'];

  return (
    <FilterNav aria-label="分類與日期篩選">
      <FilterInner>
        <TabRow role="tablist" aria-label="穿搭主題">
          {keywords.map((kw) => (
            <TabButton
              key={kw}
              type="button"
              role="tab"
              aria-selected={selectedKeyword === kw}
              $active={selectedKeyword === kw}
              onClick={() => dispatch(setSelectedKeyword(kw))}
            >
              {kw}
            </TabButton>
          ))}
        </TabRow>

        <DateControls>
          <DateLabel htmlFor="digest-date-select">日期</DateLabel>
          <DateSelect
            id="digest-date-select"
            value={selectedDate}
            onChange={(e) => dispatch(setSelectedDate(e.target.value))}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </DateSelect>
        </DateControls>
      </FilterInner>
    </FilterNav>
  );
};

export default FilterBar;
