import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { WorkEntryRecord } from '../../time/useWorkHistory';
import type { TrackingClient } from '../../time/types';

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #4462c0 0%, #253d94 42%, #111944 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.26),
    inset -1px -1px 0 rgba(0, 0, 0, 0.52),
    0 0 0 2px #1b2e6a;
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
    linear-gradient(180deg, #3453ae 0%, #223785 42%, #152357 100%);
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
`;

const RangeChip = styled.div`
  padding: 4px 6px;
  border: 1px solid #dfe7ff;
  background: linear-gradient(180deg, #2b4696 0%, #17265d 100%);
  color: #f8fbff;
  font-size: 10px;
  text-transform: uppercase;
`;

const List = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const Row = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
`;

const RowTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const ClientName = styled.div`
  color: #f8fbff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const ClientMeta = styled.div`
  margin-top: 4px;
  color: #d8def7;
  font-size: 11px;
  line-height: 1.45;
`;

const Stat = styled.div`
  color: #f2d38b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 12px;
  margin-top: 8px;
  border: 1px solid rgba(223, 231, 255, 0.5);
  background: rgba(5, 12, 36, 0.45);
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  width: ${(props) => props.$percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #d9ff8c 0%, #8ae66c 40%, #2f9b43 100%);
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

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

function formatWeekRange(start: Date, end: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(start) + ` - ` + new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(end);
}

export function GoalsCard({
  clients,
  entries,
  loading,
}: {
  clients: TrackingClient[];
  entries: WorkEntryRecord[];
  loading: boolean;
}) {
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);

  const summaries = useMemo(() => {
    const weeklyEntries = entries.filter(
      (entry) => entry.startDate >= weekStart && entry.startDate <= weekEnd,
    );

    const mappedClients = clients.map((client) => {
      const clientEntries = weeklyEntries.filter((entry) => entry.clientId === client.id);
      const workedMinutes = clientEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
      const workedHours = Number((workedMinutes / 60).toFixed(2));
      const remainingGoalHours = Math.max(0, client.weeklyGoalHours - workedHours);
      const overGoalHours = Math.max(0, workedHours - client.weeklyGoalHours);
      const overLimitHours =
        client.weeklyLimitHours === null ? 0 : Math.max(0, workedHours - client.weeklyLimitHours);
      const basis = Math.max(client.weeklyGoalHours, client.weeklyLimitHours || 0, workedHours, 1);

      return {
        id: client.id,
        name: client.name,
        label: client.label,
        workedHours,
        goalHours: client.weeklyGoalHours,
        limitHours: client.weeklyLimitHours,
        remainingGoalHours,
        overGoalHours,
        overLimitHours,
        progress: Math.min(100, (workedHours / basis) * 100),
      };
    });

    const uncategorizedMinutes = weeklyEntries
      .filter((entry) => !entry.clientId)
      .reduce((sum, entry) => sum + entry.durationMinutes, 0);

    return {
      clientSummaries: mappedClients,
      uncategorizedHours: Number((uncategorizedMinutes / 60).toFixed(2)),
    };
  }, [clients, entries, weekEnd, weekStart]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Weekly Goals</Title>
          <Note>Track obligations and spot how much time each client still needs this week.</Note>
        </div>
        <RangeChip>{formatWeekRange(weekStart, weekEnd)}</RangeChip>
      </Header>

      {loading ? (
        <Empty>Loading client goals...</Empty>
      ) : clients.length === 0 ? (
        <Empty>Create a client with a weekly goal to start measuring remaining hours.</Empty>
      ) : (
        <List>
          {summaries.clientSummaries.map((summary) => (
            <Row key={summary.id}>
              <RowTop>
                <div>
                  <ClientName>{summary.name}</ClientName>
                  <ClientMeta>
                    Worked: {summary.workedHours}h
                    <br />
                    Goal: {summary.goalHours || 0}h / Limit:{' '}
                    {summary.limitHours === null ? 'Off' : `${summary.limitHours}h`}
                    {summary.label ? (
                      <>
                        <br />
                        Default Label: {summary.label}
                      </>
                    ) : null}
                  </ClientMeta>
                </div>

                <Stat>
                  {summary.goalHours > 0
                    ? summary.remainingGoalHours > 0
                      ? `${summary.remainingGoalHours.toFixed(2)}h left`
                      : `${summary.overGoalHours.toFixed(2)}h ahead`
                    : `${summary.workedHours.toFixed(2)}h tracked`}
                </Stat>
              </RowTop>

              <ProgressTrack>
                <ProgressFill $percentage={summary.progress} />
              </ProgressTrack>

              {summary.limitHours !== null && summary.overLimitHours > 0 ? (
                <ClientMeta>Limit alert: {summary.overLimitHours.toFixed(2)}h over cap.</ClientMeta>
              ) : null}
            </Row>
          ))}

          {summaries.uncategorizedHours > 0 ? (
            <Empty>Uncategorized this week: {summaries.uncategorizedHours}h</Empty>
          ) : null}
        </List>
      )}
    </Card>
  );
}
