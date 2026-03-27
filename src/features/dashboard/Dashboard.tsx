import React, { startTransition, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { AuthScreen } from '../auth/AuthScreen';
import { useAuthSession } from '../auth/useAuthSession';
import { useSalaryMon } from '../game/useSalaryMon';
import { useWorkHistory } from '../time/useWorkHistory';
import { useWorkSession } from '../time/useWorkSession';
import { PetCard } from './components/PetCard';
import { ProgressCard } from './components/ProgressCard';
import { TrackerCard } from './components/TrackerCard';
import { JournalCard } from './components/JournalCard';
import { MonthlyOverviewCard } from './components/MonthlyOverviewCard';
import { InvoiceCard } from './components/InvoiceCard';
import { ProfileCard } from './components/ProfileCard';

const boot = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const blink = keyframes`
  0%, 100% {
    opacity: 0.35;
  }

  50% {
    opacity: 1;
  }
`;

const viewSwap = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
    filter: saturate(0.82);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: saturate(1);
  }
`;

type DashboardView = 'gameplay' | 'customization' | 'calendar';

const VIEW_OPTIONS: { id: DashboardView; label: string }[] = [
  { id: 'gameplay', label: 'Main Gameplay' },
  { id: 'customization', label: 'Character Customization' },
  { id: 'calendar', label: 'Calendar & Time' },
];

const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;
    --bg: #060811;
    --shell-top: #2d1c49;
    --shell-mid: #17132d;
    --shell-low: #0a0d17;
    --shell-edge: #7af0ff;
    --shell-shadow: #03040a;
    --screen-a: #2f2355;
    --screen-b: #17122f;
    --screen-c: #0b1021;
    --screen-d: #060812;
    --accent: #ffc85e;
    --accent-hot: #ff6f7d;
    --accent-cyan: #74efff;
    --accent-lime: #c3ff6a;
    --danger: #ff8fa3;
    --ink: #fffaf7;
    --ink-dim: #cfd5ee;
    --ink-low: #9ea8d6;
    font-family: "Trebuchet MS", Verdana, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  html {
    background: var(--bg);
  }

  body {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(circle at 18% 20%, rgba(255, 111, 125, 0.28) 0%, transparent 18%),
      radial-gradient(circle at 82% 18%, rgba(116, 239, 255, 0.22) 0%, transparent 20%),
      radial-gradient(circle at 50% 78%, rgba(255, 200, 94, 0.18) 0%, transparent 24%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.04) 25%, transparent 25%),
      linear-gradient(225deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%),
      linear-gradient(180deg, #251442 0%, #0e1226 46%, #05070e 100%);
    background-size: auto, auto, auto, 18px 18px, 18px 18px, auto;
    background-position: 0 0, 0 0, 0 0, 0 0, 9px 9px, 0 0;
    color: var(--ink);
  }
`;

const Screen = styled.main`
  min-height: 100vh;
  padding: 10px 10px 20px;

  @media (min-width: 800px) and (min-height: 560px) {
    display: grid;
    align-items: center;
    padding: 20px;
  }

  @media (min-width: 2200px) {
    padding: 40px;
  }
`;

const Device = styled.div`
  width: min(100%, 430px);
  margin: 0 auto;
  padding: 12px;
  border: 2px solid var(--shell-edge);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 14%),
    linear-gradient(145deg, #2c1f46 0%, #140f24 55%, #090b13 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.16),
    inset -1px -1px 0 rgba(0, 0, 0, 0.72),
    0 0 0 2px rgba(255, 111, 125, 0.22),
    0 0 0 4px rgba(116, 239, 255, 0.12),
    0 24px 50px rgba(0, 0, 0, 0.55);
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background:
      linear-gradient(115deg, transparent 0 28%, rgba(255, 111, 125, 0.12) 28% 32%, transparent 32% 100%),
      linear-gradient(290deg, transparent 0 68%, rgba(116, 239, 255, 0.12) 68% 72%, transparent 72% 100%);
  }

  &::after {
    border: 1px solid rgba(255, 255, 255, 0.08);
    inset: 6px;
  }

  @media (min-width: 800px) and (min-height: 560px) {
    width: min(96vw, 1060px);
    padding: 14px;
  }

  @media (min-width: 1280px) {
    width: min(94vw, 1320px);
    padding: 16px;
  }

  @media (min-width: 2200px) {
    width: min(88vw, 1880px);
    padding: 24px;
  }
`;

