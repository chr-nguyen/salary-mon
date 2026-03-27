import React from 'react';
import styled from 'styled-components';
import type { MonthlyWorkSummary } from '../../time/useWorkHistory';

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #2f7aa6 0%, #1b4f7d 42%, #0d223f 100%);
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 18%, transparent 40%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #24759f 0%, #184f7a 42%, #113252 100%);
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

const MonthChip = styled.div`
  padding: 4px 6px;
  border: 1px solid #dfe7ff;
  background: linear-gradient(180deg, #2b4696 0%, #17265d 100%);
  color: #f8fbff;
  font-size: 10px;
  text-transform: uppercase;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
`;

const Stat = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
`;

const StatLabel = styled.div`
  color: #d8def7;
  font-size: 10px;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  margin-top: 4px;
  color: #f8fbff;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Chart = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14px, 1fr));
  align-items: end;
  gap: 4px;
  height: 140px;
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #153f63 0%, #102e4d 42%, #0a1d31 100%);
  background-size: auto, 12px 12px, auto;

  @media (min-width: 1280px) {
    height: 180px;
  }

  @media (min-width: 2200px) {
    height: 220px;
  }
`;

const BarWrap = styled.div`
  display: grid;
  justify-items: center;
  gap: 4px;
`;

const Bar = styled.div<{ $height: number }>`
  width: 100%;
  min-height: 4px;
  height: ${(props) => props.$height}%;
  border: 1px solid #11180f;
  background: linear-gradient(180deg, #aef5ff 0%, #7fcfe3 40%, #2d7c9b 100%);
`;

const Day = styled.div`
  color: #f2d38b;
  font-size: 8px;
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

export function MonthlyOverviewCard({
  summary,
  loading,
}: {
  summary: MonthlyWorkSummary | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <Header>
          <div>
            <Title>Monthly View</Title>
            <Note>Loading this month&apos;s work pattern...</Note>
          </div>
        </Header>
        <Empty>Loading month data...</Empty>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <Header>
          <div>
            <Title>Monthly View</Title>
            <Note>Track your hours across the month to spot pace and consistency.</Note>
          </div>
        </Header>
        <Empty>No sessions in the current month yet.</Empty>
      </Card>
    );
  }

  const maxMinutes = Math.max(...summary.daily.map((day) => day.totalMinutes), 1);

  return (
    <Card>
      <Header>
        <div>
          <Title>Monthly View</Title>
          <Note>A quick visual of how much you&apos;ve worked throughout {summary.monthLabel}.</Note>
        </div>
        <MonthChip>{summary.monthLabel}</MonthChip>
      </Header>

      <Stats>
        <Stat>
          <StatLabel>Total Hours</StatLabel>
          <StatValue>{summary.totalHours}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Workdays</StatLabel>
          <StatValue>{summary.workdays}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Avg / Day</StatLabel>
          <StatValue>{summary.averageMinutesPerWorkday}m</StatValue>
        </Stat>
      </Stats>

      <Chart>
        {summary.daily.map((day) => (
          <BarWrap key={day.key} title={`${day.label}: ${day.totalMinutes} minutes`}>
            <Bar $height={(day.totalMinutes / maxMinutes) * 100} />
            <Day>{day.key.slice(-2)}</Day>
          </BarWrap>
        ))}
      </Chart>
    </Card>
  );
}
