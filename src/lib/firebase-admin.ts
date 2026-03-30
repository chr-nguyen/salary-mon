import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getPrivateKey() {
  const raw = import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY;
  return raw ? raw.replace(/\\n/g, '\n') : null;
}

export function hasFirebaseAdminConfig() {
  return Boolean(
    import.meta.env.FIREBASE_ADMIN_PROJECT_ID &&
      import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      getPrivateKey(),
  );
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = import.meta.env.FIREBASE_ADMIN_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