const Shell = styled.div`
  display: grid;
  gap: 10px;
  animation: ${boot} 140ms steps(6, end);

  @media (min-width: 800px) and (min-height: 560px) {
    gap: 14px;
  }

  @media (min-width: 2200px) {
    gap: 20px;
  }
`;

const Header = styled.header`
  position: relative;
  padding: 10px;
  border: 2px solid var(--shell-edge);
  background:
    radial-gradient(circle at 86% 18%, rgba(116, 239, 255, 0.18) 0 10%, transparent 11%),
    radial-gradient(circle at 14% 22%, rgba(255, 111, 125, 0.24) 0 12%, transparent 13%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.12) 0 22%, transparent 22% 100%),
    linear-gradient(135deg, #ff6f7d 0%, #7d2b89 28%, #2c1f75 62%, #10183f 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.24),
    inset -1px -1px 0 rgba(0, 0, 0, 0.42),
    0 0 0 2px rgba(10, 12, 29, 0.8);

  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 12px;
    width: 84px;
    height: 84px;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.22) 0 14%, transparent 16%),
      linear-gradient(180deg, transparent 0 44%, rgba(255, 255, 255, 0.12) 44% 56%, transparent 56% 100%),
      linear-gradient(90deg, transparent 0 44%, rgba(255, 255, 255, 0.12) 44% 56%, transparent 56% 100%);
    opacity: 0.7;
    pointer-events: none;
  }
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 9px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(8, 11, 27, 0.36);
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-shadow: 1px 1px 0 rgba(21, 28, 64, 0.9);

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--accent-cyan);
    box-shadow: 0 0 0 1px #04111d;
  }
`;

const UserPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(180deg, rgba(8, 17, 36, 0.5) 0%, rgba(8, 11, 27, 0.78) 100%);
  color: var(--ink);
  font-size: 11px;
  text-transform: uppercase;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px -1px 0 rgba(0, 0, 0, 0.45);
`;

const UserGem = styled.span`
  width: 8px;
  height: 8px;
  background: var(--accent);
  box-shadow: 0 0 0 1px #000;
  animation: ${blink} 1s steps(2, end) infinite;
`;

const Headline = styled.h1`
  margin: 10px 0 0;
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 37px;
  line-height: 0.9;
  letter-spacing: 0.02em;
  text-shadow:
    1px 1px 0 rgba(11, 17, 50, 0.95),
    2px 2px 0 rgba(11, 17, 50, 0.6),
    0 0 18px rgba(122, 240, 255, 0.18);

  @media (min-width: 1280px) {
    font-size: 46px;
  }

  @media (min-width: 2200px) {
    font-size: 68px;
  }
`;

const Summary = styled.p`
  margin: 10px 0 0;
  color: var(--ink-dim);
  font-size: 13px;
  line-height: 1.45;
  max-width: 70ch;
  text-shadow: 1px 1px 0 rgba(13, 20, 52, 0.75);

  @media (min-width: 1280px) {
    max-width: 72ch;
    font-size: 15px;
  }

  @media (min-width: 2200px) {
    font-size: 20px;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
`;

const MenuTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const MenuTab = styled.button<{ $active?: boolean }>`
  appearance: none;
  padding: 5px 9px;
  border: 1px solid ${(props) => (props.$active ? '#ffdc7d' : 'rgba(255, 255, 255, 0.2)')};
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #ffe795 0%, #ff9a5e 48%, #f3576c 100%)'
      : 'linear-gradient(180deg, rgba(11, 19, 41, 0.66) 0%, rgba(7, 12, 28, 0.92) 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.14),
    inset -1px -1px 0 rgba(0, 0, 0, 0.42);
  color: ${(props) => (props.$active ? '#3d140d' : '#f7f9ff')};
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 140ms ease,
    filter 140ms ease,
    border-color 140ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
  }
