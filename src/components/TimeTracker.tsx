import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Timestamp } from 'firebase/firestore';
import type { TimeEntry } from '../hooks/useWorkSession';

const TrackerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button<{ active?: boolean }>`
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#ff4757' : '#2ed573'};
  color: white;
  box-shadow: 0 4px 0 ${props => props.active ? '#ff1e32' : '#26ad5e'};

  &:active {
    transform: translateY(4px);
    box-shadow: 0 0px 0 transparent;
  }
`;

const TimerText = styled.h2`
  font-size: 2.5rem;
  color: #f1f2f6;
  margin: 1rem 0;
  font-family: 'Courier New', Courier, monospace;
`;

export const TimeTracker: React.FC<{
  activeSession: TimeEntry | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}> = ({ activeSession, onCheckIn, onCheckOut }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession) {
      interval = setInterval(() => {
        const now = Timestamp.now().toMillis();
        const start = activeSession.startTime.toMillis();
        setElapsed(now - start);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <TrackerContainer>
      {activeSession ? (
        <>
          <TimerText>{formatTime(elapsed)}</TimerText>
          <Button active onClick={onCheckOut}>Check Out</Button>
        </>
      ) : (
        <Button onClick={onCheckIn}>Check In</Button>
      )}
    </TrackerContainer>
  );
};
