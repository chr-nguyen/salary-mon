import React from 'react';
import styled from 'styled-components';
import type { DailyWorkSummary } from '../../time/useWorkHistory';

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #6b59ba 0%, #3c2f82 42%, #17153c 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.26),
    inset -1px -1px 0 rgba(0, 0, 0, 0.52),
    0 0 0 2px #1b2e6a;

  @media (min-width: 1280px) {
    padding: 14px;
  }

  @media (min-width: 2200px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 18%, transparent 40%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #5b4ca7 0%, #392f7c 42%, #211c4e 100%);
  background-size: auto, 12px 12px, auto;
`;

const Title = styled.h2`
  margin: 0;
  color: #f2d38b;
  font-size: 14px;
  text-transform: uppercase;
`;

const Note = styled.p`
  margin: 6px 0 0;
  color: #d8def7;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const List = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #4a3e95 0%, #30266b 42%, #1a1845 100%);
  background-size: auto, 12px 12px, auto;

  &:nth-child(odd) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
      linear-gradient(180deg, #594aa5 0%, #372d78 42%, #211c4e 100%);
    background-size: auto, 12px 12px, auto;
  }
`;

const DayLabel = styled.div`
  color: #f8fbff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const DayMeta = styled.div`
  margin-top: 4px;
  color: #d8def7;
  font-size: 11px;
`;

const DayValue = styled.div`
  color: #f2d38b;
  text-align: right;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  text-transform: uppercase;
`;

const Empty = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
  color: #d8def7;
  font-size: 12px;
  line-height: 1.45;
`;

export function JournalCard({
  history,
  loading,
}: {
  history: DailyWorkSummary[];
  loading: boolean;
}) {
  return (
    <Card>
      <Header>
        <div>
          <Title>Memory Log</Title>
          <Note>Recent training days, session counts, and XP rewards.</Note>
        </div>
      </Header>

      {loading ? (
        <Empty>Loading recent records...</Empty>
      ) : history.length === 0 ? (
        <Empty>Start a work session and your first record will appear here.</Empty>
      ) : (
        <List>
          {history.map((day) => (
            <Row key={day.key}>
              <div>
                <DayLabel>{day.label}</DayLabel>
                <DayMeta>
                  {day.sessions} session{day.sessions === 1 ? '' : 's'}
                </DayMeta>
              </div>

              <DayValue>
                {day.totalMinutes} min
                <br />
                +{day.totalXp} XP
              </DayValue>
            </Row>
          ))}
        </List>
      )}
    </Card>
  );
}