`;

const SignalRow = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--ink);
  font-size: 10px;
  text-transform: uppercase;
`;

const Signal = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(11, 19, 41, 0.66) 0%, rgba(7, 12, 28, 0.92) 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px -1px 0 rgba(0, 0, 0, 0.4);
`;

const SignalDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  background: ${(props) => props.$color};
  box-shadow: 0 0 0 1px #000;
`;

const GhostButton = styled.button`
  border: 1px solid var(--accent-cyan);
  background: linear-gradient(180deg, #86f5ff 0%, #2fb7e6 48%, #0f5f9d 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.35),
    inset -1px -1px 0 rgba(3, 38, 74, 0.5);
  color: #071829;
  padding: 7px 10px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const Warning = styled.div`
  padding: 10px;
  border: 2px solid #ffd8dd;
  background: linear-gradient(180deg, #7b3145 0%, #45192b 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.16),
    inset -1px -1px 0 rgba(0, 0, 0, 0.45),
    0 0 0 2px #2b1020;
  color: #ffd0d0;
  font-size: 12px;
  line-height: 1.45;
`;

const LoadingCard = styled.div`
  padding: 10px;
  border: 2px solid var(--shell-edge);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 40%),
    linear-gradient(180deg, var(--screen-a) 0%, var(--screen-b) 50%, var(--screen-c) 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.22),
    inset -1px -1px 0 rgba(0, 0, 0, 0.38),
    0 0 0 2px #1b2c66;
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const PanelsGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 800px) and (min-height: 560px) {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: start;
    gap: 14px;
  }

  @media (min-width: 1280px) {
    gap: 16px;
  }

  @media (min-width: 2200px) {
    gap: 22px;
  }
`;

const PanelSlot = styled.div<{
  $desktop?: string;
  $wide?: string;
  $ultra?: string;
}>`
  min-width: 0;

  @media (min-width: 800px) and (min-height: 560px) {
    grid-column: ${(props) => props.$desktop || 'span 12'};
  }

  @media (min-width: 1280px) {
    grid-column: ${(props) => props.$wide || props.$desktop || 'span 12'};
  }

  @media (min-width: 2200px) {
    grid-column: ${(props) => props.$ultra || props.$wide || props.$desktop || 'span 12'};
  }
`;

const ViewStage = styled.div`
  animation: ${viewSwap} 220ms ease;
