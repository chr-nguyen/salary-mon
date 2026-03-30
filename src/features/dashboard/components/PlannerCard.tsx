import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { WorkEntryRecord } from '../../time/useWorkHistory';
import type {
  SchedulePreferences,
  SyncedCalendarEvent,
  TrackingClient,
  WorkdayKey,
} from '../../time/types';

const DAY_ORDER: WorkdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_LABELS: Record<WorkdayKey, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const DAY_TO_INDEX: Record<WorkdayKey, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #2f7aa6 0%, #1b4f7d 42%, #0d223f 100%);
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
`;

const Section = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #29457d 0%, #1b2c5f 42%, #101a3f 100%);
  background-size: auto, 12px 12px, auto;
`;

const SectionLabel = styled.div`
  margin-bottom: 8px;
  color: #f2d38b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  gap: 4px;
  color: #d8e0fb;
  font-size: 11px;
  text-transform: uppercase;
`;

const Input = styled.input`
  border: 2px solid #dfe7ff;
  background: linear-gradient(180deg, #203274 0%, #111941 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.12),
    inset -1px -1px 0 rgba(0, 0, 0, 0.35);
  color: #f8fbff;
  padding: 9px 8px;
  font: inherit;
  font-size: 13px;
  outline: none;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  border: 1px solid #000;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #fff0c2 0%, #efc871 44%, #b78628 100%)'
      : 'linear-gradient(180deg, #536ecb 0%, #293f94 100%)'};
  color: ${(props) => (props.$active ? '#3a2504' : '#f5f8ff')};
  padding: 10px 6px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Button = styled.button`
  border: 1px solid #f5d895;
  background: linear-gradient(180deg, #fff0c2 0%, #efc871 44%, #b78628 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.34),
    inset -1px -1px 0 rgba(73, 44, 5, 0.45);
  color: #3a2504;
  padding: 10px 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Stat = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.08) 18%, transparent 42%),
    linear-gradient(90deg, rgba(78, 63, 22, 0.08) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #f5ebcd 0%, #d9c59a 56%, #b89f73 100%);
  background-size: auto, 12px 12px, auto;
`;

const StatLabel = styled.div`
  color: #5a4621;
  font-size: 10px;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  margin-top: 4px;
  color: #30230f;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
`;

const PlanList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const PlanDay = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
`;

const PlanDate = styled.div`
  color: #f8fbff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const PlanMeta = styled.div`
  margin-top: 4px;
  color: #d8def7;
  font-size: 11px;
  line-height: 1.45;
`;

const PlanBlock = styled.div`
  margin-top: 6px;
  color: #f2d38b;
  font-size: 11px;
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

type PlanBlockRecord = {
  clientId: string;
  clientName: string;
  startHour: number;
  endHour: number;
  hours: number;
};

type PlanDayRecord = {
  date: Date;
  totalHours: number;
  blocks: PlanBlockRecord[];
};

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

function formatHour(value: number) {
  const wholeHours = Math.floor(value);
  const minutes = Math.round((value - wholeHours) * 60);
  const normalizedMinutes = minutes === 60 ? 0 : minutes;
  const normalizedHours = minutes === 60 ? wholeHours + 1 : wholeHours;
  const suffix = normalizedHours >= 12 ? 'PM' : 'AM';
  const clock = normalizedHours % 12 === 0 ? 12 : normalizedHours % 12;
  return `${clock}:${`${normalizedMinutes}`.padStart(2, '0')} ${suffix}`;
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getUpcomingPlanDays(
  today: Date,
  activeDays: WorkdayKey[],
  targetDaysPerWeek: number,
) {
  const days: Date[] = [];
  const ordered = DAY_ORDER.filter((day) => activeDays.includes(day));
  const limit = Math.min(Math.max(targetDaysPerWeek, 1), ordered.length || targetDaysPerWeek, 7);
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 14 && days.length < limit; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + offset);

    const matches = ordered.some((day) => DAY_TO_INDEX[day] === date.getDay());

    if (matches) {
      days.push(date);
    }
  }

  return days;
}

