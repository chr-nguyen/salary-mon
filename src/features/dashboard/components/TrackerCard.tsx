import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Timestamp } from 'firebase/firestore';
import { XP_PER_MINUTE } from '../../game/gameplay';
import type { TimeEntry } from '../../time/useWorkSession';

const blink = keyframes`
  0%, 100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
`;

const Card = styled.section`
  padding: 10px;
  border: 2px solid #ffc85e;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 18%),
    linear-gradient(135deg, #3e2415 0%, #23160f 52%, #0f0d0c 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px -1px 0 rgba(0, 0, 0, 0.56),
    0 0 0 2px rgba(255, 111, 125, 0.16);

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
  border: 2px solid rgba(255, 200, 94, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 18%),
    linear-gradient(180deg, #472a1a 0%, #26180f 52%, #140f0d 100%);
`;

const Title = styled.h2`
  margin: 0;
  color: #ffc85e;
  font-size: 14px;
  text-transform: uppercase;
`;

const Note = styled.p`
  margin: 6px 0 0;
  color: #f4d9b7;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const RatePill = styled.div`
  padding: 4px 6px;
  border: 1px solid rgba(255, 200, 94, 0.28);
  background: rgba(8, 7, 6, 0.42);
  color: #ffc85e;
  font-size: 10px;
  text-transform: uppercase;
`;

const TimerShell = styled.div`
  margin-top: 10px;
  padding: 10px;
  border: 2px solid #c3ff6a;
  background:
    repeating-linear-gradient(0deg, rgba(195, 255, 106, 0.12) 0 2px, transparent 2px 4px),
    linear-gradient(180deg, #152409 0%, #101807 52%, #0a1006 100%);
  color: #d3ff98;
`;

const TimerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  text-transform: uppercase;
`;

const Indicator = styled.span`
  width: 8px;
  height: 8px;
  background: #ff6f7d;
  animation: ${blink} 1s steps(2, end) infinite;
`;

const Timer = styled.div`
  margin-top: 8px;
  font-family: "Courier New", monospace;
  font-size: 31px;
  font-weight: 700;
  letter-spacing: 0.08em;

  @media (min-width: 1280px) {
    font-size: 42px;
  }

  @media (min-width: 2200px) {
    font-size: 58px;
  }
`;

const Footnote = styled.div`
  margin-top: 8px;
  padding: 8px;
  border: 2px solid rgba(255, 200, 94, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 18%),
    linear-gradient(180deg, #281810 0%, #160f0b 100%);
  color: #f4d9b7;
  font-size: 12px;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const Button = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 10px;
  border: 1px solid #000;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #ff9aa5 0%, #ff6f7d 44%, #c5334a 100%)'
      : 'linear-gradient(180deg, #ffe795 0%, #ff9a5e 48%, #f3576c 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.24),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3);
  color: ${(props) => (props.$active ? '#3f0f1a' : '#3a130c')};
  padding: 10px 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;

  &::before {
    content: '>';
    font-size: 14px;
    line-height: 1;
  }
`;

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function TrackerCard({
  activeSession,
  onCheckIn,
  onCheckOut,
}: {
  activeSession: TimeEntry | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed(Timestamp.now().toMillis() - activeSession.startTime.toMillis());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession]);

  const liveXp = useMemo(() => Math.floor(elapsed / 60000) * XP_PER_MINUTE, [elapsed]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Session Timer</Title>
          <Note>
            Run the timer while you work. When the session ends, the minutes convert into XP.
          </Note>
        </div>
        <RatePill>{XP_PER_MINUTE} XP/min</RatePill>
      </Header>

      <TimerShell>
        <TimerHeader>
          <span>{activeSession ? 'Recording' : 'Standby'}</span>
          {activeSession ? <Indicator /> : <span>Off</span>}
        </TimerHeader>
        <Timer>{formatElapsed(elapsed)}</Timer>
      </TimerShell>

      <Footnote>
        {activeSession ? `Projected reward: ${liveXp} XP` : 'Start a session to bank new XP'}
      </Footnote>

      <Button $active={Boolean(activeSession)} onClick={activeSession ? onCheckOut : onCheckIn}>
        {activeSession ? 'End Session' : 'Start Session'}
      </Button>
    </Card>
  );
}
