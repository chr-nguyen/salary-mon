import React, { useState } from 'react';
import styled from 'styled-components';
import { useSalaryMon } from '../hooks/useSalaryMon';
import { useWorkSession } from '../hooks/useWorkSession';
import { SalaryMonPet } from './SalaryMonPet';
import { TimeTracker } from './TimeTracker';
import { Stats } from './Stats';
import { WorkCalendar } from './WorkCalendar';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  font-family: 'Inter', 'Segoe UI', sans-serif;
`;

const Title = styled.h1`
  color: white;
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 0 4px 6px rgba(0,0,0,0.2);
  letter-spacing: 2px;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1.5rem;
`;

const LoginWarning = styled.div`
  background: rgba(255, 0, 0, 0.2);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255,0,0,0.5);
  margin-bottom: 1rem;
`;

export const Dashboard: React.FC = () => {
  // For MVP, we will hardcode a single user ID. In production, this comes from Firebase Auth.
  const [userId] = useState('mvp-test-user-123');
  
  const { pet, loading: petLoading } = useSalaryMon(userId);
  const { activeSession, checkIn, checkOut, loading: sessionLoading } = useWorkSession(userId);

  if (petLoading || sessionLoading) {
    return (
      <DashboardContainer>
        <LoadingText>Loading your Salary-mon...</LoadingText>
      </DashboardContainer>
    );
  }

  // Determine if env vars are missing
  const isEnvMissing = !import.meta.env.PUBLIC_FIREBASE_API_KEY;

  return (
    <DashboardContainer>
      <Title>Salary-mon</Title>
      
      {isEnvMissing && (
        <LoginWarning>
          Warning: Firebase configuration variables (.env) are missing. Check the walkthrough to configure the database!
        </LoginWarning>
      )}

      {pet && (
        <SalaryMonPet 
          pet={pet} 
          isActive={!!activeSession} 
        />
      )}

      {pet && (
        <Stats pet={pet} />
      )}

      <TimeTracker 
        activeSession={activeSession} 
        onCheckIn={checkIn} 
        onCheckOut={() => checkOut(
          pet?.experience || 0, 
          pet?.level || 1, 
          pet?.attributes || { efficiency: 0, marketing: 0, energy: 0, research: 0, talent: 0 }
        )} 
      />

      <WorkCalendar userId={userId} />

    </DashboardContainer>
  );
};
