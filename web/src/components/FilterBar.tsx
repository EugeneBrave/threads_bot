import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSelectedKeyword, setSelectedDate } from '../features/posts/postsSlice';

const FilterBarOuter = styled.nav`
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
`;

const FilterWrapper = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    padding: 14px 16px;
  }
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid ${(props) => (props.$active ? 'var(--border-strong)' : 'var(--border-subtle)')};
  background: ${(props) => (props.$active ? 'var(--text-primary)' : 'var(--bg-surface)')};
  color: ${(props) => (props.$active ? 'var(--bg-surface)' : 'var(--text-secondary)')};
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-strong);
    color: ${(props) => (props.$active ? 'var(--bg-surface)' : 'var(--text-primary)')};
  }

  &:focus-visible {
    outline: 2px solid var(--accent-indigo);
    outline-offset: 2px;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DateLabel = styled.label`
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const DateSelect = styled.select`
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color 0.2s ease;

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
    <FilterBarOuter aria-label="內容篩選">
      <FilterWrapper>
        <ChipRow role="tablist" aria-label="穿搭分類">
          {keywords.map((kw) => (
            <Chip
              key={kw}
              type="button"
              role="tab"
              aria-selected={selectedKeyword === kw}
              $active={selectedKeyword === kw}
              onClick={() => dispatch(setSelectedKeyword(kw))}
            >
              {kw}
            </Chip>
          ))}
        </ChipRow>

        <DateRow>
          <DateLabel htmlFor="issue-date-select">ISSUE DATE</DateLabel>
          <DateSelect
            id="issue-date-select"
            value={selectedDate}
            onChange={(e) => dispatch(setSelectedDate(e.target.value))}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </DateSelect>
        </DateRow>
      </FilterWrapper>
    </FilterBarOuter>
  );
};

export default FilterBar;