export function PlannerCard({
  clients,
  entries,
  meetings,
  meetingsLoading,
  showMeetings,
  loading,
  preferences,
  preferencesLoading,
  preferencesSaving,
  onSavePreferences,
}: {
  clients: TrackingClient[];
  entries: WorkEntryRecord[];
  meetings: SyncedCalendarEvent[];
  meetingsLoading: boolean;
  showMeetings: boolean;
  loading: boolean;
  preferences: SchedulePreferences;
  preferencesLoading: boolean;
  preferencesSaving: boolean;
  onSavePreferences: (preferences: SchedulePreferences) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<SchedulePreferences>(preferences);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(weekStart);

  const plan = useMemo(() => {
    const currentWeekEntries = entries.filter(
      (entry) => entry.startDate >= weekStart && entry.startDate <= weekEnd,
    );

    const obligations = clients
      .map((client) => {
        const workedMinutes = currentWeekEntries
          .filter((entry) => entry.clientId === client.id)
          .reduce((sum, entry) => sum + entry.durationMinutes, 0);
        const workedHours = workedMinutes / 60;
        const remainingHours = Math.max(0, client.weeklyGoalHours - workedHours);

        return {
          id: client.id,
          name: client.name,
          remainingHours,
        };
      })
      .filter((client) => client.remainingHours > 0)
      .sort((left, right) => right.remainingHours - left.remainingHours);

    const planDays = getUpcomingPlanDays(today, draft.activeDays, draft.targetDaysPerWeek).map(
      (date) => ({
        date,
        totalHours: 0,
        blocks: [] as PlanBlockRecord[],
      }),
    );

    let overflowHours = 0;

    obligations.forEach((client) => {
      let remaining = client.remainingHours;

      for (let index = 0; index < planDays.length && remaining > 0; index += 1) {
        const day = planDays[index];
        const available = Math.max(0, draft.dailyMaxHours - day.totalHours);

        if (available <= 0) {
          continue;
        }

        const assigned = Math.min(remaining, available);
        const startHour = draft.preferredStartHour + day.totalHours;
        const endHour = startHour + assigned;

        day.blocks.push({
          clientId: client.id,
          clientName: client.name,
          startHour,
          endHour,
          hours: Number(assigned.toFixed(2)),
        });
        day.totalHours = Number((day.totalHours + assigned).toFixed(2));
        remaining = Number((remaining - assigned).toFixed(2));
      }

      if (remaining > 0) {
        overflowHours += remaining;
      }
    });

    const totalScheduledHours = planDays.reduce((sum, day) => sum + day.totalHours, 0);
    const totalRemainingHours = obligations.reduce((sum, client) => sum + client.remainingHours, 0);

    return {
      obligations,
      planDays: planDays.filter((day) => day.blocks.length > 0),
      totalScheduledHours: Number(totalScheduledHours.toFixed(2)),
      totalRemainingHours: Number(totalRemainingHours.toFixed(2)),
      overflowHours: Number(overflowHours.toFixed(2)),
      totalCapacityHours: Number((draft.targetDaysPerWeek * draft.dailyMaxHours).toFixed(2)),
    };
  }, [clients, draft.activeDays, draft.dailyMaxHours, draft.preferredStartHour, draft.targetDaysPerWeek, entries, today, weekEnd, weekStart]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Planner</Title>
          <Note>Set your preferred work pattern, then spread the remaining client goals into a week plan.</Note>
        </div>
      </Header>

      <Section>
        <SectionLabel>Preferences</SectionLabel>
        {preferencesLoading ? (
          <Empty>Loading schedule preferences...</Empty>
        ) : (
          <>
            <FormGrid>
              <Field>
                Target Days / Week
                <Input
                  inputMode="numeric"
                  value={draft.targetDaysPerWeek}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetDaysPerWeek: Math.min(7, Math.max(1, Number(event.target.value) || 1)),
                    }))
                  }
                />
              </Field>

              <Field>
                Daily Max Hours
                <Input
                  inputMode="decimal"
                  value={draft.dailyMaxHours}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      dailyMaxHours: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                />
              </Field>

              <Field>
                Preferred Start Hour
                <Input
                  inputMode="numeric"
                  value={draft.preferredStartHour}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      preferredStartHour: Math.min(20, Math.max(5, Number(event.target.value) || 9)),
                    }))
                  }
                />
              </Field>
            </FormGrid>

            <SectionLabel>Work Days</SectionLabel>
            <DayGrid>
              {DAY_ORDER.map((day) => {
                const active = draft.activeDays.includes(day);

                return (
                  <DayButton
                    key={day}
                    $active={active}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        activeDays: active
                          ? current.activeDays.filter((entry) => entry !== day)
                          : [...current.activeDays, day].sort(
                              (left, right) => DAY_ORDER.indexOf(left) - DAY_ORDER.indexOf(right),
                            ),
                      }))
                    }
                    type="button"
                  >
                    {DAY_LABELS[day]}
                  </DayButton>
                );
              })}
            </DayGrid>

            <ButtonRow>
              <Button
                disabled={preferencesSaving || draft.activeDays.length === 0}
                onClick={() => void onSavePreferences(draft)}
                type="button"
              >
                {preferencesSaving ? 'Saving' : 'Save Planner'}
              </Button>
            </ButtonRow>
          </>
        )}
      </Section>

      <Section>
        <SectionLabel>Suggested Plan</SectionLabel>
        {loading ? (
          <Empty>Loading tracked hours...</Empty>
        ) : clients.length === 0 ? (
          <Empty>Create client goals first so the planner has obligations to schedule.</Empty>
        ) : (
          <>
            <Summary>
              <Stat>
                <StatLabel>Week Range</StatLabel>
                <StatValue>{formatWeekRange(weekStart, weekEnd)}</StatValue>
              </Stat>
              <Stat>
                <StatLabel>Hours Left</StatLabel>
                <StatValue>{plan.totalRemainingHours}</StatValue>
              </Stat>
              <Stat>
                <StatLabel>Capacity</StatLabel>
                <StatValue>{plan.totalCapacityHours}</StatValue>
              </Stat>
            </Summary>

            {plan.obligations.length === 0 ? (
              <Empty>All current client goals are already covered for this week.</Empty>
            ) : (
              <>
                <PlanList>
                  {plan.planDays.map((day) => (
                    <PlanDay key={day.date.toISOString()}>
                      <PlanDate>{formatDay(day.date)}</PlanDate>
                      <PlanMeta>{day.totalHours.toFixed(2)}h scheduled</PlanMeta>
                      {day.blocks.map((block) => (
                        <PlanBlock key={`${block.clientId}-${block.startHour}`}>
                          {block.clientName}: {formatHour(block.startHour)} - {formatHour(block.endHour)} ({block.hours.toFixed(2)}h)
                        </PlanBlock>
                      ))}
                    </PlanDay>
                  ))}
                </PlanList>

                {plan.overflowHours > 0 ? (
                  <Empty>
                    Capacity warning: {plan.overflowHours}h still does not fit inside the selected
                    workdays and daily cap.
                  </Empty>
                ) : null}
              </>
            )}
          </>
        )}
      </Section>

      {showMeetings ? (
        <Section>
          <SectionLabel>Meeting Overlay</SectionLabel>
          {meetingsLoading ? (
            <Empty>Loading synced meetings...</Empty>
          ) : meetings.length > 0 ? (
            <PlanList>
              {meetings.slice(0, 5).map((meeting) => (
                <PlanDay key={meeting.id}>
                  <PlanDate>{meeting.title}</PlanDate>
                  <PlanMeta>{formatDay(new Date(meeting.startAt))}</PlanMeta>
                  <PlanBlock>
                    {meeting.isAllDay
                      ? 'All day'
                      : `${formatHour(new Date(meeting.startAt).getHours() + new Date(meeting.startAt).getMinutes() / 60)} - ${formatHour(new Date(meeting.endAt).getHours() + new Date(meeting.endAt).getMinutes() / 60)}`}
                  </PlanBlock>
                </PlanDay>
              ))}
            </PlanList>
          ) : (
            <Empty>Connect Google Calendar and run sync to show meetings beside your work plan.</Empty>
          )}
        </Section>
      ) : null}
    </Card>
  );
}