`;

export function Dashboard() {
  const [activeView, setActiveView] = useState<DashboardView>('gameplay');
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

  const { pet, loading: petLoading, upgradeAttribute, upgradePending, renamePet, updatePalette, profilePending } = useSalaryMon(
    userId,
    preferredName,
  );
  const { activeSession, loading: sessionLoading, checkIn, checkOut } = useWorkSession(userId);
  const { history, currentMonth, loading: historyLoading } = useWorkHistory(userId);

  const isEnvMissing = !import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const isLoading = authLoading || (!!user && (petLoading || sessionLoading));

  function renderActiveView() {
    if (!pet) {
      return null;
    }

    if (activeView === 'gameplay') {
      return (
        <PanelsGrid>
          <PanelSlot $desktop="span 7" $wide="span 7">
            <PetCard pet={pet} />
          </PanelSlot>
          <PanelSlot $desktop="span 5" $wide="span 5">
            <TrackerCard
              activeSession={activeSession}
              onCheckIn={checkIn}
              onCheckOut={() => checkOut(pet)}
            />
          </PanelSlot>
          <PanelSlot $desktop="span 12" $wide="span 12">
            <ProgressCard
              pet={pet}
              upgradePending={upgradePending}
              onUpgrade={upgradeAttribute}
            />
          </PanelSlot>
        </PanelsGrid>
      );
    }

    if (activeView === 'customization') {
      return (
        <PanelsGrid>
          <PanelSlot $desktop="span 5" $wide="span 5">
            <PetCard pet={pet} />
          </PanelSlot>
          <PanelSlot $desktop="span 7" $wide="span 7">
            <ProfileCard
              onRenamePet={renamePet}
              onRenameUser={updateDisplayName}
              onUpdatePalette={updatePalette}
              pet={pet}
              profilePending={profilePending || pendingAction === 'profile'}
              userName={preferredName || 'Trainer'}
            />
          </PanelSlot>
          <PanelSlot $desktop="span 12" $wide="span 12">
            <ProgressCard
              pet={pet}
              upgradePending={upgradePending}
              onUpgrade={upgradeAttribute}
            />
          </PanelSlot>
        </PanelsGrid>
      );
    }

    return (
      <PanelsGrid>
        <PanelSlot $desktop="span 5" $wide="span 5">
          <TrackerCard
            activeSession={activeSession}
            onCheckIn={checkIn}
            onCheckOut={() => checkOut(pet)}
          />
        </PanelSlot>
        <PanelSlot $desktop="span 7" $wide="span 7">
          <MonthlyOverviewCard loading={historyLoading} summary={currentMonth} />
        </PanelSlot>
        <PanelSlot $desktop="span 12" $wide="span 12">
          <JournalCard history={history} loading={historyLoading} />
        </PanelSlot>
        <PanelSlot $desktop="span 12" $wide="span 12">
          <InvoiceCard summary={currentMonth} />
        </PanelSlot>
      </PanelsGrid>
    );
  }

  return (
    <>
      <GlobalStyle />

      <Screen>
        <Device>
          <Shell>
            <Header>
              <HeaderBar>
                <Kicker>Salary-mon OS</Kicker>
                {user && (
                  <UserPill>
                    <UserGem />
                    {preferredName || 'Trainer'}
                  </UserPill>
                )}
              </HeaderBar>

              <Headline>Raise a monster with your workday.</Headline>

              <Summary>
                Old-school digital pet energy, but for time tracking. Focus minutes become XP and
                XP becomes growth for your Salary-mon.
              </Summary>

              <MenuTabs>
                {VIEW_OPTIONS.map((view) => (
                  <MenuTab
                    key={view.id}
                    $active={activeView === view.id}
                    onClick={() => {
                      startTransition(() => {
                        setActiveView(view.id);
                      });
                    }}
                    type="button"
                  >
                    {view.label}
                  </MenuTab>
                ))}
              </MenuTabs>

              <HeaderControls>
                <SignalRow>
                  <Signal>
                    <SignalDot $color="#9fc28f" />
                    Auth
                  </Signal>
                  <Signal>
                    <SignalDot $color="#ffab4a" />
                    Save
                  </Signal>
                  <Signal>
                    <SignalDot $color="#ff7167" />
                    Evo
                  </Signal>
                </SignalRow>

                {user && <GhostButton onClick={() => void signOutUser()}>Logout</GhostButton>}
              </HeaderControls>
            </Header>

            {isEnvMissing && (
              <Warning>
                Firebase environment values are missing. Login and cloud save will not work until
                the local `.env` file is configured.
              </Warning>
            )}

            {isLoading ? (
              <LoadingCard>Booting Salary-mon...</LoadingCard>
            ) : !user ? (
              <AuthScreen
                error={authError}
                onCreateAccount={createAccount}
                onGoogle={signInWithGoogle}
                onSignIn={signInWithEmail}
                pendingAction={pendingAction}
              />
            ) : !pet ? (
              <LoadingCard>Generating creature data...</LoadingCard>
            ) : (
              <ViewStage key={activeView}>{renderActiveView()}</ViewStage>
            )}
          </Shell>
        </Device>
      </Screen>
    </>
  );
}
