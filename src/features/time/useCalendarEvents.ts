import { useEffect, useState } from 'react';
import {
  Timestamp,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { SyncedCalendarEvent } from './types';

function toIsoDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return typeof value === 'string' ? value : null;
}

function normalizeEvent(id: string, raw: Record<string, unknown>): SyncedCalendarEvent | null {
  const startAt = toIsoDate(raw.startAt);
  const endAt = toIsoDate(raw.endAt);

  if (!startAt || !endAt) {
    return null;
  }

  return {
    id,
    provider: 'google',
    googleEventId: typeof raw.googleEventId === 'string' ? raw.googleEventId : id,
    title: typeof raw.title === 'string' ? raw.title : 'Untitled meeting',
    status: typeof raw.status === 'string' ? raw.status : 'confirmed',
    isAllDay: raw.isAllDay === true,
    startAt,
    endAt,
    location: typeof raw.location === 'string' ? raw.location : null,
    htmlLink: typeof raw.htmlLink === 'string' ? raw.htmlLink : null,
  };
}

export function useCalendarEvents(userId?: string | null) {
  const [events, setEvents] = useState<SyncedCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const eventsQuery = query(
      collection(db, 'calendarConnections', userId, 'events'),
      where('endAt', '>=', Timestamp.now()),
      orderBy('endAt', 'asc'),
      limit(8),
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const nextEvents = snapshot.docs
          .map((document) => normalizeEvent(document.id, document.data()))
          .filter((event): event is SyncedCalendarEvent => Boolean(event));

        setEvents(nextEvents);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching synced calendar events:', error);
        setEvents([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    events,
    loading,
  };
}
