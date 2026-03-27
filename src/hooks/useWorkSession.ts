import { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc, Timestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';

export interface TimeEntry {
  id?: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  durationMinutes: number;
  xpEarned: number;
}

const XP_PER_MINUTE = 10;
const LEVEL_MULTIPLIER = 1000;

export function useWorkSession(userId: string) {
  const [activeSession, setActiveSession] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const entriesRef = collection(db, 'timeEntries');
    const q = query(entriesRef, where('userId', '==', userId), where('endTime', '==', null));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setActiveSession({ id: docSnap.id, ...docSnap.data() } as TimeEntry);
      } else {
        setActiveSession(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching active session:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const checkIn = async () => {
    if (activeSession || !userId) return;

    try {
      const newEntry = {
        userId,
        startTime: Timestamp.now(),
        endTime: null,
        durationMinutes: 0,
        xpEarned: 0,
      };
      await addDoc(collection(db, 'timeEntries'), newEntry);
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const checkOut = async (
    currentPetXp: number, 
    currentPetLevel: number, 
    currentAttributes: { efficiency: number, marketing: number, energy: number, research: number, talent: number }
  ) => {
    if (!activeSession || !activeSession.id || !userId) return;

    try {
      const now = Timestamp.now();
      const durationMs = now.toMillis() - activeSession.startTime.toMillis();
      const durationMinutes = Math.floor(durationMs / 60000); // converting ms to full minutes
      const xpEarned = durationMinutes * XP_PER_MINUTE;

      // Update time entry
      const entryRef = doc(db, 'timeEntries', activeSession.id);
      await updateDoc(entryRef, {
        endTime: now,
        durationMinutes,
        xpEarned
      });

      // Calculate new level logic
      let newXp = currentPetXp + xpEarned;
      let newLevel = currentPetLevel;
      
      let nextLevelXpRequired = currentPetLevel * LEVEL_MULTIPLIER;

      while (newXp >= nextLevelXpRequired) {
        newLevel++;
        nextLevelXpRequired = newLevel * LEVEL_MULTIPLIER;
      }

      // Calculate XP distribution
      const attrs = ['efficiency', 'marketing', 'energy', 'research', 'talent'] as const;
      const xpPerAttribute = Math.floor(xpEarned / attrs.length);
      const newAttributes = { ...currentAttributes };

      // Distribute evenly
      attrs.forEach(attr => {
        newAttributes[attr] += xpPerAttribute;
      });

      // Update pet stats
      const petRef = doc(db, 'salaryMons', userId);
      await updateDoc(petRef, {
        experience: newXp,
        level: newLevel,
        status: 'fed', // Set status after working
        attributes: newAttributes
      });

    } catch (error) {
      console.error("Error checking out:", error);
    }
  };

  return { activeSession, checkIn, checkOut, loading };
}
