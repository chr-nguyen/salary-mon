import React, { useState } from "react";
import styled from "styled-components";
import { CozyShell, HomeGrid, type CozyView } from "../cozy/CozyShell";
import { AuthScreen } from "../auth/AuthScreen";
import { useAuthSession } from "../auth/useAuthSession";
import { useSalaryMon } from "../game/useSalaryMon";
import { useBusinessProfile } from "../time/useBusinessProfile";
import { useCalendarEvents } from "../time/useCalendarEvents";
import { useCalendarConnection } from "../time/useCalendarConnection";
import { useClients } from "../time/useClients";
import { useWorkHistory } from "../time/useWorkHistory";
import { useSchedulePreferences } from "../time/useSchedulePreferences";
import { useWorkSession } from "../time/useWorkSession";
import { BusinessProfileCard } from "./components/BusinessProfileCard";
import { CalendarConnectionCard } from "./components/CalendarConnectionCard";
import { ClientDeskCard } from "./components/ClientDeskCard";
import { GoalsCard } from "./components/GoalsCard";
import { InvoiceCard } from "./components/InvoiceCard";
import { JournalCard } from "./components/JournalCard";
import { MonthlyOverviewCard } from "./components/MonthlyOverviewCard";
import { PetCard } from "./components/PetCard";
import { PlannerCard } from "./components/PlannerCard";
import { ProfileCard } from "./components/ProfileCard";
import { ProgressCard } from "./components/ProgressCard";
import { TrackerCard } from "./components/TrackerCard";

type DashboardView = CozyView;
const ViewStack = styled.div`
  display: grid;
  gap: 16px;
`;
const UtilityGrid = styled.div`
  display: grid;
  gap: 16px;
  @media (min-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const SplashCard = styled.div`
  padding: 60px 20px;
  text-align: center;
`;
const Warning = styled.p`
  padding: 14px;
  background: #fff0e9;
  color: #983f39;
  border-radius: 12px;
`;

export function Dashboard() {
  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [calendarActionPending, setCalendarActionPending] = useState<
    "connect" | "sync" | "disconnect" | null
  >(null);
  const [calendarActionError, setCalendarActionError] = useState<string | null>(
    null,
  );
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
  const preferredName = user?.displayName || user?.email?.split("@")[0] || null;
  const {
    pet,
    loading: petLoading,
    upgradeAttribute,
    upgradePending,
    renamePet,
    updatePalette,
    updateCompanion,
    profilePending,
  } = useSalaryMon(userId, preferredName);
  const {
    clients,
    loading: clientsLoading,
    savingClientId,
    saveClient,
  } = useClients(userId);
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
  const { events: calendarEvents, loading: calendarEventsLoading } =
    useCalendarEvents(userId);
  const {
    preferences: schedulePreferences,
    loading: schedulePreferencesLoading,
    saving: schedulePreferencesSaving,
    savePreferences: saveSchedulePreferences,
  } = useSchedulePreferences(userId);
  const {
    activeSession,
    loading: sessionLoading,
    checkIn,
    checkOut,
  } = useWorkSession(userId);
  const {
    history,
    entries,
    currentMonth,
    loading: historyLoading,
  } = useWorkHistory(userId);
  const isGoogleCalendarClientIdConfigured = Boolean(
    import.meta.env.PUBLIC_GOOGLE_CALENDAR_CLIENT_ID,
  );

  const isEnvMissing = !import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const isLoading = authLoading || (!!user && (petLoading || sessionLoading));
  async function getFirebaseIdToken() {
    if (!user) {
      throw new Error("Sign in before connecting Google Calendar.");
    }

    return user.getIdToken();
  }

  async function handleCalendarConnect(settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) {
    setCalendarActionPending("connect");
    setCalendarActionError(null);

    try {
      const saved = await prepareCalendarConnection(settings);

      if (!saved) {
        throw new Error("Could not save calendar sync preferences.");
      }

      const idToken = await getFirebaseIdToken();
      const response = await fetch("/api/google-calendar/connect", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        authUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.authUrl) {
        throw new Error(
          payload.error || "Could not open Google Calendar OAuth.",
        );
      }

      window.location.assign(payload.authUrl);
    } catch (error) {
      setCalendarActionError(
        error instanceof Error
          ? error.message
          : "Could not connect Google Calendar.",
      );
      setCalendarActionPending(null);
    }
  }

  async function handleCalendarSync(settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) {
    setCalendarActionPending("sync");
    setCalendarActionError(null);

    try {
      const saved = await prepareCalendarConnection(settings);

      if (!saved) {
        throw new Error("Could not save calendar sync preferences.");
      }

      const idToken = await getFirebaseIdToken();
      const response = await fetch("/api/google-calendar/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not sync Google Calendar.");
      }
    } catch (error) {
      setCalendarActionError(
        error instanceof Error ? error.message : "Could not sync calendar.",
      );
    } finally {
      setCalendarActionPending(null);
    }
  }

  async function handleCalendarDisconnect() {
    setCalendarActionPending("disconnect");
    setCalendarActionError(null);

    try {
      const idToken = await getFirebaseIdToken();
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Could not disconnect Google Calendar.",
        );
      }
    } catch (error) {
      setCalendarActionError(
        error instanceof Error
          ? error.message
          : "Could not disconnect calendar.",
      );
    } finally {
      setCalendarActionPending(null);
    }
  }

  function renderView() {
    if (isLoading) {
      return <SplashCard>おへやの準備をしています…</SplashCard>;
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
      return <SplashCard>相棒を迎えています…</SplashCard>;
    }

    if (activeView === "home") {
      return (
        <HomeGrid>
          <PetCard
            pet={pet}
            onCompanionChange={updateCompanion}
            pending={profilePending}
          />
          <TrackerCard
            activeSession={activeSession}
            clients={clients}
            onCheckIn={checkIn}
            onCheckOut={() => checkOut(pet)}
          />
        </HomeGrid>
      );
    }

    if (activeView === "train") {
      return (
        <ProgressCard
          pet={pet}
          upgradePending={upgradePending}
          onUpgrade={upgradeAttribute}
        />
      );
    }

    if (activeView === "log") {
      return (
        <ViewStack>
          <MonthlyOverviewCard
            loading={historyLoading}
            summary={currentMonth}
          />
          <GoalsCard
            clients={clients}
            entries={entries}
            loading={historyLoading || clientsLoading}
          />
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
              calendarConnection.status === "connected" &&
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
          profilePending={profilePending || pendingAction === "profile"}
          userName={preferredName || "Trainer"}
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
    <CozyShell
      view={activeView}
      onViewChange={user ? setActiveView : undefined}
      onSignOut={user ? () => void signOutUser() : undefined}
    >
      {isEnvMissing && (
        <Warning>
          クラウド保存の設定がまだありません。体験版は /cozy-preview
          から開けます。
        </Warning>
      )}
      {renderView()}
    </CozyShell>
  );
}
