import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSelectedKeyword, setSelectedDate } from '../features/posts/postsSlice';

const FilterWrapper = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid ${(props) => (props.$active ? '#f5f5f5' : 'rgba(255, 255, 255, 0.15)')};
  background: ${(props) => (props.$active ? '#f5f5f5' : 'transparent')};
  color: ${(props) => (props.$active ? '#101010' : '#999')};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: ${(props) => (props.$active ? '#101010' : '#ccc')};
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateLabel = styled.span`
  color: #666;
  font-size: 13px;
`;

const DateSelect = styled.select`
  background: rgba(255, 255, 255, 0.06);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
  }

  option {
    background: #1a1a1a;
    color: #ccc;
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
    <FilterWrapper>
      <ChipRow>
        {keywords.map((kw) => (
          <Chip
            key={kw}
            $active={selectedKeyword === kw}
            onClick={() => dispatch(setSelectedKeyword(kw))}
          >
            {kw}
          </Chip>
        ))}
      </ChipRow>
      <DateRow>
        <DateLabel>📅 日期</DateLabel>
        <DateSelect
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
  );
};

export default FilterBar;
