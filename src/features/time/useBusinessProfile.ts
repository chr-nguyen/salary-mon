import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { EMPTY_BUSINESS_PROFILE, type BusinessProfile } from './types';

function normalizeBusinessProfile(raw?: Partial<BusinessProfile>): BusinessProfile {
  return {
    businessName: raw?.businessName?.trim() || '',
    contactName: raw?.contactName?.trim() || '',
    email: raw?.email?.trim() || '',
    addressLine1: raw?.addressLine1?.trim() || '',
    addressLine2: raw?.addressLine2?.trim() || '',
    cityStatePostal: raw?.cityStatePostal?.trim() || '',
    paymentTerms: raw?.paymentTerms?.trim() || EMPTY_BUSINESS_PROFILE.paymentTerms,
    currency: raw?.currency?.trim() || EMPTY_BUSINESS_PROFILE.currency,
    invoicePrefix: raw?.invoicePrefix?.trim() || EMPTY_BUSINESS_PROFILE.invoicePrefix,
  };
}

export function useBusinessProfile(userId?: string | null) {
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_BUSINESS_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfile(EMPTY_BUSINESS_PROFILE);
      setLoading(false);
      return;
    }

    const profileRef = doc(db, 'businessProfiles', userId);

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        setProfile(normalizeBusinessProfile(docSnap.data() as Partial<BusinessProfile> | undefined));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching business profile:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const saveProfile = async (nextProfile: BusinessProfile) => {
    if (!userId) {
      return false;
    }

    setSaving(true);

    try {
      await setDoc(doc(db, 'businessProfiles', userId), normalizeBusinessProfile(nextProfile), {
        merge: true,
      });
      return true;
    } catch (error) {
      console.error('Error saving business profile:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
  };
}
