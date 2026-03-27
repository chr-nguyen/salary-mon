import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { TimeEntry } from './useWorkSession';

export interface WorkEntryRecord {
  id: string;
  key: string;
  startDate: Date;
  endDate: Date | null;
  durationMinutes: number;
  xpEarned: number;
}

export interface DailyWorkSummary {
  key: string;
  label: string;
  totalMinutes: number;
  totalXp: number;
  sessions: number;
}

export interface MonthlyWorkSummary {
  monthKey: string;
  monthLabel: string;
  totalMinutes: number;
  totalHours: number;
  totalXp: number;
  workdays: number;
  averageMinutesPerWorkday: number;
  daily: DailyWorkSummary[];
  entries: WorkEntryRecord[];
}

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function createMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

function createMonthLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function useWorkHistory(userId?: string | null) {
  const [history, setHistory] = useState<DailyWorkSummary[]>([]);
  const [entries, setEntries] = useState<WorkEntryRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState<MonthlyWorkSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHistory() {
      if (!userId) {
        if (isMounted) {
          setHistory([]);
          setEntries([]);
          setCurrentMonth(null);
          setLoading(false);
        }
        return;
      }

      try {
        const historyQuery = query(
          collection(db, 'timeEntries'),
          where('userId', '==', userId),
          where('endTime', '!=', null),
        );

        const snapshot = await getDocs(historyQuery);
        const grouped = new Map<string, DailyWorkSummary>();
        const nextEntries: WorkEntryRecord[] = [];

        snapshot.docs.forEach((docSnap) => {
          const entry = docSnap.data() as TimeEntry;
          const startDate = entry.startTime.toDate();
          const endDate = entry.endTime ? entry.endTime.toDate() : null;
          const key = createDateKey(startDate);
          const existing = grouped.get(key);

          nextEntries.push({
            id: docSnap.id,
            key,
            startDate,
            endDate,
            durationMinutes: entry.durationMinutes,
            xpEarned: entry.xpEarned,
          });

          if (existing) {
            existing.totalMinutes += entry.durationMinutes;
            existing.totalXp += entry.xpEarned;
            existing.sessions += 1;
            return;
          }

          grouped.set(key, {
            key,
            label: createDateLabel(startDate),
            totalMinutes: entry.durationMinutes,
            totalXp: entry.xpEarned,
            sessions: 1,
          });
        });

        const nextHistory = Array.from(grouped.values()).sort((a, b) =>
          b.key.localeCompare(a.key),
        );

        nextEntries.sort((left, right) => right.startDate.getTime() - left.startDate.getTime());

        const now = new Date();
        const currentMonthKey = createMonthKey(now);
        const monthlyEntries = nextEntries.filter((entry) => createMonthKey(entry.startDate) === currentMonthKey);
        const monthlyDaily = nextHistory
          .filter((day) => day.key.startsWith(currentMonthKey))
          .sort((left, right) => left.key.localeCompare(right.key));

        const totalMinutes = monthlyDaily.reduce((sum, day) => sum + day.totalMinutes, 0);
        const totalXp = monthlyDaily.reduce((sum, day) => sum + day.totalXp, 0);
        const workdays = monthlyDaily.length;
        const monthlySummary =
          monthlyEntries.length === 0
            ? null
            : {
                monthKey: currentMonthKey,
                monthLabel: createMonthLabel(now),
                totalMinutes,
                totalHours: Number((totalMinutes / 60).toFixed(2)),
                totalXp,
                workdays,
                averageMinutesPerWorkday:
                  workdays === 0 ? 0 : Math.round(totalMinutes / workdays),
                daily: monthlyDaily,
                entries: monthlyEntries,
              };

        if (isMounted) {
          setHistory(nextHistory);
          setEntries(nextEntries);
          setCurrentMonth(monthlySummary);
        }
      } catch (error) {
        console.error('Error fetching work history:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchHistory();

    const interval = window.setInterval(() => {
      void fetchHistory();
    }, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [userId]);

  return { history, entries, currentMonth, loading };
}
