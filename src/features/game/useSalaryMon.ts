import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  buildAttributeUpgrade,
  buildPaletteUpdate,
  buildPetRename,
  createStarterSalaryMon,
  getMigrationPatch,
  normalizeSalaryMon,
} from './gameplay';
import type { SalaryMon, SalaryMonAttributeKey, SalaryMonPalette } from './types';

export function useSalaryMon(userId?: string | null, preferredName?: string | null) {
  const [pet, setPet] = useState<SalaryMon | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradePending, setUpgradePending] = useState<SalaryMonAttributeKey | null>(null);
  const [profilePending, setProfilePending] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPet(null);
      setLoading(false);
      return;
    }

    const petRef = doc(db, 'salaryMons', userId);

    const unsubscribe = onSnapshot(
      petRef,
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            const raw = docSnap.data() as Partial<SalaryMon>;
            const normalized = normalizeSalaryMon(userId, raw, preferredName);
            setPet(normalized);

            const patch = getMigrationPatch(raw, normalized);
            if (Object.keys(patch).length > 0) {
              await setDoc(petRef, patch, { merge: true });
            }
          } else {
            const starterPet = createStarterSalaryMon(userId, preferredName);
            await setDoc(petRef, starterPet);
          }
        } catch (error) {
          console.error('Error loading salary-mon:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching pet:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId, preferredName]);

  const upgradeAttribute = async (attribute: SalaryMonAttributeKey) => {
    if (!pet || !userId) {
      return false;
    }

    const patch = buildAttributeUpgrade(pet, attribute);

    if (!patch) {
      return false;
    }

    setUpgradePending(attribute);

    try {
      await updateDoc(doc(db, 'salaryMons', userId), patch);
      return true;
    } catch (error) {
      console.error('Error upgrading attribute:', error);
      return false;
    } finally {
      setUpgradePending(null);
    }
  };

  const renamePet = async (name: string) => {
    if (!userId) {
      return false;
    }

    const patch = buildPetRename(name);

    if (!patch) {
      return false;
    }

    setProfilePending(true);

    try {
      await updateDoc(doc(db, 'salaryMons', userId), patch);
      return true;
    } catch (error) {
      console.error('Error renaming pet:', error);
      return false;
    } finally {
      setProfilePending(false);
    }
  };

  const updatePalette = async (palette: SalaryMonPalette) => {
    if (!userId) {
      return false;
    }

    setProfilePending(true);

    try {
      await updateDoc(doc(db, 'salaryMons', userId), buildPaletteUpdate(palette));
      return true;
    } catch (error) {
      console.error('Error updating palette:', error);
      return false;
    } finally {
      setProfilePending(false);
    }
  };

  return {
    pet,
    loading,
    upgradeAttribute,
    upgradePending,
    renamePet,
    updatePalette,
    profilePending,
  };
}
