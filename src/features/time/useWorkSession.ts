import { useEffect, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { awardSessionXp } from '../game/gameplay';
import type { SalaryMon } from '../game/types';
import type { TimeEntryMetadata } from './types';

export interface TimeEntry extends TimeEntryMetadata {
  id?: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  durationMinutes: number;
  xpEarned: number;
}

export function useWorkSession(userId?: string | null) {
  const [activeSession, setActiveSession] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setActiveSession(null);
      setLoading(false);
      return;
    }

    const entriesRef = collection(db, 'timeEntries');
    const activeSessionQuery = query(
      entriesRef,
      where('userId', '==', userId),
      where('endTime', '==', null),
    );

    const unsubscribe = onSnapshot(
      activeSessionQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const activeDoc = snapshot.docs[0];
          setActiveSession({ id: activeDoc.id, ...activeDoc.data() } as TimeEntry);
        } else {
          setActiveSession(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error fetching active session:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const checkIn = async (metadata?: Partial<TimeEntryMetadata>) => {
    if (!userId || activeSession) {
      return;
    }

    try {
      const label = metadata?.label?.trim();

      await addDoc(collection(db, 'timeEntries'), {
        userId,
        startTime: Timestamp.now(),
        endTime: null,
        durationMinutes: 0,
        xpEarned: 0,
        clientId: metadata?.clientId || null,
        clientName: metadata?.clientName || null,
        label: label ? label.slice(0, 48) : null,
        billable: Boolean(metadata?.billable),
      });

      await setDoc(
        doc(db, 'salaryMons', userId),
        {
        status: 'working',
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const checkOut = async (pet: SalaryMon | null) => {
    if (!activeSession || !activeSession.id || !userId || !pet) {
      return;
    }

    try {
      const now = Timestamp.now();
      const durationMs = now.toMillis() - activeSession.startTime.toMillis();
      const durationMinutes = Math.floor(durationMs / 60000);
      const { xpEarned, patch } = awardSessionXp(pet, durationMinutes);

      await updateDoc(doc(db, 'timeEntries', activeSession.id), {
        endTime: now,
        durationMinutes,
        xpEarned,
      });

      await updateDoc(doc(db, 'salaryMons', userId), patch);
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  return { activeSession, loading, checkIn, checkOut };
}
