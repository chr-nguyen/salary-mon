import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import type { TimeEntry } from '../hooks/useWorkSession';

const CalendarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 0.5rem;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  
  /* Scrollbar styles */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1); 
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3); 
    border-radius: 4px;
  }
`;

const HistoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }
`;

const DateBox = styled.div`
  color: #ccc;
`;

const DurationBox = styled.div`
  font-weight: bold;
  color: #55efc4;
`;

export const WorkCalendar: React.FC<{ userId: string }> = ({ userId }) => {
  const [history, setHistory] = useState<{ date: string; totalMinutes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: For MVP we manually fetch it on mount. A real app might listen to updates.
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      try {
        const entriesRef = collection(db, 'timeEntries');
        // We need an index on userId + startTime to use orderBy here properly in Firestore,
        // but for MVP without composite index we can just fetch and sort locally
        const q = query(entriesRef, where('userId', '==', userId), where('endTime', '!=', null));
        
        const querySnapshot = await getDocs(q);
        
        const sessions = querySnapshot.docs.map(doc => doc.data() as TimeEntry);
        
        // Group by Date string (YYYY-MM-DD)
        const grouped = sessions.reduce((acc, session) => {
          const date = session.startTime.toDate().toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += session.durationMinutes;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by date descending
        const formatted = Object.keys(grouped).map(date => ({
          date,
          totalMinutes: grouped[date]
        }));
        
        // Basic rough sort (MM/DD/YYYY parsing)
        formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(formatted);
      } catch (e) {
        console.error("Error fetching work history", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // Auto-refresh interval (simplistic MVP approach)
    const interval = setInterval(fetchHistory, 60000); // 1 min sync
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) return null; // Or skeleton loader

  return (
    <CalendarContainer>
      <Title>Work Journal</Title>
      {history.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
          No recorded sessions yet. Start working to feed your Salary-mon!
        </div>
      ) : (
        <HistoryList>
          {history.map((record, index) => (
            <HistoryItem key={index}>
              <DateBox>{record.date}</DateBox>
              <DurationBox>{record.totalMinutes} mins</DurationBox>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </CalendarContainer>
  );
};
