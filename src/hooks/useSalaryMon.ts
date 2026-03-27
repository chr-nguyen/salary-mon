import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export interface SalaryMon {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  status: 'hungry' | 'fed' | 'sleeping';
  attributes: {
    efficiency: number;
    marketing: number;
    energy: number;
    research: number;
    talent: number;
  };
}

export function useSalaryMon(userId: string) {
  const [pet, setPet] = useState<SalaryMon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const petRef = doc(db, 'salaryMons', userId);

    const unsubscribe = onSnapshot(petRef, (docSnap) => {
      if (docSnap.exists()) {
        setPet(docSnap.data() as SalaryMon);
      } else {
        // Create initial pet if none exists for user
        const newPet: SalaryMon = {
          id: userId,
          userId,
          name: 'Mon-mon',
          level: 1,
          experience: 0,
          status: 'hungry',
          attributes: {
            efficiency: 0,
            marketing: 0,
            energy: 0,
            research: 0,
            talent: 0,
          }
        };
        setDoc(petRef, newPet);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pet:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { pet, loading };
}
