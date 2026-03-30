import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  DEFAULT_SCHEDULE_PREFERENCES,
  type SchedulePreferences,
  type WorkdayKey,
} from './types';

const VALID_DAYS: WorkdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function normalizePreferences(raw?: Partial<SchedulePreferences>): SchedulePreferences {
  const activeDays = Array.isArray(raw?.activeDays)
    ? raw.activeDays.filter((day): day is WorkdayKey => VALID_DAYS.includes(day as WorkdayKey))
    : DEFAULT_SCHEDULE_PREFERENCES.activeDays;

  return {
    targetDaysPerWeek: Math.min(7, Math.max(1, Number(raw?.targetDaysPerWeek) || DEFAULT_SCHEDULE_PREFERENCES.targetDaysPerWeek)),
    activeDays: activeDays.length > 0 ? activeDays : DEFAULT_SCHEDULE_PREFERENCES.activeDays,
    dailyMaxHours: Math.max(1, Number(raw?.dailyMaxHours) || DEFAULT_SCHEDULE_PREFERENCES.dailyMaxHours),
    preferredStartHour: Math.min(
      20,
      Math.max(5, Number(raw?.preferredStartHour) || DEFAULT_SCHEDULE_PREFERENCES.preferredStartHour),
    ),
  };
}

export function useSchedulePreferences(userId?: string | null) {
  const [preferences, setPreferences] = useState<SchedulePreferences>(DEFAULT_SCHEDULE_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPreferences(DEFAULT_SCHEDULE_PREFERENCES);
      setLoading(false);
      return;
    }

    const preferencesRef = doc(db, 'schedulePreferences', userId);

    const unsubscribe = onSnapshot(
      preferencesRef,
      (docSnap) => {
        setPreferences(
          normalizePreferences(docSnap.data() as Partial<SchedulePreferences> | undefined),
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching schedule preferences:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const savePreferences = async (nextPreferences: SchedulePreferences) => {
    if (!userId) {
      return false;
    }

    setSaving(true);

    try {
      await setDoc(doc(db, 'schedulePreferences', userId), normalizePreferences(nextPreferences), {
        merge: true,
      });
      return true;
    } catch (error) {
      console.error('Error saving schedule preferences:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    savePreferences,
  };
}
