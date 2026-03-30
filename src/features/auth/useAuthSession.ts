import { useEffect, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

type PendingAction = 'google' | 'create' | 'sign-in' | 'sign-out' | 'profile' | null;

function toFriendlyMessage(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unknown';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already linked to an account.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The email or password did not match an account.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before it finished.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Auth yet.';
    default:
      return 'Something went wrong while contacting Firebase Auth.';
  }
}

function shouldUseRedirect() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(max-width: 820px)').matches;
}

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void setPersistence(auth, browserLocalPersistence).catch((nextError) => {
      if (isMounted) {
        setError(toFriendlyMessage(nextError));
      }
    });

    void getRedirectResult(auth).catch((nextError) => {
      if (isMounted) {
        setError(toFriendlyMessage(nextError));
      }
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (!isMounted) {
          return;
        }

        setUser(nextUser);
        setLoading(false);
        setPendingAction(null);
      },
      (nextError) => {
        if (!isMounted) {
          return;
        }

        setError(toFriendlyMessage(nextError));
        setLoading(false);
        setPendingAction(null);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setPendingAction('google');
    setError(null);

    try {
      if (shouldUseRedirect()) {
        await signInWithRedirect(auth, googleProvider);
        return true;
      }

      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (nextError) {
      const code =
        typeof nextError === 'object' && nextError && 'code' in nextError
          ? String(nextError.code)
          : '';

      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return true;
      }

      setError(toFriendlyMessage(nextError));
      setPendingAction(null);
      return false;
    }
  };

  const createAccount = async ({
    displayName,
    email,
    password,
  }: {
    displayName: string;
    email: string;
    password: string;
  }) => {
    setPendingAction('create');
    setError(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName.trim()) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
        });
      }

      return true;
    } catch (nextError) {
      setError(toFriendlyMessage(nextError));
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const signInWithEmail = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setPendingAction('sign-in');
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (nextError) {
      setError(toFriendlyMessage(nextError));
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const signOutUser = async () => {
    setPendingAction('sign-out');
    setError(null);

    try {
      await signOut(auth);
    } catch (nextError) {
      setError(toFriendlyMessage(nextError));
    } finally {
      setPendingAction(null);
    }
  };

  const updateDisplayName = async (displayName: string) => {
    const trimmed = displayName.trim();

    if (!auth.currentUser || !trimmed) {
      return false;
    }

    setPendingAction('profile');
    setError(null);

    try {
      await updateProfile(auth.currentUser, {
        displayName: trimmed.slice(0, 24),
      });

      return true;
    } catch (nextError) {
      setError(toFriendlyMessage(nextError));
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  return {
    user,
    loading,
    error,
    pendingAction,
    createAccount,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    updateDisplayName,
  };
}
