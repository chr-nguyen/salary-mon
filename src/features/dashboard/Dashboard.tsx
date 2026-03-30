import React, { startTransition, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { AuthScreen } from '../auth/AuthScreen';
import { useAuthSession } from '../auth/useAuthSession';
import { useSalaryMon } from '../game/useSalaryMon';
import { useBusinessProfile } from '../time/useBusinessProfile';
import { useCalendarEvents } from '../time/useCalendarEvents';
import { useCalendarConnection } from '../time/useCalendarConnection';
import { useClients } from '../time/useClients';
import { useWorkHistory } from '../time/useWorkHistory';
import { useSchedulePreferences } from '../time/useSchedulePreferences';
import { useWorkSession } from '../time/useWorkSession';
import { BusinessProfileCard } from './components/BusinessProfileCard';
import { CalendarConnectionCard } from './components/CalendarConnectionCard';
import { ClientDeskCard } from './components/ClientDeskCard';
import { GoalsCard } from './components/GoalsCard';
import { InvoiceCard } from './components/InvoiceCard';
import { JournalCard } from './components/JournalCard';
import { MonthlyOverviewCard } from './components/MonthlyOverviewCard';
import { PetCard } from './components/PetCard';
import { PlannerCard } from './components/PlannerCard';
import { ProfileCard } from './components/ProfileCard';
import { ProgressCard } from './components/ProgressCard';
import { TrackerCard } from './components/TrackerCard';

type DashboardView = 'home' | 'train' | 'log' | 'tools';

const VIEW_OPTIONS: {
  id: DashboardView;
  label: string;
  caption: string;
  title: string;
}[] = [
  { id: 'home', label: 'MON', caption: 'pet', title: 'Partner Deck' },
  { id: 'train', label: 'XP', caption: 'train', title: 'Training Menu' },
  { id: 'log', label: 'LOG', caption: 'memo', title: 'Memory Log' },
  { id: 'tools', label: 'KIT', caption: 'tools', title: 'Utility Kit' },
];

const boot = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const press = keyframes`
  from {
    transform: translateY(0);
  }

  50% {
    transform: translateY(1px);
  }

  to {
    transform: translateY(0);
  }
`;

const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    --bg-top: #e0cfab;
    --bg-mid: #b48e63;
    --bg-low: #5d462f;
    --shell-light: #d9d1b6;
    --shell-mid: #b3a37c;
    --shell-dark: #706549;
    --shell-ink: #3d3524;
    --lcd-hi: #dce7a8;
    --lcd-mid: #9cab62;
    --lcd-low: #56653f;
    --lcd-shadow: #28301e;
    --accent: #d85b30;
    --accent-hot: #b93f24;
    --danger: #8e2f1f;
    --ink: #1d1a12;
    --ink-dim: #4d4738;
    font-family: "Courier New", monospace;
  }

  * {
    box-sizing: border-box;
  }

  html {
    background: #9a7c57;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(circle at 18% 18%, rgba(255, 248, 220, 0.38) 0%, transparent 20%),
      radial-gradient(circle at 82% 12%, rgba(130, 193, 108, 0.22) 0%, transparent 18%),
      linear-gradient(180deg, var(--bg-top) 0%, var(--bg-mid) 48%, var(--bg-low) 100%);
    color: var(--ink);
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

const Screen = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px 12px 36px;
`;

const Device = styled.section`
  width: min(100%, 540px);
  padding: 14px;
  border: 2px solid rgba(61, 53, 36, 0.8);
  border-radius: 28px 28px 34px 34px;
  background:
    radial-gradient(circle at 20% 14%, rgba(255, 255, 255, 0.55) 0%, transparent 22%),
    linear-gradient(160deg, #efe8cf 0%, var(--shell-light) 18%, var(--shell-mid) 72%, #8f7f59 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.72),
    inset -2px -2px 0 rgba(55, 45, 30, 0.4),
    0 30px 55px rgba(38, 24, 9, 0.32);
  animation: ${boot} 180ms steps(8, end);

  @media (min-width: 980px) {
    width: min(96vw, 1120px);
    padding: 18px 18px 24px;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 14px;
  color: var(--shell-ink);
  text-transform: uppercase;
`;

const BrandBlock = styled.div`
  display: grid;
  gap: 4px;
`;

const BrandTitle = styled.div`
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
`;

const BrandSubline = styled.div`
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(61, 53, 36, 0.72);
`;

const Speaker = styled.div`
  display: grid;
  gap: 6px;
  justify-items: end;
  padding-top: 4px;
`;

const SpeakerRow = styled.div`
  display: flex;
  gap: 6px;
`;

const SpeakerDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(61, 53, 36, 0.55);
`;

const StatusStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;

  @media (min-width: 980px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatusCell = styled.div`
  padding: 8px 10px;
  border: 2px solid rgba(61, 53, 36, 0.65);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.08) 24%, transparent 24%),
    linear-gradient(180deg, rgba(140, 120, 87, 0.3) 0%, rgba(98, 82, 56, 0.16) 100%);
`;

const StatusLabel = styled.div`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(61, 53, 36, 0.76);
`;

const StatusValue = styled.div`
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Bezel = styled.div`
  padding: 14px;
  border: 2px solid rgba(61, 53, 36, 0.9);
  border-radius: 20px;
  background: linear-gradient(180deg, #7b725b 0%, #5f563f 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.15),
    inset -2px -2px 0 rgba(28, 25, 18, 0.35);
`;

const Lcd = styled.div`
  min-height: 640px;
  padding: 14px;
  border: 2px solid rgba(37, 45, 28, 0.95);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, transparent 10%),
    repeating-linear-gradient(0deg, rgba(63, 76, 44, 0.16) 0 2px, transparent 2px 4px),
    linear-gradient(180deg, var(--lcd-hi) 0%, #bccd85 22%, var(--lcd-mid) 68%, var(--lcd-low) 100%);
  box-shadow:
    inset 0 0 0 2px rgba(215, 230, 165, 0.2),
    inset 0 0 24px rgba(40, 48, 30, 0.24);
`;

const LcdTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(40, 48, 30, 0.55);
`;

const ScreenHeading = styled.div`
  display: grid;
  gap: 4px;
`;

const ScreenTag = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(29, 26, 18, 0.65);
`;

const ScreenTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const ScreenMessage = styled.p`
  margin: 0;
  max-width: 560px;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(29, 26, 18, 0.8);
`;

const LogoutButton = styled.button`
  align-self: start;
  border: 2px solid rgba(37, 45, 28, 0.82);
  border-radius: 999px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #f6daa8 0%, #d1a35d 100%);
  color: #33230a;
  text-transform: uppercase;
  cursor: pointer;
`;

const Viewport = styled.div`
  margin-top: 14px;
  padding: 10px;
  border: 2px solid rgba(40, 48, 30, 0.7);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 16%),
    rgba(73, 86, 51, 0.18);
`;

const ViewStack = styled.div`
  display: grid;
  gap: 10px;
`;

const HomeGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    align-items: start;
  }
`;

const UtilityGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
`;

const SplashCard = styled.div`
  min-height: 420px;
  display: grid;
  place-items: center;
  padding: 24px;
  border: 2px dashed rgba(40, 48, 30, 0.58);
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  text-transform: uppercase;
  color: rgba(29, 26, 18, 0.82);
`;

const Warning = styled.div`
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 2px solid rgba(142, 47, 31, 0.55);
  border-radius: 12px;
  background: rgba(248, 224, 182, 0.7);
  color: var(--danger);
  font-size: 12px;
  line-height: 1.45;
  text-transform: uppercase;
`;

const Controls = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 16px;

  @media (min-width: 760px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ControlButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 2px;
  justify-items: center;
  padding: 14px 10px;
  border: 2px solid rgba(61, 53, 36, 0.82);
  border-radius: 18px;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #f7eab9 0%, #dfa968 52%, #b56f32 100%)'
      : 'linear-gradient(180deg, #f2e8cb 0%, #c0ad7a 58%, #8c7951 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.66),
    inset -2px -2px 0 rgba(55, 45, 30, 0.22);
  color: ${(props) => (props.$active ? '#38200a' : 'var(--shell-ink)')};
  cursor: pointer;
  text-transform: uppercase;

  &:active {
    animation: ${press} 110ms linear;
  }
`;

const ControlLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

const ControlCaption = styled.span`
  font-size: 10px;
  letter-spacing: 0.1em;
  opacity: 0.72;
`;

const FooterHint = styled.div`
  margin-top: 8px;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(61, 53, 36, 0.72);
`;

function getActivityMessage({
  activeSession,
  activeView,
  currentMonthHours,
  hasHistory,
  isEnvMissing,
  petName,
  petStatus,
  user,
}: {
  activeSession: boolean;
  activeView: DashboardView;
  currentMonthHours: number | null;
  hasHistory: boolean;
  isEnvMissing: boolean;
  petName?: string;
  petStatus?: string;
  user: boolean;
}) {
  if (isEnvMissing) {
    return 'Cloud save is offline until the Firebase values are filled in.';
  }

  if (!user) {
    return 'Create a trainer file or sign in to wake the device.';
  }

  if (activeSession) {
    return 'Focus session live. Minutes are being converted into XP.';
  }

  if (activeView === 'train') {
    return 'Spend stored XP carefully. Each choice changes the build.';
  }

  if (activeView === 'log') {
    if (currentMonthHours) {
      return `This month has ${currentMonthHours.toFixed(2)} tracked hours in memory.`;
    }

    return hasHistory
      ? 'No finished runs in the current month yet.'
      : 'Your first finished session will appear in the log.';
  }

  if (activeView === 'tools') {
    return 'Tune your save slot, repaint the partner, or export a bill.';
  }

  if (petName && petStatus) {
    return `${petName} is ${petStatus}. Keep the loop moving to evolve it faster.`;
  }

  return 'Partner data is loading.';
}

function getStatusWord(status?: string) {
  if (status === 'working') {
    return 'Working';
  }

  if (status === 'resting') {
    return 'Resting';
  }

  return 'Ready';
}

export function Dashboard() {
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [calendarActionPending, setCalendarActionPending] = useState<
    'connect' | 'sync' | 'disconnect' | null
  >(null);
  const [calendarActionError, setCalendarActionError] = useState<string | null>(null);
  const {
    user,
    loading: authLoading,
    error: authError,
    pendingAction,
    createAccount,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    updateDisplayName,
  } = useAuthSession();

  const userId = user?.uid;
  const preferredName = user?.displayName || user?.email?.split('@')[0] || null;
  const {
    pet,
    loading: petLoading,
    upgradeAttribute,
    upgradePending,
    renamePet,
    updatePalette,
    profilePending,
  } = useSalaryMon(userId, preferredName);
  const { clients, loading: clientsLoading, savingClientId, saveClient } = useClients(userId);
  const {
    profile: businessProfile,
    loading: businessProfileLoading,
    saving: businessProfileSaving,
    saveProfile,
  } = useBusinessProfile(userId);
  const {
    connection: calendarConnection,
    loading: calendarConnectionLoading,
    saving: calendarConnectionSaving,
    prepareConnection: prepareCalendarConnection,
  } = useCalendarConnection(userId);
  const { events: calendarEvents, loading: calendarEventsLoading } = useCalendarEvents(userId);
  const {
    preferences: schedulePreferences,
    loading: schedulePreferencesLoading,
    saving: schedulePreferencesSaving,
    savePreferences: saveSchedulePreferences,
  } = useSchedulePreferences(userId);
  const { activeSession, loading: sessionLoading, checkIn, checkOut } = useWorkSession(userId);
  const { history, entries, currentMonth, loading: historyLoading } = useWorkHistory(userId);
  const isGoogleCalendarClientIdConfigured = Boolean(
    import.meta.env.PUBLIC_GOOGLE_CALENDAR_CLIENT_ID,
  );

  const isEnvMissing = !import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const isLoading = authLoading || (!!user && (petLoading || sessionLoading));
  const activeViewMeta =
    VIEW_OPTIONS.find((view) => view.id === activeView) ?? VIEW_OPTIONS[0];

  const activityMessage = useMemo(
    () =>
      getActivityMessage({
        activeSession: Boolean(activeSession),
        activeView,
        currentMonthHours: currentMonth?.totalHours ?? null,
        hasHistory: history.length > 0,
        isEnvMissing,
        petName: pet?.name,
        petStatus: getStatusWord(pet?.status),
        user: Boolean(user),
      }),
    [activeSession, activeView, currentMonth?.totalHours, history.length, isEnvMissing, pet, user],
  );

  async function getFirebaseIdToken() {
    if (!user) {
      throw new Error('Sign in before connecting Google Calendar.');
    }

    return user.getIdToken();
  }

  async function handleCalendarConnect(settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) {
    setCalendarActionPending('connect');
    setCalendarActionError(null);

    try {
      const saved = await prepareCalendarConnection(settings);

      if (!saved) {
        throw new Error('Could not save calendar sync preferences.');
      }

      const idToken = await getFirebaseIdToken();
      const response = await fetch('/api/google-calendar/connect', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        authUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.authUrl) {
        throw new Error(payload.error || 'Could not open Google Calendar OAuth.');
      }

      window.location.assign(payload.authUrl);
    } catch (error) {
      setCalendarActionError(
        error instanceof Error ? error.message : 'Could not connect Google Calendar.',
      );
      setCalendarActionPending(null);
    }
  }

  async function handleCalendarSync(settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) {
    setCalendarActionPending('sync');
    setCalendarActionError(null);

    try {
      const saved = await prepareCalendarConnection(settings);

      if (!saved) {
        throw new Error('Could not save calendar sync preferences.');
      }

      const idToken = await getFirebaseIdToken();
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Could not sync Google Calendar.');
      }
    } catch (error) {
      setCalendarActionError(error instanceof Error ? error.message : 'Could not sync calendar.');
    } finally {
      setCalendarActionPending(null);
    }
  }

  async function handleCalendarDisconnect() {
    setCalendarActionPending('disconnect');
    setCalendarActionError(null);

    try {
      const idToken = await getFirebaseIdToken();
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Could not disconnect Google Calendar.');
      }
    } catch (error) {
      setCalendarActionError(
        error instanceof Error ? error.message : 'Could not disconnect calendar.',
      );
    } finally {
      setCalendarActionPending(null);
    }
  }

  function renderView() {
    if (isLoading) {
      return <SplashCard>Booting device...</SplashCard>;
    }

    if (!user) {
      return (
        <AuthScreen
          error={authError}
          onCreateAccount={createAccount}
          onGoogle={signInWithGoogle}
          onSignIn={signInWithEmail}
          pendingAction={pendingAction}
        />
      );
    }

    if (!pet) {
      return <SplashCard>Generating partner data...</SplashCard>;
    }

    if (activeView === 'home') {
      return (
        <HomeGrid>
          <PetCard pet={pet} />
          <TrackerCard
            activeSession={activeSession}
            clients={clients}
            onCheckIn={checkIn}
            onCheckOut={() => checkOut(pet)}
          />
        </HomeGrid>
      );
    }

    if (activeView === 'train') {
      return (
        <ProgressCard
          pet={pet}
          upgradePending={upgradePending}
          onUpgrade={upgradeAttribute}
        />
      );
    }

    if (activeView === 'log') {
      return (
        <ViewStack>
          <MonthlyOverviewCard loading={historyLoading} summary={currentMonth} />
          <GoalsCard clients={clients} entries={entries} loading={historyLoading || clientsLoading} />
          <PlannerCard
            clients={clients}
            entries={entries}
            meetings={calendarEvents}
            meetingsLoading={calendarEventsLoading}
            loading={historyLoading || clientsLoading}
            onSavePreferences={saveSchedulePreferences}
            preferences={schedulePreferences}
            preferencesLoading={schedulePreferencesLoading}
            preferencesSaving={schedulePreferencesSaving}
            showMeetings={
              calendarConnection.status === 'connected' &&
              calendarConnection.showMeetingsInPlanner
            }
          />
          <JournalCard history={history} loading={historyLoading} />
        </ViewStack>
      );
    }

    return (
      <UtilityGrid>
        <ProfileCard
          onRenamePet={renamePet}
          onRenameUser={updateDisplayName}
          onUpdatePalette={updatePalette}
          pet={pet}
          profilePending={profilePending || pendingAction === 'profile'}
          userName={preferredName || 'Trainer'}
        />
        <BusinessProfileCard
          loading={businessProfileLoading}
          onSaveProfile={saveProfile}
          profile={businessProfile}
          saving={businessProfileSaving}
        />
        <CalendarConnectionCard
          actionError={calendarActionError}
          actionPending={calendarActionPending}
          clientIdConfigured={isGoogleCalendarClientIdConfigured}
          connection={calendarConnection}
          events={calendarEvents}
          eventsLoading={calendarEventsLoading}
          loading={calendarConnectionLoading}
          onConnect={handleCalendarConnect}
          onDisconnect={handleCalendarDisconnect}
          onSync={handleCalendarSync}
          saving={calendarConnectionSaving}
        />
        <ClientDeskCard
          clients={clients}
          loading={clientsLoading}
          onSaveClient={saveClient}
          savingClientId={savingClientId}
        />
        <InvoiceCard
          businessProfile={businessProfile}
          clients={clients}
          entries={entries}
          loading={historyLoading || clientsLoading}
        />
      </UtilityGrid>
    );
  }

  return (
    <>
      <GlobalStyle />

      <Screen>
        <Device>
          <TopBar>
            <BrandBlock>
              <BrandTitle>Salary-mon</BrandTitle>
              <BrandSubline>Focus Pet Computer // Workday Edition</BrandSubline>
            </BrandBlock>

            <Speaker aria-hidden="true">
              <SpeakerRow>
                <SpeakerDot />
                <SpeakerDot />
                <SpeakerDot />
              </SpeakerRow>
              <SpeakerRow>
                <SpeakerDot />
                <SpeakerDot />
                <SpeakerDot />
              </SpeakerRow>
            </Speaker>
          </TopBar>

          <StatusStrip>
            <StatusCell>
              <StatusLabel>Trainer</StatusLabel>
              <StatusValue>{preferredName || 'Guest Slot'}</StatusValue>
            </StatusCell>
            <StatusCell>
              <StatusLabel>State</StatusLabel>
              <StatusValue>{getStatusWord(activeSession ? 'working' : pet?.status)}</StatusValue>
            </StatusCell>
            <StatusCell>
              <StatusLabel>Level</StatusLabel>
              <StatusValue>{pet ? `Lv ${pet.level}` : '--'}</StatusValue>
            </StatusCell>
            <StatusCell>
              <StatusLabel>Stored XP</StatusLabel>
              <StatusValue>{pet ? pet.availableXp : '--'}</StatusValue>
            </StatusCell>
          </StatusStrip>

          <Bezel>
            <Lcd>
              <LcdTop>
                <ScreenHeading>
                  <ScreenTag>{activeViewMeta.caption}</ScreenTag>
                  <ScreenTitle>{activeViewMeta.title}</ScreenTitle>
                  <ScreenMessage>{activityMessage}</ScreenMessage>
                </ScreenHeading>

                {user && <LogoutButton onClick={() => void signOutUser()}>Logout</LogoutButton>}
              </LcdTop>

              <Viewport>
                {isEnvMissing && (
                  <Warning>
                    Firebase values are missing. Login and cloud save will stay offline until the
                    local environment file is configured.
                  </Warning>
                )}

                {renderView()}
              </Viewport>
            </Lcd>
          </Bezel>

          <Controls>
            {VIEW_OPTIONS.map((view) => (
              <ControlButton
                key={view.id}
                $active={activeView === view.id}
                onClick={() => {
                  startTransition(() => {
                    setActiveView(view.id);
                  });
                }}
                type="button"
              >
                <ControlLabel>{view.label}</ControlLabel>
                <ControlCaption>{view.caption}</ControlCaption>
              </ControlButton>
            ))}
          </Controls>

          <FooterHint>A select // B act // C back // D menu</FooterHint>
        </Device>
      </Screen>
    </>
  );
}
