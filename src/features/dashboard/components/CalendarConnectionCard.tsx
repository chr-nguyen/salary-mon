import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { CalendarConnection, SyncedCalendarEvent } from '../../time/types';

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

const Chip = styled.div`
  padding: 4px 6px;
  border: 1px solid #dfe7ff;
  background: linear-gradient(180deg, #2b4696 0%, #17265d 100%);
  color: #f8fbff;
  font-size: 10px;
  text-transform: uppercase;
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

const StatList = styled.div`
  display: grid;
  gap: 8px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const StatLabel = styled.div`
  color: #d8def7;
  font-size: 11px;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  color: #f8fbff;
  font-size: 11px;
  text-transform: uppercase;
  text-align: right;
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d8e0fb;
  font-size: 11px;
  text-transform: uppercase;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
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

const SecondaryButton = styled(Button)`
  border: 1px solid #dfe7ff;
  background: linear-gradient(180deg, #536ecb 0%, #293f94 100%);
  color: #f5f8ff;
`;

const Message = styled.div`
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

const EventList = styled.div`
  display: grid;
  gap: 8px;
`;

const EventRow = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
`;

const EventTitle = styled.div`
  color: #f8fbff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const EventMeta = styled.div`
  margin-top: 4px;
  color: #d8def7;
  font-size: 11px;
  line-height: 1.45;
`;

function formatDate(value: string | null) {
  if (!value) {
    return 'Not yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatMeetingWindow(event: SyncedCalendarEvent) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  if (event.isAllDay) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(start);
  }

  const startLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(end);

  return `${startLabel} - ${endLabel}`;
}

function statusCopy(status: CalendarConnection['status']) {
  switch (status) {
    case 'ready_for_backend':
      return 'OAuth staged';
    case 'connected':
      return 'Connected';
    case 'sync_error':
      return 'Sync error';
    default:
      return 'Not connected';
  }
}

function featureCopy(clientIdConfigured: boolean) {
  return clientIdConfigured ? 'Not connected' : 'Optional feature off';
}

function readCallbackMessage() {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const state = url.searchParams.get('calendar');

  if (!state) {
    return null;
  }

  const message =
    state === 'connected'
      ? 'Google Calendar connected and initial sync completed.'
      : url.searchParams.get('calendar_message') || 'Google Calendar could not be connected.';

  url.searchParams.delete('calendar');
  url.searchParams.delete('calendar_message');
  window.history.replaceState({}, '', url.toString());

  return message;
}

export function CalendarConnectionCard({
  connection,
  loading,
  saving,
  events,
  eventsLoading,
  clientIdConfigured,
  actionError,
  actionPending,
  onConnect,
  onDisconnect,
  onSync,
}: {
  connection: CalendarConnection;
  loading: boolean;
  saving: boolean;
  events: SyncedCalendarEvent[];
  eventsLoading: boolean;
  clientIdConfigured: boolean;
  actionError: string | null;
  actionPending: 'connect' | 'sync' | 'disconnect' | null;
  onConnect: (settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync: (settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) => Promise<void>;
}) {
  const [showMeetingsInPlanner, setShowMeetingsInPlanner] = useState(
    connection.showMeetingsInPlanner,
  );
  const [includeTentativeEvents, setIncludeTentativeEvents] = useState(
    connection.includeTentativeEvents,
  );
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setShowMeetingsInPlanner(connection.showMeetingsInPlanner);
    setIncludeTentativeEvents(connection.includeTentativeEvents);
  }, [connection]);

  useEffect(() => {
    setCallbackMessage(readCallbackMessage());
  }, []);

  const readinessNote = useMemo(() => {
    if (!clientIdConfigured) {
      return 'Google Calendar sync is optional. Leave the Calendar keys unset and the rest of Salary-mon will keep working normally.';
    }

    if (connection.status === 'connected') {
      return 'Calendar tokens are stored on the server and meetings now sync into Firestore for the planner to read.';
    }

    if (connection.status === 'sync_error') {
      return connection.syncError || 'The last calendar sync failed. Reconnect or run sync again after fixing credentials.';
    }

    if (connection.status === 'ready_for_backend') {
      return 'Planner sync options are saved. Start the OAuth flow to grant Google Calendar access.';
    }

    return 'Connect your Google Calendar to pull meetings into Salary-mon without exposing refresh tokens to the browser.';
  }, [clientIdConfigured, connection]);

  const busy = saving || actionPending !== null;
  const hasConnectedCalendar = connection.status === 'connected' || connection.status === 'sync_error';

  return (
    <Card>
      <Header>
        <div>
          <Title>Google Calendar</Title>
          <Note>Optional planner add-on. Connect read-only Google Calendar access if you want meetings in the planner.</Note>
        </div>
        <Chip>{clientIdConfigured ? statusCopy(connection.status) : featureCopy(clientIdConfigured)}</Chip>
      </Header>

      <Section>
        {loading ? (
          <Message>Loading calendar connection...</Message>
        ) : (
          <>
            <SectionLabel>Connection Status</SectionLabel>
            <StatList>
              <StatRow>
                <StatLabel>Mode</StatLabel>
                <StatValue>Read-only sync</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Requested Scope</StatLabel>
                <StatValue>calendar.readonly</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Frontend Client ID</StatLabel>
                <StatValue>{clientIdConfigured ? 'Configured' : 'Optional / Missing'}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Connected At</StatLabel>
                <StatValue>{formatDate(connection.connectedAt)}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Last Sync</StatLabel>
                <StatValue>{formatDate(connection.lastSyncAt)}</StatValue>
              </StatRow>
            </StatList>

            <SectionLabel>Planner Sync Options</SectionLabel>
            <StatList>
              <ToggleRow>
                <Checkbox
                  checked={showMeetingsInPlanner}
                  onChange={(event) => setShowMeetingsInPlanner(event.target.checked)}
                  type="checkbox"
                />
                Show meetings in planner
              </ToggleRow>

              <ToggleRow>
                <Checkbox
                  checked={includeTentativeEvents}
                  onChange={(event) => setIncludeTentativeEvents(event.target.checked)}
                  type="checkbox"
                />
                Include tentative events
              </ToggleRow>
            </StatList>

            <ButtonRow>
              <Button
                disabled={busy || !clientIdConfigured}
                onClick={() =>
                  void onConnect({
                    showMeetingsInPlanner,
                    includeTentativeEvents,
                  })
                }
                type="button"
              >
                {actionPending === 'connect'
                  ? 'Opening OAuth'
                  : hasConnectedCalendar
                    ? 'Reconnect Calendar'
                    : 'Connect Calendar'}
              </Button>

              <SecondaryButton
                disabled={busy || !hasConnectedCalendar}
                onClick={() =>
                  void onSync({
                    showMeetingsInPlanner,
                    includeTentativeEvents,
                  })
                }
                type="button"
              >
                {actionPending === 'sync' ? 'Syncing' : 'Sync Now'}
              </SecondaryButton>

              {connection.status !== 'not_connected' ? (
                <SecondaryButton
                  disabled={busy}
                  onClick={() => void onDisconnect()}
                  type="button"
                >
                  {actionPending === 'disconnect' ? 'Disconnecting' : 'Disconnect'}
                </SecondaryButton>
              ) : null}
            </ButtonRow>
          </>
        )}
      </Section>

      <Section>
        <SectionLabel>Upcoming Meetings</SectionLabel>
        {eventsLoading ? (
          <Message>Loading synced meetings...</Message>
        ) : events.length > 0 ? (
          <EventList>
            {events.map((event) => (
              <EventRow key={event.id}>
                <EventTitle>{event.title}</EventTitle>
                <EventMeta>{formatMeetingWindow(event)}</EventMeta>
                {event.location ? <EventMeta>{event.location}</EventMeta> : null}
              </EventRow>
            ))}
          </EventList>
        ) : (
          <Message>
            {hasConnectedCalendar
              ? 'No upcoming meetings are cached yet. Run sync now after connecting.'
              : clientIdConfigured
                ? 'Connect Google Calendar to start filling this schedule buffer.'
                : 'Calendar sync is off in this environment. The planner still works without meeting data.'}
          </Message>
        )}
      </Section>

      {callbackMessage ? <Message>{callbackMessage}</Message> : null}
      {actionError ? <Message>{actionError}</Message> : null}
      <Message>{readinessNote}</Message>
    </Card>
  );
}
