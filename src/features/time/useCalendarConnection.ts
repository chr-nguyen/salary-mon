import { useEffect, useState } from 'react';
import { Timestamp, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  DEFAULT_CALENDAR_CONNECTION,
  type CalendarConnection,
  type CalendarConnectionStatus,
} from './types';

function toIsoDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return typeof value === 'string' ? value : null;
}

function normalizeConnection(raw?: Partial<CalendarConnection>): CalendarConnection {
  return {
    status:
      raw?.status === 'ready_for_backend' ||
      raw?.status === 'connected' ||
      raw?.status === 'sync_error'
        ? raw.status
        : DEFAULT_CALENDAR_CONNECTION.status,
    provider: 'google',
    requestedScopes:
      Array.isArray(raw?.requestedScopes) && raw.requestedScopes.length > 0
        ? raw.requestedScopes.filter((scope): scope is string => typeof scope === 'string')
        : DEFAULT_CALENDAR_CONNECTION.requestedScopes,
    syncMode: 'read_only',
    calendarSelection: 'primary',
    showMeetingsInPlanner:
      typeof raw?.showMeetingsInPlanner === 'boolean'
        ? raw.showMeetingsInPlanner
        : DEFAULT_CALENDAR_CONNECTION.showMeetingsInPlanner,
    includeTentativeEvents:
      typeof raw?.includeTentativeEvents === 'boolean'
        ? raw.includeTentativeEvents
        : DEFAULT_CALENDAR_CONNECTION.includeTentativeEvents,
    requestedAt: toIsoDate(raw?.requestedAt),
    connectedAt: toIsoDate(raw?.connectedAt),
    lastSyncAt: toIsoDate(raw?.lastSyncAt),
    syncError: typeof raw?.syncError === 'string' ? raw.syncError : null,
  };
}

export function useCalendarConnection(userId?: string | null) {
  const [connection, setConnection] = useState<CalendarConnection>(DEFAULT_CALENDAR_CONNECTION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setConnection(DEFAULT_CALENDAR_CONNECTION);
      setLoading(false);
      return;
    }

    const connectionRef = doc(db, 'calendarConnections', userId);

    const unsubscribe = onSnapshot(
      connectionRef,
      (docSnap) => {
        setConnection(
          normalizeConnection(docSnap.data() as Partial<CalendarConnection> | undefined),
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching calendar connection:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const saveConnection = async (
    nextConnection: Partial<CalendarConnection>,
    statusOverride?: CalendarConnectionStatus,
  ) => {
    if (!userId) {
      return false;
    }

    setSaving(true);

    try {
      const base = normalizeConnection({
        ...connection,
        ...nextConnection,
      });

      const status = statusOverride || base.status;

      await setDoc(
        doc(db, 'calendarConnections', userId),
        {
          provider: 'google',
          status,
          requestedScopes: base.requestedScopes,
          syncMode: 'read_only',
          calendarSelection: 'primary',
          showMeetingsInPlanner: base.showMeetingsInPlanner,
          includeTentativeEvents: base.includeTentativeEvents,
          requestedAt:
            status === 'ready_for_backend' && !base.requestedAt
              ? Timestamp.now()
              : base.requestedAt
                ? Timestamp.fromDate(new Date(base.requestedAt))
                : null,
          connectedAt: base.connectedAt ? Timestamp.fromDate(new Date(base.connectedAt)) : null,
          lastSyncAt: base.lastSyncAt ? Timestamp.fromDate(new Date(base.lastSyncAt)) : null,
          syncError: base.syncError,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      return true;
    } catch (error) {
      console.error('Error saving calendar connection:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const prepareConnection = async (settings: {
    showMeetingsInPlanner: boolean;
    includeTentativeEvents: boolean;
  }) =>
    saveConnection(
      {
        ...connection,
        ...settings,
        syncError: null,
      },
      connection.status === 'connected' ? 'connected' : 'ready_for_backend',
    );

  const resetConnection = async () =>
    saveConnection(
      {
        ...DEFAULT_CALENDAR_CONNECTION,
      },
      'not_connected',
    );

  return {
    connection,
    loading,
    saving,
    prepareConnection,
    resetConnection,
  };
}
