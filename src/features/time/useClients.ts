import { useEffect, useState } from 'react';
import { Timestamp, addDoc, collection, onSnapshot, query, updateDoc, where, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { TrackingClient, TrackingClientInput } from './types';

function toNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeClient(
  id: string,
  userId: string,
  raw?: Partial<TrackingClient>,
): TrackingClient {
  return {
    id,
    userId,
    name: raw?.name?.trim() || 'Client',
    label: raw?.label?.trim() || '',
    weeklyGoalHours: Math.max(0, toNumber(raw?.weeklyGoalHours, 0)),
    weeklyLimitHours:
      typeof raw?.weeklyLimitHours === 'number' && Number.isFinite(raw.weeklyLimitHours)
        ? Math.max(0, raw.weeklyLimitHours)
        : null,
    hourlyRate: Math.max(0, toNumber(raw?.hourlyRate, 0)),
    billableDefault: Boolean(raw?.billableDefault),
  };
}

export function useClients(userId?: string | null) {
  const [clients, setClients] = useState<TrackingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingClientId, setSavingClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setClients([]);
      setLoading(false);
      return;
    }

    const clientsQuery = query(collection(db, 'clients'), where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        const nextClients = snapshot.docs
          .map((docSnap) =>
            normalizeClient(docSnap.id, userId, docSnap.data() as Partial<TrackingClient>),
          )
          .sort((left, right) => left.name.localeCompare(right.name));

        setClients(nextClients);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const saveClient = async (
    input: TrackingClientInput,
    existingClientId?: string | null,
  ) => {
    if (!userId) {
      return false;
    }

    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return false;
    }

    const payload = {
      userId,
      name: trimmedName.slice(0, 48),
      label: input.label?.trim().slice(0, 48) || '',
      weeklyGoalHours: Math.max(0, Number(input.weeklyGoalHours) || 0),
      weeklyLimitHours:
        input.weeklyLimitHours === null || input.weeklyLimitHours === undefined
          ? null
          : Math.max(0, Number(input.weeklyLimitHours) || 0),
      hourlyRate: Math.max(0, Number(input.hourlyRate) || 0),
      billableDefault: Boolean(input.billableDefault),
      updatedAt: Timestamp.now(),
    };

    setSavingClientId(existingClientId || '__new__');

    try {
      if (existingClientId) {
        await updateDoc(doc(db, 'clients', existingClientId), payload);
      } else {
        await addDoc(collection(db, 'clients'), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving client:', error);
      return false;
    } finally {
      setSavingClientId(null);
    }
  };

  return {
    clients,
    loading,
    savingClientId,
    saveClient,
  };
}
